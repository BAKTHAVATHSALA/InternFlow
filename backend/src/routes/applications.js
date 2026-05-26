const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const ai = require('../services/aiService');
const email = require('../services/emailService');

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Submit a new internship application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Application submitted
 */
router.post('/', authenticate, authorize('intern'), async (req, res) => {
  try {
    const {
      job_id, referral_id,
      first_name, last_name, phone, city,
      college, degree, cgpa, grad_year,
      github_url, portfolio_url,
      skills, checklist, resume_url,
    } = req.body;

    const { rows } = await db.query(
      `INSERT INTO applications
       (intern_id, job_id, referral_id, status,
        first_name, last_name, phone, city,
        college, degree, cgpa, grad_year,
        resume_url, github_url, portfolio_url, skills, checklist)
       VALUES ($1,$2,$3,'applied',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id`,
      [req.user.id, job_id, referral_id,
       first_name, last_name, phone, city,
       college, degree, cgpa, grad_year,
       resume_url, github_url, portfolio_url,
       skills, JSON.stringify(checklist)]
    );
    const applicationId = rows[0].id;

    // Update referral status if exists
    if (referral_id) {
      await db.query("UPDATE referrals SET status = 'applied' WHERE id = $1", [referral_id]);
    }

    // Trigger AI Screening (Async)
    (async () => {
      try {
        const { rows: job } = await db.query('SELECT title, description FROM jobs WHERE id = $1', [job_id]);
        const result = await ai.screenApplication({
          ...req.body,
          job_title: job[0].title,
          job_description: job[0].description
        });

        await db.query(
          `INSERT INTO ai_scores (application_id, overall_score, skills_match, experience_fit, strengths, gaps, improvement_tips, recommendation, raw_ai_response)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [applicationId, result.overall_score, result.skills_match, result.experience_fit, result.strengths, result.gaps, result.improvement_tips, result.recommendation, JSON.stringify(result)]
        );

        await db.query("UPDATE applications SET status = 'screened', screened_at = NOW() WHERE id = $1", [applicationId]);
      } catch (err) {
        console.error('Background AI Screening Failed:', err);
      }
    })();

    res.status(201).json({ message: 'Application submitted', applicationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

/**
 * @swagger
 * /api/applications/mine:
 *   get:
 *     summary: Get applications submitted by current user
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get('/mine', authenticate, authorize('intern'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, j.title AS role, j.stipend, j.duration_months, j.mode, j.location,
              sc.overall_score, sc.skills_match, sc.experience_fit,
              sc.strengths, sc.gaps, sc.recommendation,
              doc_j.signed_at AS joining_signed_at,
              doc_n.signed_at AS nda_signed_at,
              ma.mentor_id,
              mu.name AS mentor_name, mu.email AS mentor_email
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN ai_scores sc ON sc.application_id = a.id
       LEFT JOIN documents doc_j ON doc_j.intern_id = a.intern_id AND doc_j.type = 'joining_form'
       LEFT JOIN documents doc_n ON doc_n.intern_id = a.intern_id AND doc_n.type = 'nda'
       LEFT JOIN mentor_assignments ma ON ma.intern_id = a.intern_id
       LEFT JOIN users mu ON mu.id = ma.mentor_id
       WHERE a.intern_id = $1
       ORDER BY a.applied_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No application found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to fetch application:', err);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

/**
 * @swagger
 * /api/applications/onboard-apply:
 *   post:
 *     summary: Intern submits application from onboarding portal (synchronous AI screening)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Application submitted with AI scores
 */
router.post('/onboard-apply', authenticate, authorize('intern'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      firstName, lastName, phone, city,
      college, degree, cgpa, gradYear,
      skills = []
    } = req.body;

    await client.query('BEGIN');

    // 1. Fetch intern's referral to get job_id and referral_id automatically
    const { rows: refRows } = await client.query(
      `SELECT r.id AS referral_id, r.job_id
       FROM referrals r
       WHERE r.intern_id = $1
       ORDER BY r.created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!refRows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No referral found for this intern' });
    }
    const { referral_id, job_id } = refRows[0];

    // 2. Fetch job details for AI screening
    const { rows: jobRows } = await client.query(
      'SELECT title, description FROM jobs WHERE id = $1', [job_id]
    );
    if (!jobRows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Job not found' });
    }
    const job = jobRows[0];

    // 3. Insert application
    const { rows } = await client.query(
      `INSERT INTO applications
       (intern_id, job_id, referral_id, status,
        first_name, last_name, phone, city,
        college, degree, cgpa, grad_year, skills, resume_url)
       VALUES ($1,$2,$3,'applied',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [req.user.id, job_id, referral_id,
       firstName, lastName, phone, city,
       college, degree, cgpa || null, gradYear || null, skills, '']
    );
    const applicationId = rows[0].id;

    // 4. Update referral status
    await client.query(
      "UPDATE referrals SET status = 'applied' WHERE id = $1", [referral_id]
    );

    // 5. Run AI screening synchronously
    const startTime = Date.now();
    const aiResult = await ai.screenApplication({
      first_name: firstName,
      last_name: lastName,
      skills,
      college,
      degree,
      cgpa,
      job_title: job.title,
      job_description: job.description
    });
    const processedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    // 6. Save AI scores
    await client.query(
      `INSERT INTO ai_scores
       (application_id, overall_score, skills_match, experience_fit,
        strengths, gaps, improvement_tips, recommendation, raw_ai_response)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [applicationId,
       aiResult.overall_score, aiResult.skills_match, aiResult.experience_fit,
       aiResult.strengths || [], aiResult.gaps || [],
       aiResult.improvement_tips || [], aiResult.recommendation,
       JSON.stringify(aiResult)]
    );

    // 7. Mark application as screened
    await client.query(
      "UPDATE applications SET status = 'screened', screened_at = NOW() WHERE id = $1",
      [applicationId]
    );

    await client.query('COMMIT');

    // 8. Send HTML email to HR (fire-and-forget, don't block response)
    email.sendAIScreeningResultToHR({
      to: process.env.HR_EMAIL,
      internName: `${firstName} ${lastName}`.trim(),
      roleName: job.title,
      overallScore: aiResult.overall_score,
      skillsMatch: aiResult.skills_match || 0,
      experienceFit: aiResult.experience_fit || 0,
      strengths: aiResult.strengths || [],
      gaps: aiResult.gaps || [],
      recommendation: aiResult.recommendation,
      applicationId,
      processedSeconds: parseFloat(processedSeconds)
    }).catch(err => console.error('[EMAIL] Failed to send HR screening email:', err));

    res.status(201).json({
      applicationId,
      ai: {
        overall_score: aiResult.overall_score,
        skills_match: aiResult.skills_match || 0,
        experience_fit: aiResult.experience_fit || 0,
        strengths: aiResult.strengths || [],
        gaps: aiResult.gaps || [],
        improvement_tips: aiResult.improvement_tips || [],
        recommendation: aiResult.recommendation,
        processed_seconds: parseFloat(processedSeconds)
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('onboard-apply failed:', err);
    res.status(500).json({ error: 'Failed to submit application', detail: err.message });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/applications/pipeline:
 *   get:
 *     summary: Get full application pipeline (HR Only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pipeline details
 */
router.get('/pipeline', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM vw_pipeline');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

/**
 * @swagger
 * /api/applications/{id}/stage:
 *   patch:
 *     summary: Update application stage (HR Only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *               hr_note: { type: string }
 *     responses:
 *       200:
 *         description: Stage updated
 */
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
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'stage_changed', 'Application Update', $2)`,
      [intern[0].intern_id, `Your application status has been updated to: ${status.replace('_', ' ')}.`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Stage updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update stage' });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: View full candidate profile + AI score + docs (HR Only)
 *     tags: [Applications]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full candidate details
 */
router.get('/:id', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM vw_pipeline WHERE application_id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Application not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch application details' });
  }
});

/**
 * @swagger
 * /api/applications/{id}/accept-offer:
 *   post:
 *     summary: Intern accepts offer, unlocks document signing
 *     tags: [Applications]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Offer accepted
 */
router.post('/:id/accept-offer', authenticate, authorize('intern'), async (req, res) => {
  try {
    await db.query("UPDATE applications SET status = 'offer_accepted', updated_at = NOW() WHERE id = $1 AND intern_id = $2", [req.params.id, req.user.id]);
    res.json({ message: 'Offer accepted. Please proceed to document signing.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

/**
 * @swagger
 * /api/applications/{id}/ai-score:
 *   get:
 *     summary: Get detailed AI score breakdown for a candidate (HR Only)
 *     tags: [Applications]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: AI score breakdown
 */
router.get('/:id/ai-score', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM ai_scores WHERE application_id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'AI score not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AI score' });
  }
});

module.exports = router;
