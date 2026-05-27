const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/rewards/mine:
 *   get:
 *     summary: Employee views reward history and totals
 *     tags: [Rewards]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: List of rewards with totals
 */
router.get('/mine', authenticate, authorize('employee'), async (req, res) => {
  try {
    // Backfill: create reward records for onboarded referrals that don't have one yet
    await db.query(
      `INSERT INTO rewards (employee_id, referral_id, amount, status, credited_at)
       SELECT r.employee_id, r.id, 5000, 'pending', COALESCE(a.onboarded_at, NOW())
       FROM referrals r
       JOIN applications a ON a.referral_id = r.id
       WHERE r.employee_id = $1
         AND a.status IN ('onboarded', 'completed')
         AND NOT EXISTS (SELECT 1 FROM rewards rw WHERE rw.referral_id = r.id)`,
      [req.user.id]
    );

    // Migrate existing 'payable' records to 'paid' for this employee
    await db.query(
      `UPDATE rewards SET status = 'paid', paid_at = COALESCE(paid_at, NOW())
       WHERE employee_id = $1 AND status = 'payable'`,
      [req.user.id]
    );

    const { rows } = await db.query(
      `SELECT r.*, ref.intern_name
       FROM rewards r
       LEFT JOIN referrals ref ON ref.id = r.referral_id
       WHERE r.employee_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    const total_earned = rows.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const total_redeemed = rows
      .filter(r => ['payable', 'paid'].includes(r.status))
      .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    res.json({ history: rows, total_earned, total_redeemed });
  } catch (err) {
    console.error('Failed to fetch rewards:', err);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

/**
 * @swagger
 * /api/rewards/redeem-all:
 *   post:
 *     summary: Employee requests redemption of all pending rewards
 *     tags: [Rewards]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: All pending rewards marked as payable
 */
router.post('/redeem-all', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "UPDATE rewards SET status = 'paid', paid_at = NOW() WHERE employee_id = $1 AND status = 'pending'",
      [req.user.id]
    );
    res.json({ message: 'Redemption request submitted', count: rowCount });
  } catch (err) {
    console.error('Failed to redeem rewards:', err);
    res.status(500).json({ error: 'Failed to redeem rewards' });
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
    const { rows } = await db.query(
      'SELECT r.*, u.name as user_name FROM rewards r JOIN users u ON r.employee_id = u.id ORDER BY r.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch rewards:', err);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

/**
 * @swagger
 * /api/rewards/{id}/redeem:
 *   patch:
 *     summary: Employee requests redemption of a single reward
 *     tags: [Rewards]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reward marked as payable
 */
router.patch('/:id/redeem', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id FROM rewards WHERE id = $1 AND employee_id = $2 AND status = 'pending'",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Reward not found or already redeemed' });

    await db.query("UPDATE rewards SET status = 'paid', paid_at = NOW() WHERE id = $1", [req.params.id]);
    res.json({ message: 'Redemption request submitted' });
  } catch (err) {
    console.error('Failed to redeem reward:', err);
    res.status(500).json({ error: 'Failed to redeem reward' });
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
    await db.query("UPDATE rewards SET status = 'paid', paid_at = NOW() WHERE id = $1", [req.params.id]);
    res.json({ message: 'Reward marked as paid' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

module.exports = router;
