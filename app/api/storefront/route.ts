import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [announcements, testimonials, settingsRows, banners] = await Promise.all([
      prisma.announcement.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.storeSetting.findMany(),
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
    ]);

    const settings = Object.fromEntries(settingsRows.map(s => [s.key, s.value]));
    return NextResponse.json({ announcements, testimonials, settings, banners });
  } catch {
    return NextResponse.json({ announcements: [], testimonials: [], settings: {}, banners: [] });
  }
}
