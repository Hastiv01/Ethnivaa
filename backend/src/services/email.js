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

async function sendBrevoOrderConfirmationEmail({ email, name, order }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Ethnivaa';

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo email configuration is missing');
  }

  // Format order items for table
  const orderItemsHtml = (order.OrderItems || []).map(item => {
    const product = item.Product || {};
    const title = product.title || 'Jewelry Item';
    const detail = [product.color, product.material].filter(Boolean).join(', ');
    const displayTitle = detail ? `${title} (${detail})` : title;
    const imageUrl = product.image || '';
    
    const imageTag = imageUrl 
      ? `<img src="${imageUrl}" alt="${title}" style="width: 48px; height: 48px; object-fit: contain; margin-right: 12px; border: 1px solid #e2d8c5; border-radius: 6px; background-color: white;" align="left" />`
      : '';

    return `
      <tr style="border-bottom: 1px solid #f5efe2;">
        <td style="padding: 12px 0; vertical-align: middle;">
          ${imageTag}
          <div style="font-weight: bold; color: #4c0519; min-height: 48px; display: table-cell; vertical-align: middle;">${displayTitle}</div>
        </td>
        <td style="padding: 12px; text-align: center; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; vertical-align: middle; font-weight: bold; color: #1c1917;">₹${Number(item.lineTotal || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

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
      subject: `Order Confirmed: ${order.orderNumber} - Ethnivaa`,
      htmlContent: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;background-color:#faf6ee;color:#1c1917;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Brand Header -->
          <div style="background-color:#4c0519;padding:32px 24px;text-align:center;border-bottom:3px solid #d4af37;">
            <h1 style="color:#faf6ee;font-family:Georgia,serif;margin:0;font-size:28px;letter-spacing:2px;">ETHNIVAA</h1>
            <p style="color:#d4af37;margin:8px 0 0 0;font-size:11px;text-transform:uppercase;letter-spacing:3px;font-weight:bold;">The Heritage of Fine Jewelry</p>
          </div>
          
          <div style="padding:24px;">
            <!-- Welcome message -->
            <h2 style="color:#4c0519;font-family:Georgia,serif;margin-top:0;font-size:20px;">Order Confirmed!</h2>
            <p>Dear ${name},</p>
            <p>Thank you for shopping with us! Your payment has been successfully verified, and your order is now confirmed. We are preparing to dispatch your exquisite handcrafted selections.</p>
            
            <!-- Order Summary Cards -->
            <div style="background-color:#ffffff;border:1px solid #e2d8c5;border-radius:12px;padding:16px;margin:20px 0;">
              <h3 style="color:#4c0519;font-family:Georgia,serif;margin-top:0;border-bottom:1px solid #f3ebd4;padding-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Order Details</h3>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr>
                  <td style="padding:4px 0;color:#78716c;font-weight:bold;width:40%;">Order Number:</td>
                  <td style="padding:4px 0;font-family:monospace;font-weight:bold;color:#1c1917;">${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#78716c;font-weight:bold;">Payment ID:</td>
                  <td style="padding:4px 0;font-family:monospace;color:#1c1917;">${order.razorpayPaymentId || 'Prepaid'}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#78716c;font-weight:bold;">Payment Method:</td>
                  <td style="padding:4px 0;color:#1c1917;">${order.paymentMethod || 'Razorpay Online'}</td>
                </tr>
              </table>
            </div>

            <!-- Shipping Details -->
            <div style="background-color:#ffffff;border:1px solid #e2d8c5;border-radius:12px;padding:16px;margin:20px 0;">
              <h3 style="color:#4c0519;font-family:Georgia,serif;margin-top:0;border-bottom:1px solid #f3ebd4;padding-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Delivery Address</h3>
              <p style="margin:0;font-size:13px;color:#44403c;line-height:1.5;">
                <strong>${order.Address?.recipientName || name}</strong><br />
                ${order.Address?.line1 || ''}<br />
                ${order.Address?.line2 ? order.Address.line2 + '<br />' : ''}
                ${order.Address?.city || ''}, ${order.Address?.state || ''} - ${order.Address?.postalCode || ''}<br />
                Phone: ${order.Address?.phone || ''}
              </p>
            </div>

            <!-- Items List -->
            <div style="margin:24px 0;">
              <h3 style="color:#4c0519;font-family:Georgia,serif;font-size:16px;margin-bottom:12px;border-bottom:2px solid #4c0519;padding-bottom:6px;">Purchased Items</h3>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="border-bottom:1px solid #e2d8c5;color:#78716c;">
                    <th style="text-align:left;padding:8px 0;">Item</th>
                    <th style="text-align:center;padding:8px;width:15%;">Qty</th>
                    <th style="text-align:right;padding:8px 0;width:25%;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div style="border-top:1px dashed #e2d8c5;padding-top:12px;width:60%;margin-left:auto;font-size:13px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:4px 0;color:#78716c;">Subtotal:</td>
                  <td style="padding:4px 0;text-align:right;">₹${Number(order.subtotal).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#78716c;">Shipping:</td>
                  <td style="padding:4px 0;text-align:right;">${Number(order.shippingCost) === 0 ? 'FREE' : '₹' + Number(order.shippingCost).toLocaleString('en-IN')}</td>
                </tr>
                <tr style="border-top:1px solid #e2d8c5;font-weight:bold;font-size:15px;">
                  <td style="padding:8px 0;color:#4c0519;">Total:</td>
                  <td style="padding:8px 0;text-align:right;color:#4c0519;">₹${Number(order.total).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color:#f5efe2;padding:24px;text-align:center;font-size:11px;color:#78716c;border-top:1px solid #e2d8c5;">
            <p style="margin:0;">If you have any questions regarding your order, please feel free to reach out.</p>
            <p style="margin:8px 0 0 0;font-weight:bold;color:#4c0519;">Thank you for choosing Ethnivaa.</p>
          </div>
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
  sendBrevoOrderConfirmationEmail,
};