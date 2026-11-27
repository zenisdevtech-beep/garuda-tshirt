'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: 'What fabric GSM does GARUD use?',
    a: 'Our oversized tees are crafted from 220–260 GSM 100% combed cotton, and our hoodies range from 350–450 GSM French terry and fleece for structured drape and durability.',
  },
  {
    q: 'How do GARUD sizes fit?',
    a: 'All tees and hoodies feature a relaxed, slightly oversized streetwear cut. If you prefer a closer tailored fit, we recommend sizing down one size.',
  },
  {
    q: 'How long does shipping take across India?',
    a: 'Orders are dispatched within 24–48 business hours and typically arrive in 3–5 business days across metro cities and 5–7 days in other regions.',
  },
  {
    q: 'Is Cash on Delivery (COD) available?',
    a: 'Yes, COD is available on serviceable PIN codes across India alongside UPI, credit/debit cards, and net banking via Razorpay.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'We offer hassle-free 7-day returns and size exchanges for unworn, unwashed items with original tags intact.',
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-transparent py-16 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-2">Support</p>
        <h1 className="font-display text-5xl tracking-widest text-garud-teal font-bold mb-10">FREQUENTLY ASKED QUESTIONS</h1>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div key={i} className="bg-garud-cream-dark/50 border border-garud-cream-border">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-garud-teal"
              >
                {item.q}
                {open === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {open === i && <p className="px-5 pb-5 text-sm text-garud-ink/80 leading-relaxed">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
