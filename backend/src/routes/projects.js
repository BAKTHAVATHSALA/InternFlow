const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const email = require('../services/emailService');

/**
 * @swagger
 * /api/projects/submit:
 *   post:
 *     summary: Submit final project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project submitted
 */
router.post('/submit', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { github_url, demo_url, description, features } = req.body;
    const { rows: apps } = await db.query('SELECT id FROM applications WHERE intern_id = $1 LIMIT 1', [req.user.id]);
    if (!apps.length) return res.status(404).json({ error: 'Application not found' });

    const { rows } = await db.query(
      `INSERT INTO projects (intern_id, application_id, github_url, demo_url, description, features)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (intern_id) DO UPDATE SET
       github_url = $3, demo_url = $4, description = $5, features = $6, status = 'pending_review', updated_at = NOW()
       RETURNING id`,
      [req.user.id, apps[0].id, github_url, demo_url, description, features]
    );

    const { rows: mentor } = await db.query('SELECT mentor_id FROM mentor_assignments WHERE intern_id = $1', [req.user.id]);
    if (mentor.length) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'project_submitted', 'Project Submission', $2)`,
        [mentor[0].mentor_id, `Intern ${req.user.name} has submitted their final project for review.`]
      );
    }

    const projectId = rows[0].id;
    const internId = req.user.id;
    const internName = req.user.name;

    res.json({ message: 'Project submitted', projectId });

    // Auto-approve and complete the internship after 2 seconds
    // (mentor review feature is planned for a later phase)
    setTimeout(async () => {
      try {
        await db.query(
          `UPDATE projects SET status = 'approved', reviewed_at = NOW(), updated_at = NOW() WHERE id = $1`,
          [projectId]
        );
        await db.query(
          `UPDATE applications SET status = 'completed', updated_at = NOW() WHERE intern_id = $1`,
          [internId]
        );
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1, 'project_approved', 'Internship Completed!', 'Congratulations! Your project has been accepted and your internship is now complete. Thank you for being part of the team!')`,
          [internId]
        );
        console.log(`[AUTO-COMPLETE] Internship completed for intern ${internName} (${internId})`);
      } catch (err) {
        console.error('[AUTO-COMPLETE] Failed to auto-complete internship:', err);
      }
    }, 2000);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

/**
 * @swagger
 * /api/projects/{id}/review:
 *   patch:
 *     summary: Review intern project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review submitted
 */
router.patch('/:id/review', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const projectId = req.params.id;

    await db.query(
      `UPDATE projects SET status = $1, mentor_feedback = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4`,
      [status, feedback, req.user.id, projectId]
    );

    const { rows: proj } = await db.query('SELECT intern_id FROM projects WHERE id = $1', [projectId]);
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'project_approved', 'Project Review Update', $2)`,
      [proj[0].intern_id, `Your project has been reviewed. Status: ${status.replace('_', ' ')}.`]
    );

    if (status === 'approved') {
      await db.query("UPDATE applications SET status = 'completed' WHERE intern_id = $1", [proj[0].intern_id]);
    }
    res.json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

/**
 * @swagger
 * /api/projects/certificate/generate:
 *   post:
 *     summary: Generate certificate, send email, and return cert data
 *     tags: [Projects]
 *     security: [bearerAuth: []]
 */
router.post('/certificate/generate', authenticate, authorize('intern'), async (req, res) => {
  try {
    // Ensure table exists then patch any missing columns (table may already exist with fewer columns)
    await db.query(`CREATE TABLE IF NOT EXISTS certificates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      intern_id UUID NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_id TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS intern_name TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS role TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mentor_name TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS start_date TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS end_date TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ DEFAULT NOW()`);
    // Drop NOT NULL on every non-PK column so legacy schema never blocks inserts
    const { rows: notNullCols } = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'certificates'
        AND table_schema = 'public'
        AND is_nullable = 'NO'
        AND column_name NOT IN ('id', 'intern_id')
    `);
    for (const { column_name } of notNullCols) {
      await db.query(`ALTER TABLE certificates ALTER COLUMN "${column_name}" DROP NOT NULL`).catch(() => {});
    }
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_number TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS pdf_url TEXT`);

    // Return existing certificate if already generated
    const { rows: existing } = await db.query(
      'SELECT * FROM certificates WHERE intern_id = $1',
      [req.user.id]
    );
    if (existing.length) return res.json(existing[0]);

    // Fetch intern + project data
    const { rows: apps } = await db.query(
      `SELECT
         a.id AS application_id,
         COALESCE(NULLIF(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ''), u.name) AS intern_name,
         u.email AS intern_email,
         j.title AS role,
         a.onboarded_at,
         a.status,
         COALESCE(m.name, rm.name) AS mentor_name
       FROM applications a
       JOIN users u ON u.id = a.intern_id
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN referrals r ON r.id = a.referral_id
       LEFT JOIN mentor_assignments ma ON ma.intern_id = a.intern_id
       LEFT JOIN users m ON m.id = ma.mentor_id
       LEFT JOIN users rm ON rm.id = r.mentor_id
       WHERE a.intern_id = $1 AND a.status IN ('onboarded', 'completed')
       ORDER BY a.applied_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!apps.length) return res.status(400).json({ error: 'Internship not completed yet' });
    const app = apps[0];

    // When application status is 'completed' the project is implicitly approved
    if (app.status !== 'completed') {
      const { rows: proj } = await db.query(
        'SELECT status FROM projects WHERE intern_id = $1', [req.user.id]
      );
      if (!proj.length || proj[0].status !== 'approved') {
        return res.status(400).json({ error: 'Project not yet approved' });
      }
    }

    const certNum = String(Math.floor(1000 + Math.random() * 9000));
    const certId = `CERT-HEX-${new Date().getFullYear()}-${certNum.padStart(4, '0')}`;

    const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const startDate = app.onboarded_at ? fmt(app.onboarded_at) : 'Jun 2025';
    const endDate = fmt(new Date());

    const { rows: cert } = await db.query(
      `INSERT INTO certificates (intern_id, application_id, cert_id, cert_number, intern_name, role, mentor_name, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (intern_id) DO UPDATE
         SET application_id=$2, cert_id=$3, cert_number=$4, intern_name=$5, role=$6, mentor_name=$7, start_date=$8, end_date=$9, issued_at=NOW()
       RETURNING *`,
      [req.user.id, app.application_id, certId, certId, app.intern_name, app.role, app.mentor_name, startDate, endDate]
    );

    email.sendCertificateEmail({
      to: app.intern_email,
      internName: app.intern_name,
      mentorName: app.mentor_name || 'Your Mentor',
      roleName: app.role,
      startDate,
      endDate,
      certId,
    }).catch(err => console.error('[CERT EMAIL]', err));

    res.json(cert[0]);
  } catch (err) {
    console.error('[CERT GENERATE]', err);
    res.status(500).json({ error: 'Failed to generate certificate', detail: err.message });
  }
});

/**
 * @swagger
 * /api/projects/certificate:
 *   get:
 *     summary: Get project completion certificate
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificate data
 */
router.get('/certificate', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM certificates WHERE intern_id = $1', [req.user.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

/**
 * @swagger
 * /api/projects/mine:
 *   get:
 *     summary: Intern views their own project + review status + feedback
 *     tags: [Projects]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Project status
 */
router.get('/mine', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM projects WHERE intern_id = $1', [req.user.id]);
    res.json(rows[0] || { message: 'No project submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

module.exports = router;
