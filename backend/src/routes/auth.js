const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const email = require('../services/emailService');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password (HR, Mentor, Employee Only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT * FROM public.users WHERE email = $1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    if (!user.password_hash) return res.status(401).json({ error: 'Password not set for this account. Use OTP login.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Signup for HR, Mentor, or Employee roles
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               role: { type: string, enum: [hr, employee, mentor] }
 *               department: { type: string }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: User already exists
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;
    
    // Check if exists
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash, name, role, department, status) VALUES ($1, $2, $3, $4, $5, \'active\') RETURNING id, name, role',
      [email, hash, name, role, department]
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

/**
 * @swagger
 * /auth/otp/send:
 *   post:
 *     summary: Send OTP to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Email not found
 */
router.post('/otp/send', async (req, res) => {
  try {
    const { email: userEmail } = req.body;
    if (!userEmail) return res.status(400).json({ error: 'Email required' });

    // Find user
    const { rows } = await db.query('SELECT id, name FROM users WHERE email = $1', [userEmail]);
    if (!rows.length) return res.status(404).json({ error: 'Email not found' });
    const user = rows[0];

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.query(
      'INSERT INTO otp_tokens (user_id, token_hash, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, hash, expiresAt, req.ip]
    );

    // Send OTP email
    await email.sendOtp({ to: userEmail, name: user.name, otp });

    res.json({ message: 'OTP sent', expiresIn: 600 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/otp/verify', async (req, res) => {
  try {
    const { email: userEmail, otp } = req.body;
    if (!userEmail || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    // Find user
    const { rows: users } = await db.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [userEmail]
    );
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const user = users[0];

    // Find latest valid OTP
    const { rows: tokens } = await db.query(
      `SELECT id, token_hash FROM otp_tokens
       WHERE user_id = $1 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    if (!tokens.length) return res.status(400).json({ error: 'OTP expired or not found' });

    // Verify OTP
    const valid = await bcrypt.compare(otp, tokens[0].token_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid OTP' });

    // Mark OTP used
    await db.query('UPDATE otp_tokens SET used = TRUE WHERE id = $1', [tokens[0].id]);

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.query(
      'INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [sessionId, user.id, await bcrypt.hash(sessionId, 8), req.ip, req.headers['user-agent'], expiresAt]
    );

    // Issue JWT
    const token = jwt.sign(
      { sessionId, userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update user status
    await db.query("UPDATE users SET status = 'active' WHERE id = $1", [user.id]);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt.decode(token);
    await db.query('DELETE FROM sessions WHERE id = $1', [payload.sessionId]);
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * @swagger
 * /auth/magic:
 *   get:
 *     summary: Validate magic link token and pre-fill intern email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Token valid
 *       400:
 *         description: Invalid or expired token
 */
router.get('/magic', async (req, res) => {
  try {
    const { token } = req.query;
    const { rows } = await db.query(
      'SELECT intern_email, job_id FROM referrals WHERE magic_link_token = $1 AND expires_at > NOW()',
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired token' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate magic link' });
  }
});

module.exports = router;
