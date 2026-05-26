const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const email = require('../services/emailService');
const { authenticate, authorize } = require('../middleware/auth');

// Helper to get current cycle
function getCurrentCycle() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

/**
 * @swagger
 * /api/referrals/quota:
 *   get:
 *     summary: Get current referral quota
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quota details
 */
router.get('/quota', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT total_slots, used_slots, resets_at
       FROM referral_quotas
       WHERE employee_id = $1 AND cycle_label = $2`,
      [req.user.id, getCurrentCycle()]
    );
    const quota = rows[0] || { total_slots: 5, used_slots: 0, resets_at: new Date(Date.now() + 30*24*60*60*1000) };
    res.json({ remaining: quota.total_slots - quota.used_slots, ...quota });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quota' });
  }
});

/**
 * @swagger
 * /api/referrals/my-offer:
 *   get:
 *     summary: Get the job offer for the authenticated intern
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral and job details
 */
router.get('/my-offer', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         r.id AS referral_id,
         r.intern_name,
         r.intern_email,
         r.intern_college,
         r.status AS referral_status,
         r.created_at AS referred_at,
         j.id AS job_id,
         j.title,
         j.department,
         j.description,
         j.tech_stack,
         j.stipend,
         j.duration_months,
         j.mode,
         j.location,
         u.name AS referrer_name
       FROM referrals r
       JOIN jobs j ON j.id = r.job_id
       JOIN users u ON u.id = r.employee_id
       WHERE r.intern_id = $1
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No referral found for this intern' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to fetch intern offer:', err);
    res.status(500).json({ error: 'Failed to fetch offer details', detail: err.message });
  }
});

/**
 * @swagger
 * /api/referrals:
 *   post:
 *     summary: Submit a new intern referral
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intern_name: { type: string }
 *               intern_email: { type: string }
 *               job_id: { type: string }
 *     responses:
 *       201:
 *         description: Referral submitted
 */
router.post('/', authenticate, authorize('employee'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      intern_name, intern_email, job_id,
      intern_college, intern_degree, intern_grad_year,
      resume_url, note_to_hr
    } = req.body;

    await client.query('BEGIN');

    // 1. Check and fetch job details
    const { rows: jobRows } = await client.query(
      'SELECT title, stipend, duration_months, mode, location FROM jobs WHERE id = $1',
      [job_id]
    );
    if (!jobRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Job position not found' });
    }
    const job = jobRows[0];

    // 2. Fetch and check referral quota
    const cycle = getCurrentCycle();
    const { rows: quotaRows } = await client.query(
      `SELECT total_slots, used_slots 
       FROM referral_quotas 
       WHERE employee_id = $1 AND cycle_label = $2`,
      [req.user.id, cycle]
    );

    let quota = quotaRows[0];
    if (!quota) {
      // First insert if no quota exists
      const { rows: newQuota } = await client.query(
        `INSERT INTO referral_quotas (employee_id, cycle_label, total_slots, used_slots, resets_at)
         VALUES ($1, $2, 5, 0, NOW() + INTERVAL '30 days') RETURNING total_slots, used_slots`,
        [req.user.id, cycle]
      );
      quota = newQuota[0];
    }

    if (quota.used_slots >= quota.total_slots) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Referral quota limit reached for this cycle.' });
    }

    // 3. Create or find intern user
    let internId;
    const { rows: existing } = await client.query('SELECT id FROM users WHERE email = $1', [intern_email]);

    if (existing.length) {
      internId = existing[0].id;
    } else {
      const { rows: newUser } = await client.query(
        `INSERT INTO users (email, name, role, status)
         VALUES ($1, $2, 'intern', 'invited') RETURNING id`,
        [intern_email, intern_name]
      );
      internId = newUser[0].id;
    }

    // 4. Create referral entry
    const { rows: referral } = await client.query(
      `INSERT INTO referrals
       (employee_id, intern_id, job_id, status, intern_name, intern_email,
        intern_college, intern_degree, intern_grad_year, resume_url, note_to_hr)
       VALUES ($1,$2,$3,'pending',$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [req.user.id, internId, job_id, intern_name, intern_email,
       intern_college, intern_degree, intern_grad_year || null, resume_url, note_to_hr]
    );
    const referralId = referral[0].id;

    // 5. Update/Increment used slots in quota
    const { rows: updatedQuota } = await client.query(
      `UPDATE referral_quotas 
       SET used_slots = used_slots + 1 
       WHERE employee_id = $1 AND cycle_label = $2 
       RETURNING total_slots, used_slots`,
      [req.user.id, cycle]
    );
    const latestQuota = updatedQuota[0];

    // 6. Generate magic link (mock)
    const magicToken = jwt.sign(
      { type: 'magic_link', email: intern_email, name: intern_name, role: 'intern' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 7. Calculate applyBy date (1 month from now)
    const applyByDate = new Date();
    applyByDate.setDate(applyByDate.getDate() + 30);
    const applyByFormatted = applyByDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // 8. Send invite email to intern
    await email.sendReferralInvite({
      to: intern_email,
      internName: intern_name,
      referrerName: req.user.name,
      roleName: job.title,
      stipend: job.stipend,
      duration: job.duration_months || 6,
      mode: job.mode || 'offline',
      location: job.location || 'chennai',
      applyBy: applyByFormatted
    });

    // 9. Send confirmation email to referrer (employee)
    await email.sendReferralConfirmation({
      to: req.user.email,
      internName: intern_name,
      roleName: job.title,
      internEmail: intern_email,
      referralId: referralId,
      remainingSlots: latestQuota.total_slots - latestQuota.used_slots,
      totalSlots: latestQuota.total_slots
    });

    await client.query('COMMIT');
    res.status(201).json({ message: 'Referral submitted successfully', referralId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to process referral submission:', err);
    res.status(500).json({ error: 'Failed to submit referral', detail: err.message });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/referrals/mine:
 *   get:
 *     summary: Get referrals submitted by current user
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of referrals
 */
router.get('/mine', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, j.title AS role
       FROM referrals r
       JOIN jobs j ON j.id = r.job_id
       WHERE r.employee_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: View all referrals across employees (HR Only)
 *     tags: [Referrals]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of all referrals
 */
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT r.*, u.name as referrer_name FROM referrals r JOIN users u ON r.referrer_id = u.id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

/**
 * @swagger
 * /api/referrals/{id}:
 *   get:
 *     summary: Get single referral detail + intern profile (HR Only)
 *     tags: [Referrals]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Referral details
 */
router.get('/:id', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT r.*, u.name as referrer_name FROM referrals r JOIN users u ON r.referrer_id = u.id WHERE r.id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Referral not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referral' });
  }
});

module.exports = router;
