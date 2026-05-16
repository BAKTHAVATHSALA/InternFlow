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
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { module, action, user_email } = req.query;
    let query = 'SELECT * FROM audit_trail WHERE 1=1';
    const params = [];

    if (module) {
      params.push(module);
      query += ` AND module = $${params.length}`;
    }
    if (action) {
      params.push(action);
      query += ` AND action = $${params.length}`;
    }
    if (user_email) {
      params.push(user_email);
      query += ` AND user_email = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT 100';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
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
    // Convert to CSV string
    const headers = Object.keys(rows[0]).join(',');
    const csv = rows.map(row => Object.values(row).join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_trail.csv');
    res.send(`${headers}\n${csv}`);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

module.exports = router;
