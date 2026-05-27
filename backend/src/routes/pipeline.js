const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const email = require('../services/emailService');

// GET /api/pipeline
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         a.id                    AS application_id,
         COALESCE(NULLIF(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ''), u.name) AS intern_name,
         u.email                 AS intern_email,
         j.title                 AS role,
         j.department,
         a.college,
         emp.name                AS referred_by,
         sc.overall_score        AS ai_score,
         sc.recommendation       AS ai_recommendation,
         a.status,
         a.applied_at,
         a.offered_at,
         a.onboarded_at,
         a.hr_note
       FROM applications a
       JOIN users u  ON u.id  = a.intern_id
       JOIN jobs  j  ON j.id  = a.job_id
       LEFT JOIN referrals r   ON r.id  = a.referral_id
       LEFT JOIN users emp     ON emp.id = r.employee_id
       LEFT JOIN ai_scores sc  ON sc.application_id = a.id
       ORDER BY a.applied_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch pipeline:', err);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// GET /api/pipeline/:id — full candidate profile for drawer
router.get('/:id', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS credentials_issued_at TIMESTAMPTZ`);
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS ppo_offered_at TIMESTAMPTZ`);
    const { rows } = await db.query(
      `SELECT
         a.id                    AS application_id,
         COALESCE(NULLIF(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ''), u.name) AS intern_name,
         u.email                 AS intern_email,
         a.phone,
         j.title                 AS role,
         j.department,
         j.stipend,
         j.duration_months,
         j.mode,
         j.location,
         a.college,
         a.degree,
         a.cgpa,
         a.grad_year,
         a.skills,
         a.resume_url,
         emp.name                AS referred_by,
         emp.email               AS referred_by_email,
         sc.overall_score        AS ai_score,
         sc.skills_match,
         sc.experience_fit,
         sc.strengths,
         sc.gaps,
         sc.improvement_tips,
         sc.recommendation       AS ai_recommendation,
         a.status,
         a.hr_note,
         a.applied_at,
         a.screened_at,
         a.offered_at,
         a.onboarded_at,
         a.credentials_issued_at,
         (a.credentials_issued_at IS NOT NULL) AS credentials_issued,
         a.ppo_offered_at,
         (a.ppo_offered_at IS NOT NULL) AS ppo_offered
       FROM applications a
       JOIN users u  ON u.id  = a.intern_id
       JOIN jobs  j  ON j.id  = a.job_id
       LEFT JOIN referrals r   ON r.id  = a.referral_id
       LEFT JOIN users emp     ON emp.id = r.employee_id
       LEFT JOIN ai_scores sc  ON sc.application_id = a.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Application not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to fetch candidate:', err);
    res.status(500).json({ error: 'Failed to fetch candidate details' });
  }
});

// PATCH /api/pipeline/:id/offer
router.patch('/:id/offer', authenticate, authorize('hr', 'admin'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    const appId = req.params.id;

    await client.query('BEGIN');

    const { rows: appRows } = await client.query(
      `SELECT a.*, u.email AS intern_email, u.name AS intern_user_name,
              a.intern_id,
              j.title AS role, j.stipend, j.duration_months, j.mode, j.location, j.department
       FROM applications a
       JOIN users u ON u.id = a.intern_id
       JOIN jobs  j ON j.id = a.job_id
       WHERE a.id = $1`,
      [appId]
    );
    if (!appRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }
    const app = appRows[0];

    if (['offer_pending', 'onboarded'].includes(app.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Offer already extended for this application' });
    }

    await client.query(
      `UPDATE applications SET status = 'offer_pending', offered_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [appId]
    );

    await client.query(
      `INSERT INTO audit_trail (user_id, user_email, user_role, action, entity_type, entity_id, module, old_value, new_value)
       VALUES ($1,$2,$3,'OFFER_EXTENDED','application',$4,$5,$6,$7)`,
      [req.user.id, req.user.email, req.user.role, appId,
       'Pipeline', JSON.stringify({ status: app.status }), JSON.stringify({ status: 'offer_pending' })]
    );

    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1,'offer_extended','Offer Extended!','Congratulations! An offer has been extended for your application. Log in to accept.')`,
      [app.intern_id]
    );

    await client.query('COMMIT');

    const internName = [app.first_name, app.last_name].filter(Boolean).join(' ') || app.intern_user_name;
    email.sendOfferEmail({
      to: app.intern_email,
      internName,
      roleName: app.role,
      stipend: app.stipend,
      durationMonths: app.duration_months,
      mode: app.mode,
      location: app.location,
      department: app.department,
    }).catch(err => console.error('[EMAIL] Offer email failed:', err));

    res.json({ message: 'Offer extended successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to extend offer:', err);
    res.status(500).json({ error: 'Failed to extend offer', detail: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/pipeline/:id/reject
router.patch('/:id/reject', authenticate, authorize('hr', 'admin'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    const appId = req.params.id;
    const { hr_note } = req.body;

    await client.query('BEGIN');

    const { rows: appRows } = await client.query(
      `SELECT a.*, u.email AS intern_email, u.name AS intern_user_name, a.intern_id,
              j.title AS role
       FROM applications a
       JOIN users u ON u.id = a.intern_id
       JOIN jobs  j ON j.id = a.job_id
       WHERE a.id = $1`,
      [appId]
    );
    if (!appRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }
    const app = appRows[0];

    if (app.status === 'rejected') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Application already rejected' });
    }

    await client.query(
      `UPDATE applications SET status = 'rejected', hr_note = COALESCE($2, hr_note), updated_at = NOW() WHERE id = $1`,
      [appId, hr_note || null]
    );

    await client.query(
      `INSERT INTO audit_trail (user_id, user_email, user_role, action, entity_type, entity_id, module, old_value, new_value)
       VALUES ($1,$2,$3,'APPLICATION_REJECTED','application',$4,$5,$6,$7)`,
      [req.user.id, req.user.email, req.user.role, appId,
       'Pipeline', JSON.stringify({ status: app.status }), JSON.stringify({ status: 'rejected' })]
    );

    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1,'application_rejected','Application Update','Thank you for applying. Unfortunately, we will not be moving forward at this time.')`,
      [app.intern_id]
    );

    await client.query('COMMIT');

    const internName = [app.first_name, app.last_name].filter(Boolean).join(' ') || app.intern_user_name;
    email.sendRejectionEmail({
      to: app.intern_email,
      internName,
      roleName: app.role,
      hrNote: hr_note,
    }).catch(err => console.error('[EMAIL] Rejection email failed:', err));

    res.json({ message: 'Application rejected' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to reject application:', err);
    res.status(500).json({ error: 'Failed to reject application', detail: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/pipeline/:id/stage (keep for compatibility)
router.patch('/:id/stage', authenticate, authorize('hr', 'admin'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { status, hr_note } = req.body;
    const appId = req.params.id;

    await client.query('BEGIN');

    const { rows: old } = await client.query('SELECT status, intern_id FROM applications WHERE id = $1', [appId]);
    if (!old.length) return res.status(404).json({ error: 'Application not found' });

    const onboardedAt = status === 'onboarded' ? ', onboarded_at = NOW()' : '';
    await client.query(
      `UPDATE applications SET status = $1, hr_note = COALESCE($2, hr_note), updated_at = NOW()${onboardedAt} WHERE id = $3`,
      [status, hr_note, appId]
    );

    await client.query(
      `INSERT INTO audit_trail (user_id, user_email, user_role, action, entity_type, entity_id, module, old_value, new_value)
       VALUES ($1,$2,$3,'STAGE_CHANGED','application',$4,$5,$6,$7)`,
      [req.user.id, req.user.email, req.user.role, appId,
       'Pipeline', JSON.stringify({ status: old[0].status }), JSON.stringify({ status })]
    );

    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1,'stage_changed','Application Update',$2)`,
      [old[0].intern_id, `Your application status has been updated to: ${status.replace(/_/g, ' ')}.`]
    );

    // When onboarded: sync referral status, assign mentor, credit reward, notify
    if (status === 'onboarded') {
      const { rows: refUpdate } = await client.query(
        `UPDATE referrals SET status = 'onboarded'
         WHERE id = (SELECT referral_id FROM applications WHERE id = $1 AND referral_id IS NOT NULL)
         RETURNING id, employee_id, mentor_id`,
        [appId]
      );

      if (refUpdate.length) {
        const { id: referralId, employee_id, mentor_id } = refUpdate[0];

        // Assign the mentor the employee selected during referral submission
        if (mentor_id) {
          await client.query(
            `INSERT INTO mentor_assignments (mentor_id, intern_id, application_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (intern_id) DO UPDATE SET mentor_id = EXCLUDED.mentor_id, assigned_at = NOW()`,
            [mentor_id, old[0].intern_id, appId]
          );
        }

        if (employee_id) {
          const { rows: existing } = await client.query(
            'SELECT id FROM rewards WHERE referral_id = $1', [referralId]
          );
          if (!existing.length) {
            await client.query(
              `INSERT INTO rewards (employee_id, referral_id, amount, status, credited_at)
               VALUES ($1, $2, 5000, 'pending', NOW())`,
              [employee_id, referralId]
            );
            await client.query(
              `INSERT INTO notifications (user_id, type, title, message)
               VALUES ($1, 'reward_credited', 'Reward Earned!', 'Your referred intern has been onboarded! ₹5,000 reward has been credited to your account.')`,
              [employee_id]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Stage updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update stage' });
  } finally {
    client.release();
  }
});

// POST /api/pipeline/:id/issue-credentials
router.post('/:id/issue-credentials', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const appId = req.params.id;

    // Ensure credential columns exist
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS work_email TEXT`);
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS intern_code TEXT`);
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS credentials_issued_at TIMESTAMPTZ`);

    const { rows } = await db.query(
      `SELECT
         a.intern_id,
         COALESCE(NULLIF(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ''), u.name) AS intern_name,
         u.email AS intern_email,
         a.status,
         a.credentials_issued_at,
         j.title AS role,
         COALESCE(m.name,  rm.name)  AS mentor_name,
         COALESCE(m.role,  rm.role)  AS mentor_role,
         COALESCE(ma.mentor_id, r.mentor_id) AS resolved_mentor_id
       FROM applications a
       JOIN users u ON u.id = a.intern_id
       JOIN jobs  j ON j.id = a.job_id
       LEFT JOIN referrals r           ON r.id  = a.referral_id
       LEFT JOIN mentor_assignments ma ON ma.intern_id = a.intern_id
       LEFT JOIN users m  ON m.id  = ma.mentor_id
       LEFT JOIN users rm ON rm.id = r.mentor_id
       WHERE a.id = $1`,
      [appId]
    );

    if (!rows.length) return res.status(404).json({ error: 'Application not found' });
    const app = rows[0];

    if (app.status !== 'onboarded') {
      return res.status(400).json({ error: 'Credentials can only be issued to onboarded interns' });
    }

    // Check if credentials were already issued
    if (app.credentials_issued_at) {
      return res.status(400).json({ error: 'Credentials have already been issued for this intern' });
    }

    // Ensure mentor_assignment exists — upsert from referral's mentor_id if assignment is missing
    if (app.resolved_mentor_id) {
      await db.query(
        `INSERT INTO mentor_assignments (mentor_id, intern_id, application_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (intern_id) DO UPDATE SET mentor_id = EXCLUDED.mentor_id, assigned_at = NOW()`,
        [app.resolved_mentor_id, app.intern_id, appId]
      );
    }

    // Generate credentials
    const nameParts = app.intern_name.trim().toLowerCase().split(/\s+/);
    const workEmail   = `${nameParts.join('.')}@hexaware.intern.io`;
    const firstName   = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    const tempPassword = `Hex@2025!${firstName}`;
    const internNum   = String(Math.floor(1000 + Math.random() * 9000));
    const internId    = `HEX-INTERN-2025-${internNum}`;
    const startDate   = '15 June 2025';

    // Persist credentials so the intern can view them in the portal
    await db.query(
      `UPDATE applications SET work_email = $1, intern_code = $2, credentials_issued_at = NOW() WHERE id = $3`,
      [workEmail, internId, appId]
    );

    email.sendCredentialsEmail({
      to: app.intern_email,
      internName: app.intern_name,
      workEmail,
      tempPassword,
      internId,
      mentorName:  app.mentor_name  || null,
      mentorTitle: app.mentor_role  || 'Senior Engineer',
      startDate,
    }).catch(err => console.error('[CREDENTIALS EMAIL]', err));

    await db.query(
      `INSERT INTO audit_trail (user_id, user_email, user_role, action, entity_type, entity_id, module, old_value, new_value)
       VALUES ($1,$2,$3,'CREDENTIALS_ISSUED','application',$4,$5,$6,$7)`,
      [req.user.id, req.user.email, req.user.role, appId,
       'Pipeline', JSON.stringify({}), JSON.stringify({ workEmail, internId })]
    );

    res.json({ message: 'Credentials issued', workEmail, internId });
  } catch (err) {
    console.error('[ISSUE CREDENTIALS]', err);
    res.status(500).json({ error: 'Failed to issue credentials', detail: err.message });
  }
});

// POST /api/pipeline/:id/ppo-offer — send PPO email only, no status change
router.post('/:id/ppo-offer', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    await db.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS ppo_offered_at TIMESTAMPTZ`);

    const { rows } = await db.query(
      `SELECT
         COALESCE(NULLIF(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ''), u.name) AS intern_name,
         u.email AS intern_email,
         j.title AS role,
         a.status,
         a.ppo_offered_at,
         COALESCE(m.name, rm.name) AS mentor_name
       FROM applications a
       JOIN users u ON u.id = a.intern_id
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN referrals r ON r.id = a.referral_id
       LEFT JOIN mentor_assignments ma ON ma.intern_id = a.intern_id
       LEFT JOIN users m ON m.id = ma.mentor_id
       LEFT JOIN users rm ON rm.id = r.mentor_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Application not found' });
    const app = rows[0];

    if (app.status !== 'completed') {
      return res.status(400).json({ error: 'PPO can only be offered to completed interns' });
    }

    await db.query(
      `UPDATE applications SET ppo_offered_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    email.sendPPOEmail({
      to: app.intern_email,
      internName: app.intern_name,
      roleName: app.role,
      mentorName: app.mentor_name || null,
    }).catch(err => console.error('[PPO EMAIL]', err));

    await db.query(
      `INSERT INTO audit_trail (user_id, user_email, user_role, action, entity_type, entity_id, module, old_value, new_value)
       VALUES ($1,$2,$3,'PPO_OFFERED','application',$4,$5,$6,$7)`,
      [req.user.id, req.user.email, req.user.role, req.params.id,
       'Pipeline', JSON.stringify({ status: 'completed' }), JSON.stringify({ ppo_offered: true })]
    );

    res.json({ message: 'PPO offer email sent' });
  } catch (err) {
    console.error('[PPO OFFER]', err);
    res.status(500).json({ error: 'Failed to send PPO offer', detail: err.message });
  }
});

// POST /api/pipeline/backfill-mentor-assignments
// Backfills mentor_assignments for all onboarded interns that have a mentor_id on their referral
// but no mentor_assignments record. Safe to run multiple times (ON CONFLICT DO NOTHING).
router.post('/backfill-mentor-assignments', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
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
    res.json({ message: 'Backfill complete', assigned: rowCount });
  } catch (err) {
    console.error('[MENTOR BACKFILL]', err);
    res.status(500).json({ error: 'Backfill failed', detail: err.message });
  }
});

module.exports = router;
