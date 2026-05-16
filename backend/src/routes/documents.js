const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/documents/joining-form:
 *   post:
 *     summary: Intern signs joining form (must come before NDA)
 *     tags: [Documents]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Signed
 */
router.post('/joining-form', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { signature_text } = req.body;
    await db.query(
      `INSERT INTO documents (intern_id, type, signature_text, signed_at, ip_address)
       VALUES ($1, 'joining_form', $2, NOW(), $3)
       ON CONFLICT (intern_id, type) DO UPDATE SET signature_text = $2, signed_at = NOW()`,
      [req.user.id, signature_text, req.ip]
    );
    res.json({ message: 'Joining form signed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign joining form' });
  }
});

/**
 * @swagger
 * /api/documents/nda:
 *   post:
 *     summary: Intern signs NDA — triggers onboarded status + reward
 *     tags: [Documents]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Signed
 */
router.post('/nda', authenticate, authorize('intern'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { signature_text } = req.body;
    
    // Insert document
    await client.query(
      `INSERT INTO documents (intern_id, type, signature_text, signed_at, ip_address)
       VALUES ($1, 'nda', $2, NOW(), $3)
       ON CONFLICT (intern_id, type) DO UPDATE SET signature_text = $2, signed_at = NOW()`,
      [req.user.id, signature_text, req.ip]
    );

    // Update status if joining form also exists
    const { rows: count } = await client.query("SELECT COUNT(*) FROM documents WHERE intern_id = $1 AND type IN ('joining_form', 'nda')", [req.user.id]);
    if (parseInt(count[0].count) >= 2) {
      await client.query("UPDATE applications SET status = 'documents_signed' WHERE intern_id = $1", [req.user.id]);
    }

    await client.query('COMMIT');
    res.json({ message: 'NDA signed' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to sign NDA' });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/documents/mine:
 *   get:
 *     summary: Intern views their signed documents + PDF download links
 *     tags: [Documents]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of signed documents
 */
router.get('/mine', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents WHERE intern_id = $1', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * @swagger
 * /api/documents/{internId}:
 *   get:
 *     summary: HR views all documents for a specific intern
 *     tags: [Documents]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Intern documents
 */
router.get('/:internId', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents WHERE intern_id = $1', [req.params.internId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch intern documents' });
  }
});

module.exports = router;
