const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/onboarding/provision:
 *   post:
 *     summary: HR issues work email, temp password, intern ID, assigns mentor
 *     tags: [Onboarding]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Provisioned
 */
router.post('/provision', authenticate, authorize('hr', 'admin'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { intern_id, mentor_id } = req.body;
    
    const { rows: user } = await client.query('SELECT name FROM users WHERE id = $1', [intern_id]);
    const email = `${user[0].name.toLowerCase().replace(' ', '.')}@hexaware.intern.io`;
    const tempPass = Math.random().toString(36).slice(-10);
    const internIdCode = `HEX-INT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await client.query(
      `INSERT INTO credentials (intern_id, work_email, temp_password, intern_id_code, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '90 days')`,
      [intern_id, email, tempPass, internIdCode]
    );

    if (mentor_id) {
      await client.query(
        'INSERT INTO mentor_assignments (mentor_id, intern_id) VALUES ($1, $2)',
        [mentor_id, intern_id]
      );
    }

    await client.query("UPDATE users SET status = 'active' WHERE id = $1", [intern_id]);
    await client.query("UPDATE applications SET status = 'onboarded' WHERE intern_id = $1", [intern_id]);

    await client.query('COMMIT');
    res.json({ message: 'Provisioning complete', email, internIdCode });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to provision intern' });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/onboarding:
 *   get:
 *     summary: HR views onboarding checklist for all active interns
 *     tags: [Onboarding]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of onboarding progress
 */
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS credentials_issued_at TIMESTAMPTZ`);
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS work_email TEXT`);
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS intern_code TEXT`);

    const { rows } = await db.query(`
      SELECT
        u.id,
        COALESCE(NULLIF(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ''), u.name) AS name,
        u.email,
        a.id                          AS application_id,
        a.status                      AS app_status,
        j.title                       AS role,
        j.department,
        a.onboarded_at,
        a.offered_at,
        a.credentials_issued_at,
        (a.credentials_issued_at IS NOT NULL) AS credentials_issued,
        a.work_email,
        a.intern_code,
        EXISTS(
          SELECT 1 FROM documents d WHERE d.intern_id = u.id AND d.type = 'nda'
        )                             AS nda_signed,
        m.name                        AS mentor_name
      FROM users u
      JOIN applications a ON a.intern_id = u.id
      JOIN jobs j         ON j.id = a.job_id
      LEFT JOIN mentor_assignments ma ON ma.intern_id = u.id
      LEFT JOIN users m               ON m.id = ma.mentor_id
      WHERE a.status IN ('offer_pending','onboarded','completed')
      ORDER BY
        CASE a.status
          WHEN 'onboarded'     THEN 1
          WHEN 'offer_pending' THEN 2
          WHEN 'completed'     THEN 3
        END,
        a.onboarded_at DESC NULLS LAST
    `);
    res.json(rows);
  } catch (err) {
    console.error('Onboarding list error:', err);
    res.status(500).json({ error: 'Failed to fetch onboarding list' });
  }
});

/**
 * @swagger
 * /api/onboarding/{internId}:
 *   get:
 *     summary: HR views onboarding progress for specific intern
 *     tags: [Onboarding]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Onboarding details
 */
router.get('/:internId', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM credentials WHERE intern_id = $1',
      [req.params.internId]
    );
    res.json(rows[0] || { message: 'Not provisioned' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * @swagger
 * /api/onboarding/credentials:
 *   get:
 *     summary: Intern views their issued work email + intern ID
 *     tags: [Onboarding]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Credentials
 */
router.get('/credentials', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT work_email, intern_id_code, expires_at FROM credentials WHERE intern_id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Credentials not issued yet' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

module.exports = router;
