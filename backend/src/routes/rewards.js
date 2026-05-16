const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/rewards/mine:
 *   get:
 *     summary: Employee views reward history and total earned
 *     tags: [Rewards]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of rewards
 */
router.get('/mine', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM rewards WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const total = rows.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    res.json({ history: rows, total_earned: total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

/**
 * @swagger
 * /api/rewards:
 *   get:
 *     summary: HR views all rewards across all employees
 *     tags: [Rewards]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: All rewards
 */
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT r.*, u.name as user_name FROM rewards r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

/**
 * @swagger
 * /api/rewards/{id}/pay:
 *   patch:
 *     summary: HR marks reward as paid after payroll processing
 *     tags: [Rewards]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reward paid
 */
router.patch('/:id/pay', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    await db.query("UPDATE rewards SET status = 'paid', updated_at = NOW() WHERE id = $1", [req.params.id]);
    res.json({ message: 'Reward marked as paid' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

module.exports = router;
