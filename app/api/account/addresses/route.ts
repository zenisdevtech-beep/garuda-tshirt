import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { verifyOrigin, sanitizeText } from '@/lib/security';

const schema = z.object({
  label: z.string().min(1).max(30).default('Home'),
  fullName: z.string().min(2).max(80),
  phone: z.string().min(10).max(15),
  line1: z.string().min(4).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const addresses = await prisma.address.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid address' }, { status: 400 });
    }

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: auth.user.id,
        label: sanitizeText(parsed.data.label),
        fullName: sanitizeText(parsed.data.fullName),
        phone: sanitizeText(parsed.data.phone),
        line1: sanitizeText(parsed.data.line1),
        line2: parsed.data.line2 ? sanitizeText(parsed.data.line2) : null,
        city: sanitizeText(parsed.data.city),
        state: sanitizeText(parsed.data.state),
        pinCode: parsed.data.pinCode,
        country: sanitizeText(parsed.data.country),
        isDefault: parsed.data.isDefault,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
  }

  await prisma.address.deleteMany({
    where: { id, userId: auth.user.id },
  });
  return NextResponse.json({ success: true });
}
