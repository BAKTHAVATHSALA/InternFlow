const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/dashboard/hr:
 *   get:
 *     summary: HR dashboard stats
 *     tags: [Dashboard Stats]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: HR Statistics
 */
router.get('/hr', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows: stats } = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM applications WHERE status = 'onboarded') as active_interns,
        (SELECT COUNT(*) FROM referrals WHERE status = 'pending') as pending_referrals,
        (SELECT COUNT(*) FROM documents WHERE type = 'nda') as total_ndas
    `);
    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch HR stats' });
  }
});

/**
 * @swagger
 * /api/dashboard/intern:
 *   get:
 *     summary: Intern dashboard stats
 *     tags: [Dashboard Stats]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Intern Statistics
 */
router.get('/intern', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows: progress } = await db.query(`
      SELECT 
        (SELECT COALESCE(AVG(progress_pct), 0) FROM lms_progress WHERE intern_id = $1) as avg_progress,
        (SELECT name FROM users u JOIN mentor_assignments ma ON ma.mentor_id = u.id WHERE ma.intern_id = $1) as mentor_name
    `, [req.user.id]);
    res.json(progress[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch intern stats' });
  }
});

/**
 * @swagger
 * /api/dashboard/employee:
 *   get:
 *     summary: Employee dashboard stats
 *     tags: [Dashboard Stats]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Employee Statistics
 */
router.get('/employee', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { rows: stats } = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM referrals WHERE referrer_id = $1) as total_referrals,
        (SELECT COUNT(*) FROM referrals WHERE referrer_id = $1 AND status = 'onboarded') as onboarded_referrals,
        (SELECT COALESCE(SUM(amount), 0) FROM rewards WHERE user_id = $1) as total_rewards
    `, [req.user.id]);
    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee stats' });
  }
});

module.exports = router;
