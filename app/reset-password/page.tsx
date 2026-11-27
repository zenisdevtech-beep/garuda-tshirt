'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ResetForm() {
  const sp = useSearchParams();
  const token = sp.get('token') || '';
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Reset failed');
      else setStatus(data.message);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-garud-cream-dark/60 border border-garud-cream-border p-8">
      <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-2">Security</p>
      <h1 className="font-display text-3xl tracking-widest text-garud-teal font-bold mb-6">RESET PASSWORD</h1>

      {error && <p className="bg-red-50 border border-red-300 text-red-800 text-xs p-3 mb-4">{error}</p>}
      {status && (
        <div className="bg-garud-cream border border-garud-teal text-garud-teal text-xs p-3 mb-4">
          {status}{' '}
          <Link href="/login" className="underline font-bold">Sign In Now</Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New Password (min 8 chars)"
          className="w-full bg-garud-cream border border-garud-cream-border px-4 py-3 text-sm outline-none focus:border-garud-teal"
        />
        <button type="submit" disabled={loading || !token} className="btn-teal w-full text-center disabled:opacity-50">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-transparent py-20 px-6 flex items-center justify-center">
      <Suspense fallback={<div className="text-garud-teal">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
