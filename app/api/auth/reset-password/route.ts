import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkRateLimit, verifyOrigin } from '@/lib/security';

const schema = z.object({
  token: z.string().min(10, 'Invalid reset token'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'auth:reset', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: parsed.data.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Reset token is invalid or has expired.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch {
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
