const sendEmail = async ({ to, subject, body, name }) => {
  console.log(`[EMAIL SERVICE] Sending email to: ${to}`);
  console.log(`[EMAIL SERVICE] Subject: ${subject}`);
  console.log(`[EMAIL SERVICE] Body: ${body}`);
  return { success: true };
};

const sendOtp = async ({ to, name, otp }) => {
  return sendEmail({
    to,
    subject: 'Your InternFlow Login OTP',
    body: `Hello ${name}, your OTP for login is: ${otp}. It will expire in 10 minutes.`,
    name
  });
};

const sendReferralInvite = async ({ to, internName, referrerName, roleName, magicLink }) => {
  return sendEmail({
    to,
    subject: `You've been referred for ${roleName}!`,
    body: `Hello ${internName}, ${referrerName} has referred you for the ${roleName} position. Click here to apply: ${magicLink}`,
    name: internName
  });
};

module.exports = {
  sendOtp,
  sendReferralInvite,
  sendEmail
};
