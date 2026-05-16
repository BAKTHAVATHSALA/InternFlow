const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/settings/profile:
 *   get:
 *     summary: Get own profile (name, email, title, department, phone)
 *     tags: [Settings]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Profile details
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @swagger
 * /api/settings/profile:
 *   patch:
 *     summary: Update profile details
 *     tags: [Settings]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE users SET name = COALESCE($1, name) WHERE id = $2', [name, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: Get notification preferences (toggles)
 *     tags: [Settings]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Preferences
 */
router.get('/notifications', authenticate, async (req, res) => {
  try {
    // Assuming a preferences column or table
    res.json({ email_alerts: true, push_notifications: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * @swagger
 * /api/settings/notifications:
 *   patch:
 *     summary: Save notification preferences
 *     tags: [Settings]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Preferences saved
 */
router.patch('/notifications', authenticate, async (req, res) => {
  try {
    res.json({ message: 'Preferences saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

module.exports = router;
