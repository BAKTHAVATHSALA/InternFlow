const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/mentor/interns:
 *   get:
 *     summary: Mentor views all assigned interns with progress
 *     tags: [Mentor]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of interns
 */
router.get('/interns', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, a.status, 
      (SELECT COUNT(*) FROM lms_progress p WHERE p.intern_id = u.id AND p.completed = TRUE) as modules_completed
       FROM users u
       JOIN mentor_assignments ma ON ma.intern_id = u.id
       JOIN applications a ON a.intern_id = u.id
       WHERE ma.mentor_id = $1`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interns' });
  }
});

/**
 * @swagger
 * /api/mentor/interns/{internId}:
 *   get:
 *     summary: Mentor views full profile of one intern
 *     tags: [Mentor]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Intern profile
 */
router.get('/interns/:internId', authenticate, authorize('mentor', 'hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT u.name, u.email, a.* FROM users u JOIN applications a ON a.intern_id = u.id WHERE u.id = $1',
      [req.params.internId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Intern not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch intern profile' });
  }
});

/**
 * @swagger
 * /api/intern/mentor:
 *   get:
 *     summary: Intern views who their assigned mentor is
 *     tags: [Intern]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Mentor details
 */
router.get('/mentor-info', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT u.name, u.email FROM users u JOIN mentor_assignments ma ON ma.mentor_id = u.id WHERE ma.intern_id = $1',
      [req.user.id]
    );
    res.json(rows[0] || { message: 'No mentor assigned' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentor' });
  }
});

/**
 * @swagger
 * /api/mentor/feedback:
 *   post:
 *     summary: Mentor sends feedback message to intern
 *     tags: [Mentor]
 *     security: [bearerAuth: []]
 *     responses:
 *       201:
 *         description: Feedback sent
 */
router.post('/feedback', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { intern_id, message, type } = req.body;
    await db.query(
      'INSERT INTO feedback (mentor_id, intern_id, message, category) VALUES ($1, $2, $3, $4)',
      [req.user.id, intern_id, message, type || 'general']
    );
    res.status(201).json({ message: 'Feedback sent' });
  } catch (err) {
    console.error('Failed to send feedback:', err);
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});

/**
 * @swagger
 * /api/mentor/feedback/{internId}:
 *   get:
 *     summary: View feedback history for an intern
 *     tags: [Mentor]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Feedback history
 */
router.get('/feedback/:internId', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT f.*, u.name as mentor_name FROM feedback f JOIN users u ON f.mentor_id = u.id WHERE f.intern_id = $1 ORDER BY f.created_at DESC',
      [req.params.internId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;
