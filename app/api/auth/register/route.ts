import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setSessionCookie, getCartSessionId } from '@/lib/auth';
import { checkRateLimit, verifyOrigin, sanitizeText } from '@/lib/security';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number is required (min 10 digits)').max(15),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  otpCode: z.string().regex(/^\d{4}$/, 'Please enter the 4-digit verification code'),
  verifyChannel: z.enum(['EMAIL', 'PHONE']).default('EMAIL'),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'auth:register', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid registration data' },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const phone = parsed.data.phone.replace(/[^\d+]/g, '');
    if (phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }
    const existingPhone = await prisma.user.findFirst({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 });
    }

    const targetIdentifier = parsed.data.verifyChannel === 'PHONE' ? phone : email;
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        identifier: targetIdentifier,
        purpose: 'SIGNUP',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Verification code expired or not requested. Please request a 4-digit code.' },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed code attempts. Please request a new 4-digit code.' },
        { status: 400 }
      );
    }

    if (otpRecord.code !== parsed.data.otpCode) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'Invalid 4-digit verification code.' }, { status: 400 });
    }

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: sanitizeText(parsed.data.name),
        email,
        phone,
        passwordHash,
        role: 'CUSTOMER',
        emailVerified: parsed.data.verifyChannel === 'EMAIL',
      },
      select: { id: true, name: true, email: true, phone: true, role: true, emailVerified: true },
    });

    const sid = await getCartSessionId();
    if (sid) {
      await prisma.cartItem.updateMany({
        where: { sessionId: sid, userId: null },
        data: { userId: user.id },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: 'CUSTOMER' });
    await setSessionCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
