'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Request failed');
      else setStatus(data.message);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-garud-cream-dark/60 border border-garud-cream-border p-8">
        <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-2">Account Recovery</p>
        <h1 className="font-display text-3xl tracking-widest text-garud-teal font-bold mb-6">FORGOT PASSWORD</h1>

        {error && <p className="bg-red-50 border border-red-300 text-red-800 text-xs p-3 mb-4">{error}</p>}
        {status && <p className="bg-garud-cream border border-garud-teal text-garud-teal text-xs p-3 mb-4">{status}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Registered Email Address"
            className="w-full bg-garud-cream border border-garud-cream-border px-4 py-3 text-sm outline-none focus:border-garud-teal"
          />
          <button type="submit" disabled={loading} className="btn-teal w-full text-center">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-xs mt-6 text-garud-muted text-center">
          <Link href="/login" className="text-garud-teal font-semibold hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
