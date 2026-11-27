import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setSessionCookie, getCartSessionId } from '@/lib/auth';
import { checkRateLimit, verifyOrigin } from '@/lib/security';

const loginSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  otpCode: z.string().optional(),
  portal: z.enum(['customer', 'admin']).optional(),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'auth:login', 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many login attempts. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid credentials' }, { status: 400 });
    }

    const rawIdentifier = (parsed.data.identifier || parsed.data.email || '').trim();
    if (!rawIdentifier) {
      return NextResponse.json({ error: 'Email or phone number is required.' }, { status: 400 });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawIdentifier);
    const normalizedIdentifier = isEmail
      ? rawIdentifier.toLowerCase()
      : rawIdentifier.replace(/[^\d+]/g, '');

    const user = await prisma.user.findFirst({
      where: isEmail ? { email: normalizedIdentifier } : { phone: normalizedIdentifier },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (parsed.data.portal === 'admin') {
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Access denied. This portal is restricted to administrators.' },
          { status: 403 }
        );
      }
    } else {
      // Customer login requires 4-digit OTP verification
      const otpCode = parsed.data.otpCode?.trim() || '';
      if (!/^\d{4}$/.test(otpCode)) {
        return NextResponse.json(
          { error: 'Please enter the 4-digit verification code sent to your email or phone.' },
          { status: 400 }
        );
      }

      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          identifier: normalizedIdentifier,
          purpose: 'LOGIN',
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord || otpRecord.attempts >= 5 || otpRecord.code !== otpCode) {
        if (otpRecord) {
          await prisma.otpVerification.update({
            where: { id: otpRecord.id },
            data: { attempts: { increment: 1 } },
          });
        }
        return NextResponse.json({ error: 'Invalid or expired 4-digit verification code.' }, { status: 400 });
      }

      await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
    }

    const sid = getCartSessionId();
    if (sid) {
      await prisma.cartItem.updateMany({
        where: { sessionId: sid, userId: null },
        data: { userId: user.id },
      });
    }

    const role = user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const token = signToken({ userId: user.id, email: user.email, role });
    setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
