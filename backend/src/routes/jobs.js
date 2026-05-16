const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all open jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM jobs WHERE is_open = TRUE ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               department: { type: string }
 *               description: { type: string }
 *               tech_stack: { type: array, items: { type: string } }
 *               stipend: { type: number }
 *     responses:
 *       201:
 *         description: Job created
 */
router.post('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { 
      title, department, description, tech_stack, 
      stipend, duration_months, mode, location 
    } = req.body;

    const { rows } = await db.query(
      `INSERT INTO jobs (title, department, description, tech_stack, stipend, duration_months, mode, location, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [title, department, description, tech_stack, stipend, duration_months || 6, mode, location, req.user.id]
    );
    res.status(201).json({ message: 'Job created', jobId: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   patch:
 *     summary: Update job details (HR Only)
 *     tags: [Jobs]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job updated
 */
router.patch('/:id', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { title, stipend, is_open } = req.body;
    await db.query(
      'UPDATE jobs SET title = COALESCE($1, title), stipend = COALESCE($2, stipend), is_open = COALESCE($3, is_open), updated_at = NOW() WHERE id = $4',
      [title, stipend, is_open, req.params.id]
    );
    res.json({ message: 'Job updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Close/Archive a job (HR Only)
 *     tags: [Jobs]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job closed
 */
router.delete('/:id', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    await db.query('UPDATE jobs SET is_open = FALSE, updated_at = NOW() WHERE id = $1', [req.params.id]);
    res.json({ message: 'Job archived' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive job' });
  }
});

module.exports = router;
