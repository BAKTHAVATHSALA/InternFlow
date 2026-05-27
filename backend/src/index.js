const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
require('dotenv').config();
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Documentation
app.get('/api-docs', (req, res) => res.json(swaggerSpecs));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check
app.get('/', (req, res) => res.json({ message: 'InternFlow API is active', version: '1.0.0' }));
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/pipeline', require('./routes/pipeline'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/intern', require('./routes/mentor'));
app.use('/api/lms', require('./routes/lms'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/closure', require('./routes/closure'));
app.use('/api/audit-trail', require('./routes/audit'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`InternFlow API running on port ${PORT}`);

  // Backfill mentor_assignments for existing onboarded interns whose referral has a mentor_id
  try {
    const db = require('./db');
    const { rowCount } = await db.query(
      `INSERT INTO mentor_assignments (mentor_id, intern_id, application_id)
       SELECT DISTINCT r.mentor_id, a.intern_id, a.id
       FROM applications a
       JOIN referrals r ON r.id = a.referral_id
       WHERE a.status IN ('onboarded', 'completed')
         AND r.mentor_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM mentor_assignments ma WHERE ma.intern_id = a.intern_id
         )
       ON CONFLICT (intern_id) DO NOTHING`
    );
    if (rowCount > 0) console.log(`[STARTUP] Backfilled mentor assignments for ${rowCount} intern(s)`);
  } catch (err) {
    console.error('[STARTUP] Mentor backfill failed:', err.message);
  }
});
