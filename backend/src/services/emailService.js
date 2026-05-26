const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, body, html }) => {
  console.log(`[EMAIL SERVICE] Sending email to: ${to}`);

  await transporter.sendMail({
    from: `"InternFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: body,
    ...(html && { html }),
  });

  console.log(`[EMAIL SERVICE] Email sent to: ${to}`);
  return { success: true };
};

const sendOtp = async ({ to, name, otp }) => {
  const digits = otp.toString().split('');

  const digitBoxes = digits.map(d =>
    `<td style="padding:0 6px;">
       <div style="width:48px;height:56px;border:2px solid #e2e8f0;border-radius:12px;background:#f8fafc;
                   font-size:28px;font-weight:900;color:#1e293b;text-align:center;line-height:56px;
                   font-family:monospace;">${d}</div>
     </td>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td align="center" style="padding:40px 40px 32px;">
            <div style="width:64px;height:64px;background:#4f46e5;border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <span style="font-size:28px;color:#ffffff;">✦</span>
            </div>
            <div style="font-size:22px;font-weight:900;color:#1e293b;letter-spacing:-0.5px;">InternFlow</div>
            <div style="font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">BY HEXAWARE</div>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">
            <div style="font-size:22px;font-weight:800;color:#1e293b;margin-bottom:10px;">Your login code</div>
            <div style="font-size:14px;color:#64748b;line-height:1.6;margin-bottom:32px;">
              Use this one-time code to log in to the InternFlow portal. It expires in <strong style="color:#1e293b;">10 minutes</strong>.
            </div>

            <!-- OTP Digits -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>${digitBoxes}</tr>
            </table>

            <!-- Warning -->
            <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;text-align:center;margin-bottom:32px;">
              <div style="font-size:12px;color:#94a3b8;line-height:1.6;">
                Never share this code with anyone. InternFlow will never ask for your OTP over call or chat.
              </div>
            </div>
          </td>
        </tr>

        <!-- Didn't request -->
        <tr>
          <td style="padding:0 40px 36px;">
            <div style="font-size:13px;color:#64748b;line-height:1.7;">
              <strong style="color:#1e293b;">Didn't request this?</strong> Your email may have been entered by someone else.
              You can safely ignore this message — your account is secure.
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
            <div style="font-size:11px;color:#94a3b8;">
              Code valid for 10 minutes &nbsp;·&nbsp; Rate limited to 3 per hour &nbsp;·&nbsp; InternFlow Security
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Your InternFlow login code: ${otp}`,
    body: `Hello ${name}, your OTP for login is: ${otp}. It will expire in 10 minutes.`,
    html,
  });
};

const sendReferralInvite = async ({
  to,
  internName,
  referrerName,
  roleName,
  stipend,
  duration,
  mode,
  location,
  applyBy
}) => {
  const emailTemplate = `
=========================================
REFERRAL_INVITE
To:       ${to}
Subject:  You've been referred for ${roleName} at Hexaware
Trigger:  Employee submits referral form
=========================================

  InternFlow BY HEXAWARE

  Hi ${internName},

  You've been referred for an internship opportunity! ${referrerName}, a Software
  Engineer at Hexaware Technologies, thinks you'd be a great fit for their team.

  -------------------------------------------------------------
  | Role         | ${roleName}
  | Company      | Hexaware Technologies
  | Stipend      | ${stipend == null ? 'Not specified' : stipend === 0 ? 'Unpaid' : `₹${stipend.toLocaleString()} / month`}
  | Duration     | ${duration} months · ${mode} · ${location}
  | Referred by  | ${referrerName}
  | Apply by     | ${applyBy}
  -------------------------------------------------------------

  Click the button below to log in to the Intern Portal, complete your application, and
  track your status - all in one place.

  [ Complete Application & Login -> http://localhost:5173/recruitment/login ]

  This link expires in 24 hours - If you didn't expect this, you can ignore this email

  InternFlow · Hexaware Technologies · Chennai, Tamil Nadu
  You received this because someone referred you for an internship.
=========================================
`;

  return sendEmail({
    to,
    subject: `You've been referred for ${roleName} at Hexaware`,
    body: emailTemplate,
    name: internName
  });
};

const sendReferralConfirmation = async ({
  to,
  internName,
  roleName,
  internEmail,
  referralId,
  remainingSlots,
  totalSlots
}) => {
  const emailTemplate = `
=========================================
REFERRAL_SUBMITTED
To:       ${to}
Subject:  Referral submitted — ${internName} has been invited to apply
Trigger:  Employee successfully submits referral form
=========================================

  InternFlow EMPLOYEE PORTAL

  Hi, your referral is live!

  You've successfully referred ${internName} for the ${roleName} role. An
  invitation email has been sent to their inbox. You'll be notified at every stage of their
  application.

  -------------------------------------------------------------
  | Candidate           | ${internName}
  | Role                | ${roleName}
  | Email sent to       | ${internEmail}
  | Referral ID         | REF-${String(referralId).substring(0, 8).toUpperCase()}
  | Quota remaining     | ${remainingSlots} of ${totalSlots} slots left this cycle
  | Reward on onboarding| ₹2,500
  -------------------------------------------------------------

  You can track this referral anytime from your Employee Portal dashboard under My
  Referrals.

  [ View My Referrals -> http://localhost:5173/ ]

  InternFlow Employee Portal · Hexaware Technologies
=========================================
`;

  return sendEmail({
    to,
    subject: `Referral submitted — ${internName} has been invited to apply`,
    body: emailTemplate,
    name: internName
  });
};

const sendAIScreeningResultToHR = async ({
  to,
  internName,
  roleName,
  overallScore,
  skillsMatch,
  experienceFit,
  strengths = [],
  gaps = [],
  recommendation,
  applicationId,
  processedSeconds = 2.3
}) => {
  const recommendLabel = recommendation === 'strong_pass' ? 'Strong Pass — Recommend for Offer'
    : recommendation === 'pass' ? 'Recommend for Offer'
    : recommendation === 'borderline' ? 'Borderline — Review Carefully'
    : 'Not Recommended';

  const recommendColor = (recommendation === 'strong_pass' || recommendation === 'pass')
    ? '#10b981' : recommendation === 'borderline' ? '#f59e0b' : '#ef4444';

  const bar = (pct, color) =>
    `<div style="height:8px;background:#f1f5f9;border-radius:99px;overflow:hidden;margin-top:4px;">
       <div style="height:100%;width:${pct}%;background:${color};border-radius:99px;"></div>
     </div>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td align="center" style="padding:36px 40px 28px;background:linear-gradient(135deg,#10b981,#059669);">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="font-size:26px;color:#fff;">✦</span>
      </div>
      <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">InternFlow</div>
      <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;margin-top:3px;">AI Screening</div>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px 0;">
      <h2 style="margin:0 0 10px;font-size:20px;font-weight:800;color:#1e293b;">AI screening complete — review needed</h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">
        <strong style="color:#1e293b;">${internName}</strong> has applied for <strong style="color:#1e293b;">${roleName}</strong>.
        The AI has finished screening their resume. Here's the summary:
      </p>

      <!-- Score Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td width="33%" style="padding:0 6px 0 0;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#10b981;">${overallScore}</div>
              <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Overall</div>
            </div>
          </td>
          <td width="33%" style="padding:0 3px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#7c3aed;">${skillsMatch}%</div>
              <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Skills</div>
            </div>
          </td>
          <td width="33%" style="padding:0 0 0 6px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#f59e0b;">${experienceFit}%</div>
              <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Experience</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Progress Bars -->
      <div style="margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:13px;color:#64748b;font-weight:500;">Overall match</span>
          <span style="font-size:13px;font-weight:700;color:#1e293b;">${overallScore}%</span>
        </div>
        ${bar(overallScore, '#10b981')}
        <div style="display:flex;justify-content:space-between;margin:12px 0 4px;">
          <span style="font-size:13px;color:#64748b;font-weight:500;">Skills alignment</span>
          <span style="font-size:13px;font-weight:700;color:#1e293b;">${skillsMatch}%</span>
        </div>
        ${bar(skillsMatch, '#7c3aed')}
        <div style="display:flex;justify-content:space-between;margin:12px 0 4px;">
          <span style="font-size:13px;color:#64748b;font-weight:500;">Experience fit</span>
          <span style="font-size:13px;font-weight:700;color:#1e293b;">${experienceFit}%</span>
        </div>
        ${bar(experienceFit, '#f59e0b')}
      </div>

      <!-- AI Recommendation -->
      <div style="margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">AI Recommendation</div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:${recommendColor}1a;border:1px solid ${recommendColor}40;border-radius:99px;font-size:12px;font-weight:700;color:${recommendColor};">
            ✓ ${recommendLabel}
          </span>
          ${strengths.length ? `<span style="font-size:13px;color:#64748b;">${strengths.slice(0, 2).join(' · ')}</span>` : ''}
        </div>
        ${gaps.length ? `<div style="margin-top:10px;font-size:12px;color:#94a3b8;"><strong>Gaps:</strong> ${gaps.join(', ')}</div>` : ''}
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:36px;">
        <a href="http://localhost:5173/pipeline"
           style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
          Review &amp; Make Decision →
        </a>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <span style="font-size:11px;color:#94a3b8;">
        InternFlow AI &nbsp;·&nbsp; Processed in ${processedSeconds}s &nbsp;·&nbsp; Screening is advisory — final decision is yours.
      </span>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `AI screening complete — ${internName} scored ${overallScore}/100 · Action required`,
    body: `AI Screening complete for ${internName} applying for ${roleName}. Overall: ${overallScore}, Skills: ${skillsMatch}%, Experience: ${experienceFit}%. Recommendation: ${recommendLabel}.`,
    html,
  });
};

const sendOfferEmail = async ({
  to, internName, roleName, stipend, durationMonths, mode, location, department
}) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 21);
  const startFormatted = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);
  const validFormatted = validUntil.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const stipendVal = stipend == null ? 'To be confirmed'
    : stipend === 0 ? 'Unpaid'
    : `&#8377;${Number(stipend).toLocaleString()} / month`;

  const detailRows = [
    ['Role',     roleName],
    ['Stipend',  stipendVal],
    ['Start Date', startFormatted],
    ['Duration', durationMonths ? `${durationMonths} months` : 'To be confirmed'],
    ['Mode',     [mode, location].filter(Boolean).join(' &middot; ') || 'To be confirmed'],
    ['Team',     department || 'To be confirmed'],
  ].map(([label, value]) =>
    `<tr>
       <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">${label}</td>
       <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#1e293b;text-align:right;border-bottom:1px solid #f1f5f9;">${value}</td>
     </tr>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td align="center" style="padding:40px 40px 28px;background:linear-gradient(135deg,#10b981,#059669);">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">&#10003;</span>
      </div>
      <div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Offer Extended!</div>
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Hexaware Technologies</div>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px 0;">
      <p style="margin:0 0 16px;font-size:15px;color:#1e293b;">Hi <strong>${internName}</strong>,</p>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">
        We're thrilled to let you know that <strong style="color:#1e293b;">Hexaware Technologies</strong> has reviewed
        your application and is pleased to extend you an internship offer. We were impressed by your profile
        and look forward to having you on the team!
      </p>

      <!-- Offer Details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
        ${detailRows}
      </table>

      <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">
        Log in to the portal to <strong style="color:#1e293b;">accept your offer</strong> and complete your joining documents.
        You'll need to sign the Joining Form followed by the NDA before your start date.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:36px;">
        <a href="http://localhost:5173/onboard/login"
           style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
          Accept Offer &amp; Continue &#8594;
        </a>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:16px 40px 24px;border-top:1px solid #f1f5f9;text-align:center;">
      <div style="font-size:11px;color:#94a3b8;">
        Offer valid until ${validFormatted} &nbsp;&middot;&nbsp; Questions? Reply to this email
      </div>
      <div style="font-size:11px;color:#cbd5e1;margin-top:6px;">
        InternFlow &nbsp;&middot;&nbsp; Hexaware Technologies &nbsp;&middot;&nbsp;
        If you believe this is an error, contact <a href="mailto:hr@hexaware.com" style="color:#cbd5e1;">hr@hexaware.com</a>
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Congratulations! You've received an offer from Hexaware Technologies`,
    body: `Hi ${internName}, Hexaware Technologies is pleased to extend you an internship offer for the ${roleName} role. Log in to accept.`,
    html,
  });
};

const sendRejectionEmail = async ({ to, internName, roleName, hrNote }) => {
  const feedbackBlock = hrNote ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Feedback from HR</div>
      <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;font-style:italic;">&ldquo;${hrNote}&rdquo;</p>
    </div>` : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td align="center" style="padding:40px 40px 32px;">
      <div style="width:64px;height:64px;background:#4f46e5;border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;color:#ffffff;">&#10022;</span>
      </div>
      <div style="font-size:22px;font-weight:900;color:#1e293b;letter-spacing:-0.5px;">InternFlow</div>
      <div style="font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">BY HEXAWARE</div>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px 0;">
      <p style="margin:0 0 16px;font-size:15px;color:#1e293b;">Hi <strong>${internName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.7;">
        Thank you for applying for the <strong style="color:#1e293b;">${roleName}</strong> position at
        Hexaware Technologies. We genuinely appreciate the time and effort you put into your application.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
        After careful review, we regret to inform you that we will not be moving forward with your
        application at this time. This was a difficult decision &mdash; we received many strong applications
        for a limited number of positions.
      </p>

      ${feedbackBlock}

      <p style="margin:0 0 32px;font-size:14px;color:#64748b;line-height:1.7;">
        We wish you all the best in your career journey. Please feel free to apply again in the
        <strong style="color:#1e293b;">next internship cycle</strong> &mdash; we'd love to reconsider you.
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 40px 28px;border-top:1px solid #f1f5f9;text-align:center;">
      <div style="font-size:11px;color:#94a3b8;">
        InternFlow &nbsp;&middot;&nbsp; Hexaware Technologies &nbsp;&middot;&nbsp; This decision is final for this cycle.
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Update on your application to Hexaware Technologies`,
    body: `Hi ${internName}, Thank you for applying for the ${roleName} position. Unfortunately, we will not be moving forward with your application at this time.`,
    html,
  });
};

const sendCredentialsEmail = async ({
  to, internName, workEmail, tempPassword, internId, mentorName, mentorTitle, startDate
}) => {
  const firstName = internName.split(' ')[0];

  const row = (label, value, highlight) =>
    `<tr style="border-bottom:1px solid #e2e8f0;">
       <td style="padding:11px 16px;font-size:12px;font-weight:600;color:#64748b;white-space:nowrap;">${label}</td>
       <td style="padding:11px 16px;font-size:13px;font-weight:700;color:${highlight || '#1e293b'};text-align:right;">${value}</td>
     </tr>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td align="center" style="padding:36px 40px 28px;">
      <div style="width:52px;height:52px;background:#4f46e5;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;">
        <span style="font-size:24px;color:#fff;">✦</span>
      </div>
      <div style="font-size:20px;font-weight:900;color:#1e293b;letter-spacing:-0.5px;">InternFlow</div>
      <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:3px;text-transform:uppercase;margin-top:3px;">CREDENTIALS</div>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>

  <!-- Body -->
  <tr>
    <td style="padding:32px 40px 0;">
      <div style="font-size:20px;font-weight:800;color:#1e293b;margin-bottom:10px;">Hi ${firstName}, your access is ready.</div>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
        Here are your official work credentials for the <strong style="color:#1e293b;">Hexaware internship</strong>.
        Please change your password on first login.
      </p>

      <!-- Credentials Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:28px;">
        ${row('Work Email',    workEmail,   '#4f46e5')}
        ${row('Temp Password', tempPassword, '#dc2626')}
        ${row('Intern ID',     internId,    '#1e293b')}
        ${row('Mentor',        mentorName ? `${mentorName}${mentorTitle ? ' &middot; ' + mentorTitle : ''}` : 'To be assigned', '#1e293b')}
        ${row('Start Date',    startDate || 'To be confirmed', '#1e293b')}
      </table>

      <!-- Invited To -->
      <div style="margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:12px;">You've also been invited to:</div>
        ${['Slack workspace &mdash; check your inbox for the invite',
           'GitHub organisation &mdash; hexaware-interns',
           'Intern portal with your LMS and project dashboard'].map(item =>
          `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
             <span style="width:18px;height:18px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;color:#16a34a;flex-shrink:0;">✓</span>
             <span style="font-size:13px;color:#475569;">${item}</span>
           </div>`).join('')}
      </div>

      <!-- Warning -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 18px;margin-bottom:32px;">
        <div style="font-size:12px;color:#9a3412;line-height:1.6;">
          <strong>⚠ Change your password immediately on first login.</strong>
          Never share your credentials. These expire <strong>90 days</strong> after your start date.
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:40px;">
        <a href="http://localhost:5173/"
           style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
          Log in to Intern Portal &rarr;
        </a>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:18px 40px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <div style="font-size:11px;color:#94a3b8;">
        InternFlow &nbsp;&middot;&nbsp; Questions? Contact <a href="mailto:hr@hexaware.com" style="color:#94a3b8;">hr@hexaware.com</a>
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return sendEmail({
    to,
    subject: 'Your InternFlow work credentials and portal access',
    body: `Hi ${firstName}, your InternFlow credentials are ready. Work Email: ${workEmail} | Temp Password: ${tempPassword} | Intern ID: ${internId}`,
    html,
  });
};

const sendOnboardingConfirmEmail = async ({ to, internName, batch, startDate, portalUrl }) => {
  const batchLabel = batch || 'June 2025 Batch';
  const startLabel = startDate || '15 June 2025';
  const firstName = internName.split(' ')[0];
  const portalLink = portalUrl || 'http://localhost:5173/';

  const checkItem = (text, done) => `
    <tr>
      <td style="padding:7px 0;vertical-align:top;">
        <span style="display:inline-flex;align-items:center;gap:10px;font-size:13px;color:${done ? '#1e293b' : '#94a3b8'};">
          <span style="width:20px;height:20px;border-radius:50%;background:${done ? '#dcfce7' : '#fef9c3'};border:1.5px solid ${done ? '#86efac' : '#fde68a'};display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;">
            ${done ? '✓' : '⏳'}
          </span>
          ${text}
        </span>
      </td>
    </tr>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td align="center" style="padding:44px 40px 32px;">
      <div style="font-size:52px;margin-bottom:16px;">🎊</div>
      <div style="font-size:24px;font-weight:900;color:#1e293b;letter-spacing:-0.5px;">You're officially onboarded!</div>
      <div style="font-size:12px;font-weight:600;color:#94a3b8;margin-top:6px;">Hexaware Technologies &nbsp;·&nbsp; ${batchLabel}</div>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>

  <!-- Body -->
  <tr>
    <td style="padding:32px 40px 0;">
      <div style="font-size:18px;font-weight:800;color:#1e293b;margin-bottom:12px;">Welcome to the team, ${firstName}!</div>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.75;">
        Your Joining Form and NDA have both been signed and verified.
        You are now officially part of the <strong style="color:#1e293b;">Hexaware Technologies</strong>
        internship programme. We're excited to have you!
      </p>

      <!-- Checklist -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${checkItem('Offer accepted', true)}
        ${checkItem('Joining form signed', true)}
        ${checkItem('NDA signed &amp; verified', true)}
        ${checkItem('Work credentials &mdash; coming shortly', false)}
        ${checkItem('Mentor assigned &mdash; coming shortly', false)}
      </table>

      <!-- Start date note -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:32px;font-size:13px;color:#64748b;line-height:1.7;">
        Your start date is <strong style="color:#1e293b;">${startLabel}</strong>.
        You'll receive your work email, intern ID, and portal access in a separate email within the <strong style="color:#1e293b;">next few hours</strong>.
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:40px;">
        <a href="${portalLink}"
           style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
          Go to Intern Portal &rarr;
        </a>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <div style="font-size:11px;color:#94a3b8;">
        InternFlow &nbsp;&middot;&nbsp; Hexaware Technologies &nbsp;&middot;&nbsp; Chennai
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `You're officially onboarded — Welcome to Hexaware, ${firstName}!`,
    body: `Hi ${internName}, congratulations! Your Joining Form and NDA have been signed. You're officially onboarded at Hexaware Technologies. Your start date is ${startLabel}.`,
    html,
  });
};

module.exports = {
  sendOtp,
  sendReferralInvite,
  sendReferralConfirmation,
  sendAIScreeningResultToHR,
  sendOfferEmail,
  sendRejectionEmail,
  sendOnboardingConfirmEmail,
  sendCredentialsEmail,
  sendEmail
};
