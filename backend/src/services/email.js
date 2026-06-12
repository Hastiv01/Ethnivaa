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

module.exports = {
  sendBrevoOtpEmail,
};