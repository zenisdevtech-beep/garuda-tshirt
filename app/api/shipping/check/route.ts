import { NextRequest, NextResponse } from 'next/server';
import { checkPinServiceability } from '@/lib/shiprocket';

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get('pincode') || '';
  const cod = req.nextUrl.searchParams.get('cod') === 'true';

  try {
    const result = await checkPinServiceability(pincode, cod);
    return NextResponse.json(result, { status: result.serviceable ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      { serviceable: false, message: err instanceof Error ? err.message : 'Serviceability check failed' },
      { status: 500 }
    );
  }
}
