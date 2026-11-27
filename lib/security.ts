import { NextRequest } from 'next/server';

const rateMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  req: NextRequest,
  bucket: string,
  limit = 30,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || entry.resetAt <= now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function verifyOrigin(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin) return true; // server-to-server / curl / webhook
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}
