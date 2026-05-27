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
        (SELECT COUNT(*) FROM applications)                                                      AS total_applications,
        (SELECT COUNT(*) FROM applications WHERE status IN ('onboarded','completed'))            AS onboarded_count,
        (SELECT COUNT(*) FROM applications WHERE status IN ('applied','screened'))               AS pending_review,
        (SELECT COUNT(*) FROM applications WHERE status = 'offer_pending')                      AS offer_pending,
        (SELECT COUNT(*) FROM applications WHERE status = 'rejected')                           AS rejected_count,
        (SELECT ROUND(AVG(overall_score)) FROM ai_scores)                                       AS avg_ai_score,
        (SELECT COUNT(*) FROM referrals)                                                        AS total_referrals,
        (SELECT COUNT(*) FROM applications WHERE status = 'completed')                          AS completed_count,
        (SELECT COUNT(*) FROM applications WHERE status = 'onboarded')                          AS active_interns
    `);

    const { rows: byDept } = await db.query(`
      SELECT j.department, COUNT(*) AS count
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE a.status IN ('onboarded','completed')
      GROUP BY j.department
      ORDER BY count DESC
    `);

    const { rows: byStatus } = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM applications
      GROUP BY status
    `);

    res.json({ ...stats[0], by_dept: byDept, by_status: byStatus });
  } catch (err) {
    console.error('HR dashboard error:', err);
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
        (SELECT COUNT(*) FROM referrals WHERE employee_id = $1) as total_referrals,
        (SELECT COUNT(*) FROM referrals r JOIN applications a ON a.referral_id = r.id WHERE r.employee_id = $1 AND a.status = 'onboarded') as onboarded_referrals,
        (SELECT COALESCE(SUM(amount), 0) FROM rewards WHERE employee_id = $1) as total_rewards
    `, [req.user.id]);
    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee stats' });
  }
});

module.exports = router;
