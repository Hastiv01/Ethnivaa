async function sendBrevoOtpEmail({ email, name, otp }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Ethnivaa';

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo email configuration is missing');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [{ email, name }],
      subject: 'Your Ethnivaa verification code',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Your OTP code</h2>
          <p>Hello ${name},</p>
          <p>Your verification code is:</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</div>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brevo send failed: ${response.status} ${text}`);
  }

  return response.json().catch(() => ({}));
}

async function sendBrevoResetOtpEmail({ email, name, otp }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Ethnivaa';

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo email configuration is missing');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [{ email, name }],
      subject: 'Reset your Ethnivaa account password',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;padding:24px;border-radius:12px">
          <h2 style="color:#4c0519;font-family:serif">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Use the following verification code to proceed:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:6px;color:#4c0519;padding:12px;background-color:#fffbeb;text-align:center;border-radius:8px;margin:16px 0">${otp}</div>
          <p>This code expires in 10 minutes. If you did not make this request, you can safely ignore this email.</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="font-size:11px;color:#6b7280">This is an automated email from Ethnivaa. Please do not reply directly.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brevo send failed: ${response.status} ${text}`);
  }

  return response.json().catch(() => ({}));
}

module.exports = {
  sendBrevoOtpEmail,
  sendBrevoResetOtpEmail,
};