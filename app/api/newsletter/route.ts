import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, verifyOrigin } from '@/lib/security';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'newsletter', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid email' }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({ message: 'Subscribed to GARUD Warriors Circle.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
