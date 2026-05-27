const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, async (req, res) => {
  try {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS title      TEXT`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone      TEXT`);

    const { rows } = await db.query(
      'SELECT name, email, role, title, department, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, title, department, phone } = req.body;
    await db.query(
      `UPDATE users SET
         name       = COALESCE($1, name),
         title      = COALESCE($2, title),
         department = COALESCE($3, department),
         phone      = COALESCE($4, phone)
       WHERE id = $5`,
      [name || null, title || null, department || null, phone || null, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.patch('/password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
