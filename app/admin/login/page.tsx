'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, portal: 'admin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Admin login failed');
        setLoading(false);
        return;
      }
      await refreshAuth();
      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-garud-teal-deep text-garud-cream border border-garud-cream/20 p-8 shadow-2xl">
        <div className="flex items-center gap-2 text-garud-ochre text-xs tracking-mega uppercase font-semibold mb-2">
          <ShieldCheck size={15} /> Restricted Portal
        </div>
        <h1 className="font-display text-4xl tracking-widest text-garud-cream font-bold mb-2">ADMIN SIGN IN</h1>
        <p className="text-xs text-garud-cream/65 mb-6">Authorized GARUD store administrators only.</p>

        {error && (
          <p className="bg-red-950/60 border border-red-400/50 text-red-200 text-xs p-3 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Admin Email Address"
            className="w-full bg-garud-teal border border-garud-cream/25 text-garud-cream placeholder:text-garud-cream/45 px-4 py-3 text-sm outline-none focus:border-garud-cream"
          />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full bg-garud-teal border border-garud-cream/25 text-garud-cream placeholder:text-garud-cream/45 px-4 py-3 text-sm outline-none focus:border-garud-cream"
          />
          <button type="submit" disabled={loading} className="btn-cream w-full text-center">
            {loading ? 'Verifying...' : 'Sign In to Admin'}
          </button>
        </form>

        <div className="text-xs mt-6 text-garud-cream/60 text-center">
          Customer?{' '}
          <Link href="/login" className="text-garud-cream font-semibold underline">
            Go to Customer Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
