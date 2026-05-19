const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/pipeline
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM vw_pipeline');
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch pipeline:', err);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// PATCH /api/pipeline/:id/stage
router.patch('/:id/stage', authenticate, authorize('hr', 'admin'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { status, hr_note } = req.body;
    const appId = req.params.id;

    await client.query('BEGIN');

    // Get old status for audit
    const { rows: old } = await client.query('SELECT status FROM applications WHERE id = $1', [appId]);
    if (!old.length) return res.status(404).json({ error: 'Application not found' });

    // Update application
    await client.query(
      `UPDATE applications SET status = $1, hr_note = COALESCE($2, hr_note), updated_at = NOW()
       WHERE id = $3`,
      [status, hr_note, appId]
    );

    // Log to audit trail
    await client.query(
      `INSERT INTO audit_trail (user_id, user_email, user_role, action, entity_type, entity_id, module, old_value, new_value)
       VALUES ($1, $2, $3, 'STAGE_CHANGED', 'application', $4, 'Pipeline', $5, $6)`,
      [req.user.id, req.user.email, req.user.role, appId, JSON.stringify({ status: old[0].status }), JSON.stringify({ status })]
    );

    // Create notification for intern
    const { rows: intern } = await client.query('SELECT intern_id FROM applications WHERE id = $1', [appId]);
    if (intern.length) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'stage_changed', 'Application Update', $2)`,
        [intern[0].intern_id, `Your application status has been updated to: ${status.replace('_', ' ')}.`]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Stage updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to update stage:', err);
    res.status(500).json({ error: 'Failed to update stage' });
  } finally {
    client.release();
  }
});

module.exports = router;
