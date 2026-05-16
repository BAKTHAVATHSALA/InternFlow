const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/lms/modules:
 *   get:
 *     summary: Intern gets all LMS modules with their completion status
 *     tags: [LMS]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of modules
 */
router.get('/modules', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT m.*, p.completed, p.progress_pct
       FROM lms_modules m
       LEFT JOIN lms_progress p ON p.module_id = m.id AND p.intern_id = $1
       ORDER BY m.sort_order ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

/**
 * @swagger
 * /api/lms/modules/{id}/complete:
 *   patch:
 *     summary: Intern marks a module complete — notifies mentor when all done
 *     tags: [LMS]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Module completed
 */
router.patch('/modules/:id/complete', authenticate, authorize('intern'), async (req, res) => {
  try {
    await db.query(
      `INSERT INTO lms_progress (intern_id, module_id, progress_pct, completed, completed_at)
       VALUES ($1, $2, 100, TRUE, NOW())
       ON CONFLICT (intern_id, module_id) DO UPDATE SET progress_pct = 100, completed = TRUE, completed_at = NOW()`,
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Module marked as complete' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete module' });
  }
});

/**
 * @swagger
 * /api/lms/progress/{internId}:
 *   get:
 *     summary: Mentor/HR views LMS progress for a specific intern
 *     tags: [LMS]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Progress details
 */
router.get('/progress/:internId', authenticate, authorize('mentor', 'hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT m.title, p.progress_pct, p.completed, p.completed_at
       FROM lms_modules m
       LEFT JOIN lms_progress p ON p.module_id = m.id AND p.intern_id = $1`,
      [req.params.internId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * @swagger
 * /api/lms/modules:
 *   post:
 *     summary: HR/Admin adds a new LMS module (PDF or video)
 *     tags: [LMS]
 *     security: [bearerAuth: []]
 *     responses:
 *       201:
 *         description: Module created
 */
router.post('/modules', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { title, description, content_url, type, sort_order } = req.body;
    const { rows } = await db.query(
      `INSERT INTO lms_modules (title, description, content_url, type, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, description, content_url, type, sort_order]
    );
    res.status(201).json({ message: 'Module created', moduleId: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create module' });
  }
});

module.exports = router;
