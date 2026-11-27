import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCartSessionId } from '@/lib/auth';
import { calculateServerCart } from '@/lib/cart-server';
import { verifyOrigin } from '@/lib/security';

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const code = typeof body?.code === 'string' ? body.code : '';
    const sessionId = await getOrCreateCartSessionId();
    const cart = await calculateServerCart(sessionId, code);
    return NextResponse.json(cart, { status: cart.couponValid || !code.trim() ? 200 : 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
