'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useParams } from 'next/navigation';
import { CheckCircle2, Package, Truck } from 'lucide-react';

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  awbCode?: string | null;
  courierName?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    productSlug: string;
    productImg: string;
    size: string;
    color: string;
    quantity: number;
    totalPrice: number;
  }>;
}

export default function OrderSuccessPage() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params?.orderNumber) return;
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    fetch(`/api/orders/${encodeURIComponent(params.orderNumber)}${q}`)
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Could not load order');
        setOrder(d.order);
      })
      .catch(err => setError(err.message));
  }, [params?.orderNumber, email]);

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-garud-teal font-bold mb-3">ORDER LOOKUP</h1>
        <p className="text-garud-muted text-sm mb-6">{error}</p>
        <Link href="/account" className="btn-teal">Go to My Account</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center py-24 text-garud-teal">
        Loading order details...
      </div>
    );
  }

  const addr = JSON.parse(order.shippingAddress) as {
    line1: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };

  return (
    <div className="min-h-screen bg-transparent py-14 px-6 md:px-16">
      <div className="max-w-3xl mx-auto bg-garud-cream-dark/60 border border-garud-cream-border p-8">
        <div className="flex items-center gap-3 text-garud-teal mb-4">
          <CheckCircle2 size={28} />
          <div>
            <p className="text-xs tracking-mega uppercase font-semibold text-garud-muted">Order Confirmed</p>
            <h1 className="font-display text-3xl md:text-4xl tracking-widest font-bold">{order.orderNumber}</h1>
          </div>
        </div>

        <div className="teal-line my-6" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-xs">
          <div className="bg-garud-cream border border-garud-cream-border p-4">
            <p className="text-garud-muted uppercase tracking-ultra mb-1">Order Status</p>
            <p className="font-bold text-garud-teal flex items-center gap-1.5">
              <Package size={14} /> {order.orderStatus}
            </p>
          </div>
          <div className="bg-garud-cream border border-garud-cream-border p-4">
            <p className="text-garud-muted uppercase tracking-ultra mb-1">Payment</p>
            <p className="font-bold text-garud-teal">{order.paymentMethod} · {order.paymentStatus}</p>
          </div>
          <div className="bg-garud-cream border border-garud-cream-border p-4">
            <p className="text-garud-muted uppercase tracking-ultra mb-1">Total</p>
            <p className="font-bold text-garud-teal">₹{order.total.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {order.awbCode && (
          <div className="bg-garud-teal text-garud-cream p-4 mb-6 text-xs flex items-center gap-2">
            <Truck size={15} />
            <span>Shipped via {order.courierName || 'Courier'} · AWB: <strong>{order.awbCode}</strong></span>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xs tracking-ultra uppercase font-bold text-garud-teal mb-3">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-garud-cream border border-garud-cream-border p-3">
                <div className="relative w-14 h-16 bg-garud-cream-dark flex-shrink-0">
                  <Image src={item.productImg} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-garud-teal">{item.productName}</p>
                  <p className="text-xs text-garud-muted">{item.size} · {item.color} × {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-garud-teal">₹{item.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-garud-muted mb-8">
          <p className="font-bold text-garud-teal uppercase tracking-ultra mb-1">Shipping To</p>
          <p>{order.customerName} ({order.customerPhone})</p>
          <p>{addr.line1}, {addr.city}, {addr.state} - {addr.pinCode}, {addr.country}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="btn-teal">Continue Shopping</Link>
          <Link href="/account" className="btn-outline-teal">Track in My Account</Link>
        </div>
      </div>
    </div>
  );
}
