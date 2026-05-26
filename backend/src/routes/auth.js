const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const email = require('../services/emailService');
const { authenticate, authorize } = require('../middleware/auth');

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

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.query(
      'INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [sessionId, user.id, await bcrypt.hash(sessionId, 8), req.ip, req.headers['user-agent'], expiresAt]
    );

    const token = jwt.sign(
      { sessionId, userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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
      'INSERT INTO users (email, password_hash, name, role, department, status) VALUES ($1, $2, $3, $4, $5, \'active\') RETURNING id, name, email, role',
      [email, hash, name, role, department]
    );

    const user = rows[0];
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.query(
      'INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [sessionId, user.id, await bcrypt.hash(sessionId, 8), req.ip, req.headers['user-agent'], expiresAt]
    );

    const token = jwt.sign(
      { sessionId, userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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

    // Only allow emails that have been referred
    const { rows: referralRows } = await db.query(
      'SELECT id FROM referrals WHERE intern_email = $1',
      [userEmail]
    );
    if (!referralRows.length) {
      return res.status(403).json({ error: 'Unauthorized: This email has not been referred. Please contact the employee who referred you.' });
    }

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

// POST /auth/intern/portal-login — work-email-only login for the intern portal
router.post('/intern/portal-login', async (req, res) => {
  try {
    const { email: workEmail } = req.body;
    if (!workEmail) return res.status(400).json({ error: 'Email is required' });

    if (!workEmail.toLowerCase().endsWith('@hexaware.intern.io')) {
      return res.status(401).json({ error: 'Only company work emails (@hexaware.intern.io) are accepted here' });
    }

    // Find intern whose issued work_email matches
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.role
       FROM applications a
       JOIN users u ON u.id = a.intern_id
       WHERE LOWER(a.work_email) = LOWER($1)
         AND a.status = 'onboarded'
       LIMIT 1`,
      [workEmail]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'No active intern account found for this email' });
    }
    const user = rows[0];

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1,$2,$3,$4,$5,$6)',
      [sessionId, user.id, await bcrypt.hash(sessionId, 8), req.ip, req.headers['user-agent'], expiresAt]
    );

    const token = jwt.sign(
      { sessionId, userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[INTERN PORTAL LOGIN]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /auth/intern/onboard-status — returns the intern's current application status
router.get('/intern/onboard-status', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT status FROM applications WHERE intern_id = $1 ORDER BY applied_at DESC LIMIT 1`,
      [req.user.id]
    );
    res.json({ status: rows[0]?.status || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// GET /auth/intern/credentials — fetch issued credentials for the logged-in intern
router.get('/intern/credentials', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         a.work_email,
         a.intern_code,
         a.credentials_issued_at,
         COALESCE(NULLIF(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ''), u.name) AS intern_name,
         m.name  AS mentor_name,
         m.role  AS mentor_title,
         j.title AS role
       FROM applications a
       JOIN users u  ON u.id  = a.intern_id
       JOIN jobs  j  ON j.id  = a.job_id
       LEFT JOIN mentor_assignments ma ON ma.intern_id = a.intern_id
       LEFT JOIN users m ON m.id = ma.mentor_id
       WHERE a.intern_id = $1 AND a.status = 'onboarded'
       ORDER BY a.onboarded_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Credentials not found' });
    const row = rows[0];

    // Reconstruct temp password deterministically from intern name
    const firstName = row.intern_name.trim().split(/\s+/)[0];
    const tempPassword = `Hex@2025!${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()}`;

    res.json({
      workEmail:    row.work_email,
      internCode:   row.intern_code,
      tempPassword,
      mentorName:   row.mentor_name  || null,
      mentorTitle:  row.mentor_title || null,
      role:         row.role,
      issuedAt:     row.credentials_issued_at,
    });
  } catch (err) {
    console.error('[INTERN CREDENTIALS]', err);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// POST /auth/onboard-complete — mark application as onboarded + send confirmation email
router.post('/onboard-complete', authenticate, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { batch, startDate } = req.body;

    console.log('[ONBOARD COMPLETE] user:', req.user.id, req.user.email, 'role:', req.user.role);

    // Find current application status for debugging
    const { rows: current } = await client.query(
      `SELECT id, status FROM applications WHERE intern_id = $1 ORDER BY applied_at DESC LIMIT 1`,
      [req.user.id]
    );
    console.log('[ONBOARD COMPLETE] current application:', current[0] || 'none found');

    await client.query('BEGIN');

    // Accept offer_pending OR already onboarded (idempotent)
    const { rows } = await client.query(
      `UPDATE applications
       SET status = 'onboarded', onboarded_at = COALESCE(onboarded_at, NOW()), updated_at = NOW()
       WHERE intern_id = $1
         AND status = 'offer_pending'
       RETURNING id`,
      [req.user.id]
    );

    console.log('[ONBOARD COMPLETE] rows updated:', rows.length);

    if (rows.length > 0) {
      await client.query(
        `INSERT INTO audit_trail (user_id, user_email, user_role, action, entity_type, entity_id, module, old_value, new_value)
         VALUES ($1,$2,$3,'ONBOARDING_COMPLETED','application',$4,$5,$6,$7)`,
        [req.user.id, req.user.email, req.user.role, rows[0].id,
         'Onboarding', JSON.stringify({ status: current[0]?.status }), JSON.stringify({ status: 'onboarded' })]
      );
    }

    await client.query('COMMIT');

    email.sendOnboardingConfirmEmail({
      to: req.user.email,
      internName: req.user.name,
      batch,
      startDate,
    }).catch(err => console.error('[ONBOARD EMAIL]', err));

    res.json({ message: 'Onboarding completed successfully', updated: rows.length > 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ONBOARD COMPLETE] error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding', detail: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
