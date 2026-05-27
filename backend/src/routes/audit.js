const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: HR/Admin views full immutable audit log with filters
 *     tags: [Audit Trail]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Audit logs
 */
router.get('/stats', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        COUNT(*)                                                        AS total_events,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)             AS today_events,
        COUNT(DISTINCT user_email)                                     AS unique_users,
        COUNT(*) FILTER (WHERE user_role IN ('hr','admin'))            AS human_actions,
        COUNT(*) FILTER (WHERE user_role NOT IN ('hr','admin')
                            OR user_role IS NULL)                      AS system_actions
      FROM audit_trail
    `);
    const { rows: byModule } = await db.query(`
      SELECT module, COUNT(*) AS count
      FROM audit_trail
      GROUP BY module
      ORDER BY count DESC
    `);
    const { rows: byAction } = await db.query(`
      SELECT action, COUNT(*) AS count
      FROM audit_trail
      GROUP BY action
      ORDER BY count DESC
      LIMIT 8
    `);
    res.json({ ...rows[0], by_module: byModule, by_action: byAction });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit stats' });
  }
});

router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { module, action, user_email, search, page = 1, limit = 25 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (module) { params.push(module); where += ` AND module = $${params.length}`; }
    if (action) { params.push(action); where += ` AND action = $${params.length}`; }
    if (user_email) { params.push(user_email); where += ` AND user_email = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (user_email ILIKE $${params.length} OR action ILIKE $${params.length} OR module ILIKE $${params.length} OR entity_id::text ILIKE $${params.length})`;
    }

    const countRes = await db.query(`SELECT COUNT(*) AS total FROM audit_trail ${where}`, params);
    const total = parseInt(countRes.rows[0].total);

    params.push(parseInt(limit), offset);
    const { rows } = await db.query(
      `SELECT * FROM audit_trail ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Audit fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * @swagger
 * /api/audit/export:
 *   get:
 *     summary: Export audit logs as CSV file
 *     tags: [Audit Trail]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: CSV file content
 */
router.get('/export', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM audit_trail ORDER BY created_at DESC');
    if (!rows.length) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_trail.csv');
      return res.send('id,action,module,user_email,user_role,entity_id,created_at\n');
    }
    const headers = Object.keys(rows[0]).join(',');
    const csv = rows.map(row => Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_trail.csv');
    res.send(`${headers}\n${csv}`);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

module.exports = router;
