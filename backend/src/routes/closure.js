const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/closure/exit-survey:
 *   post:
 *     summary: HR sends exit survey email to intern
 *     tags: [Closure]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Survey sent
 */
router.post('/exit-survey', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { intern_id } = req.body;
    await db.query("UPDATE applications SET status = 'closure_pending' WHERE intern_id = $1", [intern_id]);
    // Logic to send email would go here
    res.json({ message: 'Exit survey sent to intern' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send survey' });
  }
});

/**
 * @swagger
 * /api/closure/exit-survey/respond:
 *   post:
 *     summary: Intern submits exit survey response + rating
 *     tags: [Closure]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Survey submitted
 */
router.post('/exit-survey/respond', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    await db.query(
      "UPDATE applications SET status = 'survey_completed', exit_rating = $1, exit_feedback = $2 WHERE intern_id = $3",
      [rating, feedback, req.user.id]
    );
    res.json({ message: 'Exit survey submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

/**
 * @swagger
 * /api/closure/{internId}/checklist:
 *   patch:
 *     summary: HR updates closure checklist (access revoked, equipment returned etc.)
 *     tags: [Closure]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Checklist updated
 */
router.patch('/:internId/checklist', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { items_returned, access_revoked } = req.body;
    // Assuming a checklist table or column in applications
    await db.query(
      "UPDATE applications SET closure_metadata = COALESCE(closure_metadata, '{}'::jsonb) || $1::jsonb WHERE intern_id = $2",
      [JSON.stringify({ items_returned, access_revoked }), req.params.internId]
    );
    res.json({ message: 'Checklist updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

/**
 * @swagger
 * /api/closure:
 *   get:
 *     summary: HR views all closed internships with ratings
 *     tags: [Closure]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of closed internships
 */
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query("SELECT u.name, a.exit_rating, a.exit_feedback, a.updated_at FROM applications a JOIN users u ON a.intern_id = u.id WHERE a.status = 'closed'");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch closed internships' });
  }
});

module.exports = router;
