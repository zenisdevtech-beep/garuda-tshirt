'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, Heart, MapPin, User, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import type { ProductDTO } from '@/lib/product-utils';

interface OrderItemDTO {
  id: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  totalPrice: number;
}

interface OrderDTO {
  id: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  awbCode: string | null;
  createdAt: string;
  items: OrderItemDTO[];
}

interface AddressDTO {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

function AccountContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading, logout, refreshAuth } = useAuth();

  const [tab, setTab] = useState(sp.get('tab') || 'orders');
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [wishlist, setWishlist] = useState<ProductDTO[]>([]);
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);

  // Profile form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Address form
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      fetch('/api/account/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
      fetch('/api/wishlist').then(r => r.json()).then(d => setWishlist(d.items || []));
      fetch('/api/account/addresses').then(r => r.json()).then(d => setAddresses(d.addresses || []));
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-garud-teal py-24">Loading account...</div>;
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });
    if (res.ok) {
      await refreshAuth();
      setProfileMsg('Profile updated.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const d = await res.json();
    setPwMsg(d.message || d.error);
    if (res.ok) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/account/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: addrLabel,
        fullName: addrName,
        phone: addrPhone,
        line1: addrLine1,
        city: addrCity,
        state: addrState,
        pinCode: addrPin,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setAddresses(prev => [d.address, ...prev]);
      setAddrName('');
      setAddrPhone('');
      setAddrLine1('');
      setAddrCity('');
      setAddrState('');
      setAddrPin('');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const res = await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
    if (res.ok) setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold">Warrior Dashboard</p>
            <h1 className="font-display text-4xl tracking-widest text-garud-teal font-bold">{user.name.toUpperCase()}</h1>
            <p className="text-xs text-garud-muted">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="btn-outline-teal text-xs px-5 py-2.5 flex items-center gap-2"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-garud-cream-border pb-4 mb-8">
          {[
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
            { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
            { id: 'profile', label: 'Profile & Password', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-xs tracking-ultra uppercase font-semibold border flex items-center gap-2 ${
                tab === id
                  ? 'bg-garud-teal text-garud-cream border-garud-teal'
                  : 'border-garud-cream-border text-garud-muted hover:text-garud-teal'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-garud-cream-dark/40 border border-garud-cream-border p-10 text-center">
                <p className="text-garud-muted text-sm mb-4">You haven&apos;t placed any orders yet.</p>
                <Link href="/shop" className="btn-teal">Explore Shop</Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-garud-cream-dark/50 border border-garud-cream-border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-display text-xl tracking-widest text-garud-teal font-bold">{order.orderNumber}</p>
                      <p className="text-xs text-garud-muted">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="bg-garud-teal text-garud-cream px-3 py-1 font-semibold uppercase tracking-ultra">
                        {order.orderStatus}
                      </span>
                      <span className="border border-garud-cream-border bg-garud-cream px-3 py-1 font-semibold text-garud-teal">
                        {order.paymentMethod} · {order.paymentStatus}
                      </span>
                      <span className="font-bold text-garud-teal text-sm">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-xs text-garud-ink/80 space-y-1 mb-3">
                    {order.items.map(it => (
                      <p key={it.id}>
                        {it.productName} ({it.size}, {it.color}) × {it.quantity} — ₹{it.totalPrice.toLocaleString('en-IN')}
                      </p>
                    ))}
                  </div>
                  {order.awbCode && (
                    <p className="text-xs text-garud-teal font-semibold">Tracking AWB: {order.awbCode}</p>
                  )}
                  <Link href={`/order-success/${order.orderNumber}`} className="text-xs text-garud-teal underline font-semibold mt-2 inline-block">
                    View Full Order Details →
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {tab === 'wishlist' && (
          wishlist.length === 0 ? (
            <div className="bg-garud-cream-dark/40 border border-garud-cream-border p-10 text-center">
              <p className="text-garud-muted text-sm mb-4">Your wishlist is empty.</p>
              <Link href="/shop" className="btn-teal">Browse Collection</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        )}

        {/* Addresses Tab */}
        {tab === 'addresses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">SAVED ADDRESSES</h2>
              {addresses.length === 0 ? (
                <p className="text-sm text-garud-muted">No saved addresses yet.</p>
              ) : (
                addresses.map(a => (
                  <div key={a.id} className="bg-garud-cream-dark/50 border border-garud-cream-border p-4 flex justify-between items-start">
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-garud-teal uppercase tracking-ultra">{a.label}</p>
                      <p className="font-semibold text-garud-ink">{a.fullName} · {a.phone}</p>
                      <p className="text-garud-muted">{a.line1}, {a.city}, {a.state} - {a.pinCode}</p>
                    </div>
                    <button onClick={() => handleDeleteAddress(a.id)} className="text-garud-muted hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddAddress} className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-3">
              <h3 className="font-display text-xl text-garud-teal font-bold tracking-widest">ADD NEW ADDRESS</h3>
              <input type="text" required value={addrLabel} onChange={e => setAddrLabel(e.target.value)} placeholder="Label (Home / Office)" className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-xs outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" required value={addrName} onChange={e => setAddrName(e.target.value)} placeholder="Full Name" className="bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-xs outline-none" />
                <input type="tel" required value={addrPhone} onChange={e => setAddrPhone(e.target.value)} placeholder="Phone" className="bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-xs outline-none" />
              </div>
              <input type="text" required value={addrLine1} onChange={e => setAddrLine1(e.target.value)} placeholder="Street Address" className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-xs outline-none" />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" required value={addrCity} onChange={e => setAddrCity(e.target.value)} placeholder="City" className="bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-xs outline-none" />
                <input type="text" required value={addrState} onChange={e => setAddrState(e.target.value)} placeholder="State" className="bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-xs outline-none" />
                <input type="text" required maxLength={6} value={addrPin} onChange={e => setAddrPin(e.target.value.replace(/\D/g, ''))} placeholder="PIN Code" className="bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-xs outline-none" />
              </div>
              <button type="submit" className="btn-teal w-full text-center">Save Address</button>
            </form>
          </div>
        )}

        {/* Profile & Password Tab */}
        {tab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={handleProfileSave} className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">EDIT PROFILE</h2>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-sm outline-none" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-sm outline-none" />
              <button type="submit" className="btn-teal">Save Profile</button>
              {profileMsg && <p className="text-xs text-garud-teal font-semibold">{profileMsg}</p>}
            </form>

            <form onSubmit={handlePasswordChange} className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">CHANGE PASSWORD</h2>
              <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-sm outline-none" />
              <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password (min 8 chars)" className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-sm outline-none" />
              <button type="submit" className="btn-teal">Update Password</button>
              {pwMsg && <p className="text-xs text-garud-teal font-semibold">{pwMsg}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-garud-teal">Loading...</div>}>
      <AccountContent />
    </Suspense>
  );
}
