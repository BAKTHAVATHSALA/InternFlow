const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

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
    res.json({ message: 'Project submitted', projectId: rows[0].id });
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
    if (!rows.length) return res.status(404).json({ error: 'Certificate not issued yet' });
    res.json(rows[0]);
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
