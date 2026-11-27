'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Truck, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state, refreshCart, applyCoupon } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [shippingLine1, setShippingLine1] = useState('');
  const [shippingLine2, setShippingLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPin, setShippingPin] = useState('');
  const [shippingCountry, setShippingCountry] = useState('India');

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingLine1, setBillingLine1] = useState('');
  const [billingLine2, setBillingLine2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingPin, setBillingPin] = useState('');
  const [billingCountry, setBillingCountry] = useState('India');

  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState(state.couponCode || '');
  const [couponMsg, setCouponMsg] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('COD');
  const [pinStatus, setPinStatus] = useState<{ serviceable: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setCustomerName(prev => prev || user.name);
      setCustomerEmail(prev => prev || user.email);
      setCustomerPhone(prev => prev || user.phone || '');
    }
  }, [user]);

  const checkPin = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setPinStatus({ serviceable: false, message: 'Enter a valid 6-digit PIN code.' });
      return;
    }
    const res = await fetch(`/api/shipping/check?pincode=${pin}&cod=${paymentMethod === 'COD'}`);
    const data = await res.json();
    setPinStatus({ serviceable: Boolean(data.serviceable), message: data.message });
  };

  const handleApplyCoupon = async () => {
    const res = await applyCoupon(couponInput);
    setCouponMsg(res.message);
  };

  const buildPayload = () => {
    const shippingAddress = {
      line1: shippingLine1,
      line2: shippingLine2,
      city: shippingCity,
      state: shippingState,
      pinCode: shippingPin,
      country: shippingCountry,
    };
    const billingAddress = sameAsShipping
      ? shippingAddress
      : {
          line1: billingLine1,
          line2: billingLine2,
          city: billingCity,
          state: billingState,
          pinCode: billingPin,
          country: billingCountry,
        };
    return {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      notes,
      couponCode: state.couponCode || undefined,
    };
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (state.items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }
    setSubmitting(true);

    try {
      const payload = buildPayload();

      if (paymentMethod === 'COD') {
        const res = await fetch('/api/checkout/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, paymentMethod: 'COD' }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Could not place order.');
          setSubmitting(false);
          return;
        }
        await refreshCart(null);
        router.push(`/order-success/${data.order.orderNumber}?email=${encodeURIComponent(customerEmail)}`);
        return;
      }

      // Razorpay online payment flow
      const initRes = await fetch('/api/checkout/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const initData = await initRes.json();
      if (!initRes.ok) {
        setErrorMsg(initData.error || 'Could not initialize Razorpay checkout.');
        setSubmitting(false);
        return;
      }

      if (!window.Razorpay) {
        setErrorMsg('Razorpay SDK failed to load. Please refresh or choose Cash on Delivery.');
        setSubmitting(false);
        return;
      }

      const rp = new window.Razorpay({
        key: initData.keyId,
        amount: initData.amount,
        currency: initData.currency,
        name: 'GARUD',
        description: `Order ${initData.orderNumber}`,
        order_id: initData.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: '#0B4654' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/checkout/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setErrorMsg(verifyData.error || 'Payment verification failed.');
            setSubmitting(false);
            return;
          }
          await refreshCart(null);
          router.push(`/order-success/${verifyData.order.orderNumber}?email=${encodeURIComponent(customerEmail)}`);
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setErrorMsg('Payment was cancelled before completion. Your order has not been confirmed.');
          },
        },
      });
      rp.open();
    } catch {
      setErrorMsg('Network error during checkout. Please try again.');
      setSubmitting(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6 py-24">
        <h1 className="font-display text-3xl tracking-widest text-garud-teal font-bold mb-4">YOUR CART IS EMPTY</h1>
        <Link href="/shop" className="btn-teal">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
        <div className="mb-8">
          <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-1">Secure Checkout</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-widest text-garud-teal font-bold">CHECKOUT</h1>
        </div>

        <div className="teal-line mb-10" />

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 mb-6 flex items-start gap-3 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Customer Details */}
            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4">
              <h2 className="font-display text-xl tracking-widest text-garud-teal font-bold">1. CUSTOMER DETAILS</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Full Name *"
                  className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                />
              </div>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Phone Number (e.g. +91 9876543210) *"
                className="w-full bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
              />
            </div>

            {/* Shipping Address */}
            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4">
              <h2 className="font-display text-xl tracking-widest text-garud-teal font-bold">2. SHIPPING ADDRESS</h2>
              <input
                type="text"
                required
                value={shippingLine1}
                onChange={e => setShippingLine1(e.target.value)}
                placeholder="Street Address / House No. *"
                className="w-full bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
              />
              <input
                type="text"
                value={shippingLine2}
                onChange={e => setShippingLine2(e.target.value)}
                placeholder="Apartment, Landmark (Optional)"
                className="w-full bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={e => setShippingCity(e.target.value)}
                  placeholder="City *"
                  className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                />
                <input
                  type="text"
                  required
                  value={shippingState}
                  onChange={e => setShippingState(e.target.value)}
                  placeholder="State *"
                  className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingPin}
                    onChange={e => setShippingPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN Code (6 digits) *"
                    className="flex-1 bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                  />
                  <button
                    type="button"
                    onClick={() => checkPin(shippingPin)}
                    className="bg-garud-teal text-garud-cream px-3 text-xs font-semibold uppercase tracking-ultra"
                  >
                    Verify
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={shippingCountry}
                  onChange={e => setShippingCountry(e.target.value)}
                  placeholder="Country *"
                  className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                />
              </div>
              {pinStatus && (
                <p className={`text-xs font-medium flex items-center gap-1.5 ${pinStatus.serviceable ? 'text-garud-teal' : 'text-red-700'}`}>
                  <Truck size={13} /> {pinStatus.message}
                </p>
              )}

              <label className="flex items-center gap-2 text-xs text-garud-teal font-semibold pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={e => setSameAsShipping(e.target.checked)}
                  className="accent-garud-teal"
                />
                Billing address is the same as shipping address
              </label>

              {!sameAsShipping && (
                <div className="pt-4 border-t border-garud-cream-border space-y-3">
                  <h3 className="text-xs tracking-ultra uppercase font-bold text-garud-teal">Billing Address</h3>
                  <input
                    type="text"
                    required
                    value={billingLine1}
                    onChange={e => setBillingLine1(e.target.value)}
                    placeholder="Billing Street Address *"
                    className="w-full bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                  />
                  <input
                    type="text"
                    value={billingLine2}
                    onChange={e => setBillingLine2(e.target.value)}
                    placeholder="Apartment, Suite (Optional)"
                    className="w-full bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={billingCity}
                      onChange={e => setBillingCity(e.target.value)}
                      placeholder="City *"
                      className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                    />
                    <input
                      type="text"
                      required
                      value={billingState}
                      onChange={e => setBillingState(e.target.value)}
                      placeholder="State *"
                      className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={billingPin}
                      onChange={e => setBillingPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN Code *"
                      className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                    />
                    <input
                      type="text"
                      required
                      value={billingCountry}
                      onChange={e => setBillingCountry(e.target.value)}
                      placeholder="Country *"
                      className="bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
                    />
                  </div>
                </div>
              )}

              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Order notes / delivery instructions (optional)"
                className="w-full bg-garud-cream border border-garud-cream-border px-3.5 py-3 text-sm outline-none focus:border-garud-teal"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4">
              <h2 className="font-display text-xl tracking-widest text-garud-teal font-bold">3. PAYMENT METHOD</h2>
              <label
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                  paymentMethod === 'RAZORPAY' ? 'border-garud-teal bg-garud-cream' : 'border-garud-cream-border'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="mt-1 accent-garud-teal"
                />
                <div>
                  <p className="text-sm font-bold text-garud-teal">Razorpay (UPI / Credit &amp; Debit Cards / NetBanking)</p>
                  <p className="text-xs text-garud-muted">Encrypted server-verified online payment via Razorpay.</p>
                </div>
              </label>

              {state.codEnabled && (
                <label
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'COD' ? 'border-garud-teal bg-garud-cream' : 'border-garud-cream-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-garud-teal"
                  />
                  <div>
                    <p className="text-sm font-bold text-garud-teal">Cash on Delivery (COD)</p>
                    <p className="text-xs text-garud-muted">Pay via cash or UPI when your order arrives.</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Right Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-garud-cream-dark border border-garud-cream-border p-6 sticky top-24 space-y-5">
              <h2 className="font-display text-2xl tracking-widest text-garud-teal font-bold">ORDER SUMMARY</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {state.items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-14 h-16 bg-garud-cream border border-garud-cream-border flex-shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-garud-ink truncate">{item.product.name}</p>
                      <p className="text-[11px] text-garud-muted">{item.size} · {item.color} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-garud-teal">₹{item.lineTotal.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="teal-line" />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs outline-none focus:border-garud-teal"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-garud-teal text-garud-cream px-4 py-2 text-xs font-semibold uppercase tracking-ultra"
                >
                  Apply
                </button>
              </div>
              {couponMsg && <p className="text-xs text-garud-teal font-semibold">{couponMsg}</p>}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-garud-muted">Subtotal</span>
                  <span className="font-semibold">₹{state.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {state.discount > 0 && (
                  <div className="flex justify-between text-garud-ochre font-semibold">
                    <span>Discount ({state.couponCode})</span>
                    <span>-₹{state.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-garud-muted">Shipping</span>
                  <span className="font-semibold text-garud-teal">
                    {state.shippingCharge === 0 ? 'FREE' : `₹${state.shippingCharge}`}
                  </span>
                </div>
                <div className="teal-line my-2" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-bold text-garud-ink">Total Payable</span>
                  <span className="font-display text-2xl text-garud-teal font-bold tracking-widest">
                    ₹{state.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-teal w-full text-center flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Lock size={14} />
                {submitting
                  ? 'Processing Order...'
                  : paymentMethod === 'RAZORPAY'
                  ? `Pay ₹${state.total.toLocaleString('en-IN')} via Razorpay`
                  : `Place COD Order (₹${state.total.toLocaleString('en-IN')})`}
              </button>

              <p className="text-[10px] text-garud-muted flex items-center justify-center gap-1.5 uppercase tracking-widest">
                <ShieldCheck size={13} className="text-garud-teal" /> Server-verified stock &amp; pricing
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
