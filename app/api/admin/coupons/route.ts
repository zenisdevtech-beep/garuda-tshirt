import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { verifyOrigin, sanitizeText } from '@/lib/security';

const schema = z.object({
  id: z.string().optional(),
  code: z.string().min(3).max(24),
  description: z.string().max(200).optional(),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().int().min(1),
  minOrder: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().nullable().optional(),
  maxUses: z.number().int().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid coupon' }, { status: 400 });
    }
    const d = parsed.data;
    const coupon = await prisma.coupon.create({
      data: {
        code: d.code.trim().toUpperCase(),
        description: d.description ? sanitizeText(d.description) : null,
        discountType: d.discountType,
        discountValue: d.discountValue,
        minOrder: d.minOrder,
        maxDiscount: d.maxDiscount ?? null,
        maxUses: d.maxUses ?? null,
        isActive: d.isActive,
      },
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Coupon code already exists or is invalid' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    const updated = await prisma.coupon.update({
      where: { id: body.id },
      data: {
        isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
      },
    });
    return NextResponse.json({ coupon: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
