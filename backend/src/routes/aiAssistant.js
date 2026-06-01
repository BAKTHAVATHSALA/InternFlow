const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

function getCurrentCycle() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

const callGemini = async (prompt) => {
  const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-lite-latest'];
  for (const model of models) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
        })
      }
    );
    const data = await res.json();
    if (data.error?.code === 429) continue;
    if (!res.ok) throw new Error(`Gemini ${model} error ${res.status}: ${data.error?.message}`);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
  }
  throw new Error('All Gemini models quota exhausted');
};

const fetchUserContext = async (userId, role) => {
  const context = {};

  if (role === 'employee') {
    const cycle = getCurrentCycle();
    const { rows: quota } = await db.query(
      `SELECT total_slots, used_slots, resets_at
       FROM referral_quotas WHERE employee_id = $1 AND cycle_label = $2`,
      [userId, cycle]
    );
    context.quota = quota[0] || { total_slots: 5, used_slots: 0 };

    const { rows: referrals } = await db.query(
      `SELECT r.intern_name, r.intern_email, r.status, r.created_at,
              j.title AS job_title,
              a.status AS application_status,
              s.overall_score AS ai_score,
              rw.status AS reward_status, rw.amount AS reward_amount
       FROM referrals r
       LEFT JOIN jobs j ON j.id = r.job_id
       LEFT JOIN applications a ON a.referral_id = r.id
       LEFT JOIN ai_scores s ON s.application_id = a.id
       LEFT JOIN rewards rw ON rw.referral_id = r.id
       WHERE r.employee_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [userId]
    );
    context.referrals = referrals;

  } else if (role === 'hr' || role === 'admin') {
    const { rows: stats } = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM applications)                                         AS total_applications,
        (SELECT COUNT(*) FROM applications WHERE status = 'onboarded')             AS active_interns,
        (SELECT COUNT(*) FROM applications WHERE status IN ('applied','screened')) AS pending_review,
        (SELECT COUNT(*) FROM applications WHERE status = 'offer_pending')         AS offer_pending,
        (SELECT COUNT(*) FROM applications WHERE status = 'rejected')              AS rejected_count,
        (SELECT COUNT(*) FROM applications WHERE status = 'completed')             AS completed_count,
        (SELECT COUNT(*) FROM applications WHERE status = 'documents_pending')     AS documents_pending,
        (SELECT COUNT(*) FROM referrals)                                           AS total_referrals
    `);
    context.stats = stats[0];

    const { rows: recentApps } = await db.query(`
      SELECT a.status, u.name AS candidate_name, j.title AS job_title, j.department,
             s.overall_score, s.recommendation, a.applied_at
      FROM applications a
      JOIN users u ON u.id = a.intern_id
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN ai_scores s ON s.application_id = a.id
      ORDER BY a.applied_at DESC
      LIMIT 8
    `);
    context.recent_apps = recentApps;

    const { rows: pendingDocs } = await db.query(`
      SELECT DISTINCT u.name AS intern_name,
        (SELECT signed_at FROM documents d WHERE d.intern_id = u.id AND d.type = 'joining_form') AS jf_signed_at,
        (SELECT signed_at FROM documents d WHERE d.intern_id = u.id AND d.type = 'nda') AS nda_signed_at
      FROM applications a
      JOIN users u ON u.id = a.intern_id
      WHERE a.status IN ('onboarded', 'documents_pending')
        AND (
          (SELECT signed_at FROM documents d WHERE d.intern_id = u.id AND d.type = 'joining_form') IS NULL
          OR (SELECT signed_at FROM documents d WHERE d.intern_id = u.id AND d.type = 'nda') IS NULL
        )
      LIMIT 5
    `);
    context.pending_docs = pendingDocs;

  } else if (role === 'intern') {
    const { rows: apps } = await db.query(`
      SELECT a.id, a.status, a.applied_at, a.onboarded_at,
             j.title AS job_title, j.department, j.stipend, j.duration_months, j.mode, j.location,
             s.overall_score, s.recommendation, s.strengths, s.gaps,
             u_ref.name AS referred_by
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN ai_scores s ON s.application_id = a.id
      LEFT JOIN referrals r ON r.id = a.referral_id
      LEFT JOIN users u_ref ON u_ref.id = r.employee_id
      WHERE a.intern_id = $1
      ORDER BY a.applied_at DESC
      LIMIT 1
    `, [userId]);
    context.application = apps[0] || null;

    const { rows: docs } = await db.query(
      `SELECT type, signed_at FROM documents WHERE intern_id = $1`,
      [userId]
    );
    context.documents = {
      joining_form: docs.find(d => d.type === 'joining_form') || null,
      nda: docs.find(d => d.type === 'nda') || null
    };

    const { rows: lms } = await db.query(`
      SELECT m.title, m.type, lp.progress_pct, lp.completed, lp.completed_at
      FROM lms_modules m
      LEFT JOIN lms_progress lp ON lp.module_id = m.id AND lp.intern_id = $1
      WHERE m.is_active = true
      ORDER BY m.sort_order
    `, [userId]);
    context.lms = lms;

    const { rows: project } = await db.query(
      `SELECT status, github_url, submitted_at, mentor_feedback FROM projects WHERE intern_id = $1 ORDER BY submitted_at DESC LIMIT 1`,
      [userId]
    );
    context.project = project[0] || null;

    const { rows: mentor } = await db.query(`
      SELECT u.name, u.email, u.department
      FROM mentor_assignments ma
      JOIN users u ON u.id = ma.mentor_id
      WHERE ma.intern_id = $1 AND ma.is_active = true
    `, [userId]);
    context.mentor = mentor[0] || null;

    const { rows: creds } = await db.query(
      `SELECT work_email, intern_id_code, password_changed, issued_at FROM credentials WHERE intern_id = $1`,
      [userId]
    );
    context.credentials = creds[0] || null;

    const { rows: cert } = await db.query(
      `SELECT cert_number, issued_at FROM certificates WHERE intern_id = $1`,
      [userId]
    );
    context.certificate = cert[0] || null;

  } else if (role === 'mentor') {
    const { rows: interns } = await db.query(`
      SELECT u.name, u.email, a.status AS app_status,
             p.status AS project_status, p.submitted_at AS project_submitted_at,
             (SELECT ROUND(AVG(progress_pct)) FROM lms_progress WHERE intern_id = u.id) AS avg_lms
      FROM mentor_assignments ma
      JOIN users u ON u.id = ma.intern_id
      JOIN applications a ON a.id = ma.application_id
      LEFT JOIN projects p ON p.intern_id = u.id
      WHERE ma.mentor_id = $1 AND ma.is_active = true
    `, [userId]);
    context.interns = interns;

    const { rows: pendingReviews } = await db.query(`
      SELECT u.name AS intern_name, p.submitted_at, p.github_url
      FROM projects p
      JOIN users u ON u.id = p.intern_id
      JOIN mentor_assignments ma ON ma.intern_id = p.intern_id
      WHERE ma.mentor_id = $1 AND ma.is_active = true AND p.status = 'pending_review'
      ORDER BY p.submitted_at ASC
    `, [userId]);
    context.pending_reviews = pendingReviews;

    const { rows: recentFeedback } = await db.query(`
      SELECT u.name AS intern_name, f.category, f.created_at
      FROM feedback f
      JOIN users u ON u.id = f.intern_id
      WHERE f.mentor_id = $1
      ORDER BY f.created_at DESC
      LIMIT 5
    `, [userId]);
    context.recent_feedback = recentFeedback;
  }

  return context;
};

const buildSystemPrompt = (user, context, role) => {
  const roleLabel = { hr: 'HR Manager', admin: 'Admin', employee: 'Employee', mentor: 'Mentor', intern: 'Intern' }[role] || 'User';
  let dataBlock = '';

  if (role === 'employee') {
    const q = context.quota;
    const remaining = (q?.total_slots || 5) - (q?.used_slots || 0);
    dataBlock = `
REFERRAL QUOTA (current quarter):
- Total slots: ${q?.total_slots || 5} | Used: ${q?.used_slots || 0} | Remaining: ${remaining}

MY REFERRALS (${context.referrals?.length || 0} total):
${context.referrals?.length
  ? context.referrals.map(r =>
      `- ${r.intern_name} → ${r.job_title || 'Unknown role'} | Referral: ${r.status} | Application: ${r.application_status || 'Not applied yet'} | AI Score: ${r.ai_score ?? 'N/A'} | Reward: ${r.reward_status ? `₹${r.reward_amount} (${r.reward_status})` : 'N/A'}`
    ).join('\n')
  : 'No referrals submitted yet.'}`;

  } else if (role === 'hr' || role === 'admin') {
    const s = context.stats || {};
    dataBlock = `
PLATFORM OVERVIEW:
- Total Applications: ${s.total_applications || 0}
- Active Interns: ${s.active_interns || 0}
- Pending Review: ${s.pending_review || 0}
- Offer Pending: ${s.offer_pending || 0}
- Rejected: ${s.rejected_count || 0}
- Completed Internships: ${s.completed_count || 0}
- Pending Documents: ${s.documents_pending || 0}
- Total Referrals: ${s.total_referrals || 0}

RECENT APPLICATIONS (latest 8):
${context.recent_apps?.length
  ? context.recent_apps.map(a =>
      `- ${a.candidate_name} → ${a.job_title} (${a.department}) | Status: ${a.status} | AI: ${a.overall_score ? `${a.overall_score}/100 (${a.recommendation})` : 'pending'}`
    ).join('\n')
  : 'No applications yet.'}

INTERNS WITH INCOMPLETE DOCUMENTS:
${context.pending_docs?.length
  ? context.pending_docs.map(d =>
      `- ${d.intern_name}: Joining Form: ${d.jf_signed_at ? 'Signed' : 'PENDING'} | NDA: ${d.nda_signed_at ? 'Signed' : 'PENDING'}`
    ).join('\n')
  : 'All documents complete.'}`;

  } else if (role === 'intern') {
    const app = context.application;
    const jf = context.documents?.joining_form;
    const nda = context.documents?.nda;
    const lmsTotal = context.lms?.length || 0;
    const lmsDone = context.lms?.filter(m => m.completed).length || 0;
    const lmsAvg = lmsTotal > 0
      ? Math.round(context.lms.reduce((s, m) => s + (m.progress_pct || 0), 0) / lmsTotal)
      : 0;
    dataBlock = `
APPLICATION:
- Role: ${app?.job_title || 'N/A'} (${app?.department || 'N/A'})
- Status: ${app?.status || 'No application found'}
- AI Screening Score: ${app?.overall_score ? `${app.overall_score}/100 — ${app.recommendation}` : 'Not scored yet'}
- Referred By: ${app?.referred_by || 'Direct application'}
- Stipend: ${app?.stipend ? `₹${app.stipend}/month` : 'N/A'} | Duration: ${app?.duration_months ? `${app.duration_months} months` : 'N/A'} | Mode: ${app?.mode || 'N/A'}

DOCUMENTS:
- Joining Form: ${jf ? (jf.signed_at ? `Signed on ${new Date(jf.signed_at).toLocaleDateString()}` : 'Submitted — awaiting signature') : 'Not submitted yet'}
- NDA: ${nda ? (nda.signed_at ? `Signed on ${new Date(nda.signed_at).toLocaleDateString()}` : 'Submitted — awaiting signature') : 'Not submitted yet'}

LEARNING PROGRESS:
- ${lmsDone}/${lmsTotal} modules complete | Average: ${lmsAvg}%
${context.lms?.length
  ? context.lms.map(m => `  • ${m.title} (${m.type}): ${m.completed ? 'Completed' : `${m.progress_pct || 0}%`}`).join('\n')
  : '  No modules available.'}

PROJECT: ${context.project
  ? `Status: ${context.project.status} | Submitted: ${new Date(context.project.submitted_at).toLocaleDateString()}${context.project.mentor_feedback ? ` | Feedback: ${context.project.mentor_feedback}` : ''}`
  : 'Not submitted yet'}

MENTOR: ${context.mentor ? `${context.mentor.name} (${context.mentor.email}${context.mentor.department ? `, ${context.mentor.department}` : ''})` : 'Not yet assigned'}

CREDENTIALS: ${context.credentials
  ? `Work Email: ${context.credentials.work_email} | ID: ${context.credentials.intern_id_code} | Password Changed: ${context.credentials.password_changed ? 'Yes' : 'No — please change your temporary password'}`
  : 'Not issued yet (issued after onboarding completion)'}

CERTIFICATE: ${context.certificate
  ? `Issued — Certificate #${context.certificate.cert_number} on ${new Date(context.certificate.issued_at).toLocaleDateString()}`
  : 'Not yet issued (issued upon internship completion)'}`;

  } else if (role === 'mentor') {
    dataBlock = `
MY INTERNS (${context.interns?.length || 0}):
${context.interns?.length
  ? context.interns.map(i =>
      `- ${i.name} | Status: ${i.app_status} | Project: ${i.project_status || 'Not submitted'} | LMS: ${i.avg_lms || 0}% avg progress`
    ).join('\n')
  : 'No interns assigned yet.'}

PENDING PROJECT REVIEWS (${context.pending_reviews?.length || 0}):
${context.pending_reviews?.length
  ? context.pending_reviews.map(r =>
      `- ${r.intern_name} — submitted ${new Date(r.submitted_at).toLocaleDateString()} | ${r.github_url}`
    ).join('\n')
  : 'No pending reviews.'}

RECENT FEEDBACK GIVEN (last 5):
${context.recent_feedback?.length
  ? context.recent_feedback.map(f =>
      `- To ${f.intern_name}: [${f.category || 'General'}] on ${new Date(f.created_at).toLocaleDateString()}`
    ).join('\n')
  : 'No feedback given yet.'}`;
  }

  return `You are the InternFlow AI Assistant — a friendly, knowledgeable helper embedded in the InternFlow internship management platform. You are speaking with ${user.name}, a ${roleLabel}.

TODAY: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

${roleLabel.toUpperCase()} DATA SNAPSHOT:
${dataBlock}

RULES:
1. Answer questions only about the platform and the data shown above. Do not invent data.
2. Be concise and friendly. Use bullet points for lists. Stay under 250 words unless more detail is explicitly requested.
3. You CANNOT perform actions, create, update, or delete any data — read-only guidance only.
4. Guide the user on their next steps based on their current status.
5. If asked something outside the data snapshot, say you don't have that information and suggest where to find it in the platform.
6. Do not expose other users' private data (emails, scores) beyond what the user already has access to.`;
};

/**
 * @swagger
 * /api/ai-assistant/chat:
 *   post:
 *     summary: Send a message to the role-aware AI Assistant
 *     description: >
 *       Accepts a user message and optional conversation history.
 *       The assistant fetches the authenticated user's live data (referrals, applications,
 *       documents, LMS progress, etc.) and responds using Gemini AI.
 *       Read-only — never modifies any data.
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "What is my current referral quota?"
 *               history:
 *                 type: array
 *                 description: Prior conversation turns (max last 8 used)
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: "You have used 2 out of 5 referral slots this quarter. 3 slots remaining."
 *       400:
 *         description: Bad request (missing or invalid message)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI service temporarily unavailable
 */
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });
    if (message.length > 1000) return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    if (!Array.isArray(history)) return res.status(400).json({ error: 'History must be an array' });

    const { id: userId, role, name, email } = req.user;

    const context = await fetchUserContext(userId, role);
    const systemPrompt = buildSystemPrompt({ name, email }, context, role);

    // Embed system prompt + last 8 turns into a single prompt (Gemini single-turn format)
    const recentHistory = history.slice(-8);
    const historyText = recentHistory.length > 0
      ? '\n\nCONVERSATION SO FAR:\n' +
        recentHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')
      : '';

    const fullPrompt = `${systemPrompt}${historyText}\n\nUser: ${message.trim()}\n\nAssistant:`;

    const response = await callGemini(fullPrompt);
    res.json({ response: response.trim() });

  } catch (err) {
    console.error('[AI ASSISTANT] Error:', err.message);
    res.status(500).json({ error: 'AI Assistant is temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
