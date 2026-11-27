import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { verifyOrigin, sanitizeText } from '@/lib/security';

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(15).optional().or(z.literal('')),
});

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return NextResponse.json({ user: auth.user });
}

export async function PATCH(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        name: sanitizeText(parsed.data.name),
        phone: parsed.data.phone ? sanitizeText(parsed.data.phone) : null,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, emailVerified: true },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
