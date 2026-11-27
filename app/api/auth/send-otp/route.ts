import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, verifyOrigin } from '@/lib/security';
import { sendOtpEmail } from '@/lib/email';

const schema = z.object({
  identifier: z.string().min(4, 'Email or phone number is required'),
  purpose: z.enum(['SIGNUP', 'LOGIN']),
});

function normalizePhone(val: string): string {
  return val.replace(/[^\d+]/g, '');
}

function isEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'auth:send-otp', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many OTP requests. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const raw = parsed.data.identifier.trim();
    const emailMode = isEmail(raw);
    const identifier = emailMode ? raw.toLowerCase() : normalizePhone(raw);

    if (!emailMode && identifier.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Please enter a valid email or 10-digit phone number.' }, { status: 400 });
    }

    let deliveryEmail: string | null = emailMode ? identifier : null;

    if (parsed.data.purpose === 'LOGIN') {
      const user = await prisma.user.findFirst({
        where: emailMode ? { email: identifier } : { phone: identifier },
      });
      if (!user) {
        return NextResponse.json({ error: 'No account found for that email or phone number.' }, { status: 404 });
      }
      deliveryEmail = user.email;
    }

    const code = String(crypto.randomInt(1000, 10000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { identifier, purpose: parsed.data.purpose },
    });

    await prisma.otpVerification.create({
      data: {
        identifier,
        channel: emailMode ? 'EMAIL' : 'PHONE',
        purpose: parsed.data.purpose,
        code,
        expiresAt,
      },
    });

    let sent = false;
    let deliveryNotice = '';

    if (deliveryEmail) {
      const emailRes = await sendOtpEmail(deliveryEmail, code, parsed.data.purpose);
      sent = emailRes.sent;
      if (!sent) {
        deliveryNotice = emailRes.reason || 'SMTP is not configured on this server.';
      }
    } else {
      sent = false;
      deliveryNotice = 'SMS provider is not configured on this server. Please use Verify via Email.';
    }

    return NextResponse.json({
      sent,
      channel: emailMode ? 'EMAIL' : 'PHONE',
      message: sent
        ? emailMode
          ? `4-digit verification code sent to ${identifier}.`
          : `4-digit verification code sent to your registered email (${maskEmail(deliveryEmail!)}).`
        : `4-digit verification code generated (${deliveryNotice})`,
      ...(!sent && process.env.NODE_ENV !== 'production' ? { devOtp: code } : {}),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
  }
}
