import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { verifyOrigin, sanitizeText } from '@/lib/security';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [announcements, banners, testimonials, subscribers, contacts, settingsRows] =
    await Promise.all([
      prisma.announcement.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.banner.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.storeSetting.findMany(),
    ]);

  return NextResponse.json({
    announcements,
    banners,
    testimonials,
    subscribers,
    contacts,
    settings: Object.fromEntries(settingsRows.map(s => [s.key, s.value])),
  });
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { type, data } = body || {};

    if (type === 'announcement') {
      const created = await prisma.announcement.create({
        data: {
          text: sanitizeText(String(data.text || '')),
          isActive: data.isActive !== false,
          sortOrder: Number(data.sortOrder || 0),
        },
      });
      return NextResponse.json({ announcement: created }, { status: 201 });
    }

    if (type === 'testimonial') {
      const created = await prisma.testimonial.create({
        data: {
          name: sanitizeText(String(data.name || '')),
          location: sanitizeText(String(data.location || '')),
          rating: Math.min(5, Math.max(1, Number(data.rating || 5))),
          text: sanitizeText(String(data.text || '')),
          product: sanitizeText(String(data.product || '')),
          isActive: true,
        },
      });
      return NextResponse.json({ testimonial: created }, { status: 201 });
    }

    if (type === 'banner') {
      const created = await prisma.banner.create({
        data: {
          title: sanitizeText(String(data.title || '')),
          subtitle: data.subtitle ? sanitizeText(String(data.subtitle)) : null,
          imageUrl: String(data.imageUrl || ''),
          ctaLabel: data.ctaLabel ? sanitizeText(String(data.ctaLabel)) : null,
          ctaHref: data.ctaHref ? String(data.ctaHref) : null,
          placement: String(data.placement || 'CAMPAIGN'),
          isActive: true,
        },
      });
      return NextResponse.json({ banner: created }, { status: 201 });
    }

    if (type === 'settings' && data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        await prisma.storeSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'contactStatus') {
      const updated = await prisma.contactMessage.update({
        where: { id: String(data.id) },
        data: { status: String(data.status || 'READ') },
      });
      return NextResponse.json({ contact: updated });
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to save content' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const type = req.nextUrl.searchParams.get('type');
  const id = req.nextUrl.searchParams.get('id');
  if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 });

  if (type === 'announcement') await prisma.announcement.delete({ where: { id } });
  else if (type === 'testimonial') await prisma.testimonial.delete({ where: { id } });
  else if (type === 'banner') await prisma.banner.delete({ where: { id } });
  else if (type === 'subscriber') await prisma.newsletterSubscriber.delete({ where: { id } });
  else if (type === 'contact') await prisma.contactMessage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
