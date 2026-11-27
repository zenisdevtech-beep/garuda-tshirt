import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, verifyOrigin, sanitizeText } from '@/lib/security';
import { sendEmail } from '@/lib/email';

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(80),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(15).optional(),
  subject: z.string().min(3, 'Subject is required').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'contact', 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid form input' }, { status: 400 });
    }

    const saved = await prisma.contactMessage.create({
      data: {
        name: sanitizeText(parsed.data.name),
        email: parsed.data.email.trim().toLowerCase(),
        phone: parsed.data.phone ? sanitizeText(parsed.data.phone) : null,
        subject: sanitizeText(parsed.data.subject),
        message: sanitizeText(parsed.data.message),
      },
    });

    const businessEmail = process.env.BUSINESS_CONTACT_EMAIL || 'support@garudwear.in';
    const emailRes = await sendEmail({
      to: businessEmail,
      subject: `[GARUD Contact] ${saved.subject}`,
      html: `<p><strong>From:</strong> ${saved.name} (${saved.email})</p><p>${saved.message}</p>`,
    });

    return NextResponse.json(
      {
        message: 'Message received. Our team will respond within 24 hours.',
        id: saved.id,
        emailSent: emailRes.sent,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
