'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Newsletter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not subscribe.');
      } else {
        setSubmitted(true);
        setEmail('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="bg-garud-teal py-20 md:py-28 grain overflow-hidden relative text-garud-cream">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <div className="relative w-[320px] md:w-[440px] aspect-square opacity-[0.06]">
          <Image src="/images/garud-logo-cream.png" alt="" fill className="object-contain" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-garud-cream/75 text-xs tracking-mega uppercase font-semibold mb-4">Warriors Circle</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-widest text-garud-cream mb-4 font-bold">
            JOIN THE TRIBE
          </h2>
          <p className="text-garud-cream/75 text-sm leading-relaxed mb-10">
            Be the first to know about new drops, exclusive collections, and warrior-only offers. No spam. Only the signal.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-garud-cream/10 border border-garud-cream/30 py-6 px-8"
            >
              <p className="text-garud-cream font-semibold tracking-ultra uppercase text-sm">Welcome to the Tribe</p>
              <p className="text-garud-cream/70 text-xs mt-1">Your email has been saved. You&apos;ll hear from us when it matters.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-garud-teal-deep border border-garud-cream/25 text-garud-cream placeholder:text-garud-cream/40 px-5 py-4 text-sm outline-none focus:border-garud-cream transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-cream flex items-center gap-2 justify-center whitespace-nowrap disabled:opacity-60"
                >
                  {submitting ? 'Joining...' : 'Join'} <ArrowRight size={14} />
                </button>
              </div>
              {error && <p className="text-garud-ochre text-xs text-left">{error}</p>}
            </form>
          )}

          <p className="text-garud-cream/45 text-[10px] tracking-widest uppercase mt-5">
            No spam. Unsubscribe anytime. Warriors only.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
