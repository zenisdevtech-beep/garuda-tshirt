'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send message.');
      } else {
        setStatus(data.message);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-16 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-2">Get in Touch</p>
        <h1 className="font-display text-5xl tracking-widest text-garud-teal font-bold mb-10">CONTACT US</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-garud-teal mt-0.5" />
                <div>
                  <p className="font-bold text-garud-teal text-xs uppercase tracking-ultra">Email</p>
                  <p className="text-garud-ink">support@garudwear.in</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-garud-teal mt-0.5" />
                <div>
                  <p className="font-bold text-garud-teal text-xs uppercase tracking-ultra">Support Hours</p>
                  <p className="text-garud-ink">Mon–Sat, 10:00 AM – 7:00 PM IST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-garud-teal mt-0.5" />
                <div>
                  <p className="font-bold text-garud-teal text-xs uppercase tracking-ultra">Studio</p>
                  <p className="text-garud-ink">Mumbai, Maharashtra, Bharat</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-garud-cream-dark/50 border border-garud-cream-border p-8 space-y-4">
            {error && <p className="bg-red-50 border border-red-300 text-red-800 text-xs p-3">{error}</p>}
            {status && <p className="bg-garud-cream border border-garud-teal text-garud-teal text-xs p-3 font-semibold">{status}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name *" className="bg-garud-cream border border-garud-cream-border px-4 py-3 text-sm outline-none focus:border-garud-teal" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address *" className="bg-garud-cream border border-garud-cream-border px-4 py-3 text-sm outline-none focus:border-garud-teal" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (Optional)" className="bg-garud-cream border border-garud-cream-border px-4 py-3 text-sm outline-none focus:border-garud-teal" />
              <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject *" className="bg-garud-cream border border-garud-cream-border px-4 py-3 text-sm outline-none focus:border-garud-teal" />
            </div>
            <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message *" className="w-full bg-garud-cream border border-garud-cream-border px-4 py-3 text-sm outline-none focus:border-garud-teal" />
            <button type="submit" disabled={loading} className="btn-teal">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
