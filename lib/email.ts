import nodemailer from 'nodemailer';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'GARUD <orders@garudwear.in>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : 'SMTP delivery failed',
    };
  }
}

export async function sendOtpEmail(email: string, code: string, purpose: 'SIGNUP' | 'LOGIN') {
  const action = purpose === 'SIGNUP' ? 'Complete Your Registration' : 'Verify Your Sign In';
  return sendEmail({
    to: email,
    subject: `GARUD Verification Code: ${code}`,
    html: `
      <div style="font-family:sans-serif;background:#FBF4D8;color:#0B4654;padding:32px;max-width:600px;margin:auto;border:1px solid #DFD1A0;">
        <h1 style="letter-spacing:4px;margin-bottom:8px;">GARUD</h1>
        <h2 style="margin-top:0;">${action}</h2>
        <p>Use the 4-digit verification code below (valid for 10 minutes):</p>
        <div style="background:#0B4654;color:#FBF4D8;font-size:28px;font-weight:bold;letter-spacing:10px;padding:16px 24px;display:inline-block;margin:16px 0;">
          ${code}
        </div>
        <p style="font-size:12px;color:#52727A;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}) {
  return sendEmail({
    to: order.customerEmail,
    subject: `GARUD Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;background:#FBF4D8;color:#0B4654;padding:32px;max-width:600px;margin:auto;border:1px solid #DFD1A0;">
        <h1 style="letter-spacing:4px;">GARUD</h1>
        <h2>Order Confirmed: ${order.orderNumber}</h2>
        <p>Hello ${order.customerName},</p>
        <p>Thank you for your order. Payment method: <strong>${order.paymentMethod}</strong> (Status: <strong>${order.paymentStatus}</strong>).</p>
        <p><strong>Total: ₹${order.total.toLocaleString('en-IN')}</strong></p>
        <p>We will notify you again when your order is shipped and delivered.</p>
      </div>
    `,
  });
}

export async function sendOrderStatusEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  awbCode?: string | null;
  courierName?: string | null;
}) {
  const statusMessages: Record<string, { title: string; body: string }> = {
    SHIPPED: {
      title: `Your GARUD Order ${order.orderNumber} Has Shipped`,
      body: 'Your gear is on the way!',
    },
    OUT_FOR_DELIVERY: {
      title: `Out for Delivery — ${order.orderNumber}`,
      body: 'Your GARUD order is out for delivery today. Please keep your phone available.',
    },
    DELIVERED: {
      title: `Delivered — GARUD Order ${order.orderNumber}`,
      body: 'Your GARUD order has been delivered. Welcome to the tribe!',
    },
    CANCELLED: {
      title: `Order Cancelled — ${order.orderNumber}`,
      body: 'Your order has been cancelled. Any applicable refund will be processed shortly.',
    },
    REFUNDED: {
      title: `Refund Processed — ${order.orderNumber}`,
      body: 'Your refund for this order has been processed.',
    },
  };

  const info = statusMessages[order.orderStatus] || {
    title: `GARUD Order Update (${order.orderNumber}) — ${order.orderStatus}`,
    body: `Your order status has been updated to <strong>${order.orderStatus}</strong>.`,
  };

  return sendEmail({
    to: order.customerEmail,
    subject: info.title,
    html: `
      <div style="font-family:sans-serif;background:#FBF4D8;color:#0B4654;padding:32px;max-width:600px;margin:auto;border:1px solid #DFD1A0;">
        <h1 style="letter-spacing:4px;">GARUD</h1>
        <h2>${info.title}</h2>
        <p>Hello ${order.customerName},</p>
        <p>${info.body}</p>
        ${order.awbCode ? `<p>Courier: <strong>${order.courierName || 'Express'}</strong> · Tracking AWB: <strong>${order.awbCode}</strong></p>` : ''}
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: 'GARUD — Password Reset Request',
    html: `
      <div style="font-family:sans-serif;background:#FBF4D8;color:#0B4654;padding:32px;max-width:600px;margin:auto;border:1px solid #DFD1A0;">
        <h1 style="letter-spacing:4px;">GARUD</h1>
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <p><a href="${resetUrl}" style="background:#0B4654;color:#FBF4D8;padding:12px 24px;text-decoration:none;display:inline-block;">Reset Password</a></p>
      </div>
    `,
  });
}
