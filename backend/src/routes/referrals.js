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
  try {
    const {
      intern_name, intern_email, job_id,
      intern_college, intern_degree, intern_grad_year,
      resume_url, note_to_hr
    } = req.body;

    // 1. Create or find intern user
    let internId;
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [intern_email]);

    if (existing.length) {
      internId = existing[0].id;
    } else {
      const { rows: newUser } = await db.query(
        `INSERT INTO users (email, name, role, status)
         VALUES ($1, $2, 'intern', 'invited') RETURNING id`,
        [intern_email, intern_name]
      );
      internId = newUser[0].id;
    }

    // 2. Create referral
    const { rows: referral } = await db.query(
      `INSERT INTO referrals
       (employee_id, intern_id, job_id, status, intern_name, intern_email,
        intern_college, intern_degree, intern_grad_year, resume_url, note_to_hr)
       VALUES ($1,$2,$3,'pending',$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [req.user.id, internId, job_id, intern_name, intern_email,
       intern_college, intern_degree, intern_grad_year, resume_url, note_to_hr]
    );
    const referralId = referral[0].id;

    // 3. Generate magic link (mock)
    const magicToken = jwt.sign(
      { type: 'magic_link', email: intern_email, name: intern_name, role: 'intern' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Send invite email
    await email.sendReferralInvite({
      to: intern_email,
      internName: intern_name,
      referrerName: req.user.name,
      roleName: 'Intern Position', // Simplified
      magicLink: `${process.env.FRONTEND_URL}/login?token=${magicToken}`,
    });

    res.status(201).json({ message: 'Referral submitted', referralId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit referral' });
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
