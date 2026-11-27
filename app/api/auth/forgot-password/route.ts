import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, verifyOrigin } from '@/lib/security';
import { sendPasswordResetEmail } from '@/lib/email';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'auth:forgot', 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message: 'If an account exists for that email, a reset link has been processed.',
        emailSent: false,
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      message: emailResult.sent
        ? 'Password reset link has been sent to your email.'
        : 'Password reset token generated, but SMTP email is not configured on this server.',
      emailSent: emailResult.sent,
      ...(emailResult.sent ? {} : { emailNotice: emailResult.reason }),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process password reset' }, { status: 500 });
  }
}
