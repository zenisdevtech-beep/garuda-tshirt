'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { refreshCart } = useCart();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [error, setError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    setOtpNotice('');
    if (!identifier.trim()) {
      setError('Please enter your email or phone number first.');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), purpose: 'LOGIN' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send 4-digit code.');
      } else {
        setOtpSent(true);
        setOtpNotice(
          data.devOtp
            ? `${data.message} — Dev Code: ${data.devOtp}`
            : data.message
        );
      }
    } catch {
      setError('Network error sending code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(otpCode)) {
      setError('Please enter the 4-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          otpCode,
          portal: 'customer',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      await refreshAuth();
      await refreshCart();
      router.push('/account');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-14 px-5 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#FFFDF5] border border-garud-cream-border shadow-[0_14px_40px_rgba(11,70,84,0.10)] p-7 sm:p-9">
        <p className="text-garud-ochre text-[10px] tracking-[0.35em] uppercase font-bold mb-1.5">Customer Portal</p>
        <h1 className="font-display text-3xl tracking-wider text-garud-teal font-bold mb-6">SIGN IN</h1>

        {error && (
          <p className="bg-red-50 border border-red-300 text-red-800 text-xs px-3.5 py-2.5 mb-4">
            {error}
          </p>
        )}
        {otpNotice && (
          <p className="bg-garud-teal/5 border border-garud-teal/30 text-garud-teal text-xs px-3.5 py-2.5 mb-4 font-medium leading-relaxed">
            {otpNotice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
              Email or Phone Number *
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="you@example.com or 9876543210"
              className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
            />
          </div>

          <div className="bg-garud-cream/60 border border-garud-cream-border p-4 space-y-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-ultra text-garud-teal">
              4-Digit Email Verification Code *
            </label>
            <p className="text-[11px] text-garud-muted">
              Sent to your registered email address.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                required
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit code"
                className="flex-1 bg-white border border-garud-cream-border px-3 py-2.5 text-sm tracking-[0.35em] font-bold text-center text-garud-teal placeholder:tracking-normal placeholder:font-normal outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="bg-garud-teal text-garud-cream hover:bg-garud-teal-light px-4 py-2.5 text-[11px] font-semibold uppercase tracking-ultra whitespace-nowrap transition-colors"
              >
                {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send Code'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-teal w-full">
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs mt-6 pt-5 border-t border-garud-cream-border text-garud-muted">
          <Link href="/forgot-password" className="hover:text-garud-teal underline">Forgot Password?</Link>
          <Link href="/register" className="text-garud-teal font-semibold hover:underline">Create Account →</Link>
        </div>
      </div>
    </div>
  );
}
