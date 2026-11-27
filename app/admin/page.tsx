'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { ProductDTO } from '@/lib/product-utils';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Truck,
  X,
  LogOut,
} from 'lucide-react';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  awbCode: string | null;
  courierName: string | null;
  createdAt: string;
  items: Array<{ id: string; productName: string; size: string; quantity: number; totalPrice: number }>;
}

interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrder: number;
  usedCount: number;
  isActive: boolean;
}

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
}

const ORDER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'CONFIRMED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<'overview' | 'products' | 'orders' | 'coupons' | 'customers' | 'content'>('overview');
  const [productModalOpen, setProductModalOpen] = useState(false);

  const [stats, setStats] = useState<{
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    subscriberCount: number;
    unreadContacts: number;
    recentOrders: AdminOrder[];
  } | null>(null);

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [content, setContent] = useState<{
    announcements: Array<{ id: string; text: string; isActive: boolean }>;
    testimonials: Array<{ id: string; name: string; location: string; product: string; text: string }>;
    subscribers: Array<{ id: string; email: string; createdAt: string }>;
    contacts: Array<{ id: string; name: string; email: string; subject: string; message: string; status: string }>;
    settings: Record<string, string>;
  } | null>(null);

  const [notice, setNotice] = useState('');

  // Product Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pPrice, setPPrice] = useState('1499');
  const [pOrigPrice, setPOrigPrice] = useState('');
  const [pCat, setPCat] = useState('tshirts');
  const [pMat, setPMat] = useState('240GSM 100% Cotton');
  const [pDesc, setPDesc] = useState('');
  const [pImage, setPImage] = useState('');
  const [pStock, setPStock] = useState('15');
  const [pBestseller, setPBestseller] = useState(false);
  const [pNew, setPNew] = useState(true);

  // Coupon Form State
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [cVal, setCVal] = useState('10');
  const [cMin, setCMin] = useState('499');

  // Announcement & Settings
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [freeShip, setFreeShip] = useState('999');
  const [shipFee, setShipFee] = useState('99');
  const [codEnabled, setCodEnabled] = useState('true');

  const loadAll = useCallback(async () => {
    const [st, pr, or, cp, cu, ct] = await Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/orders').then(r => r.json()),
      fetch('/api/admin/coupons').then(r => r.json()),
      fetch('/api/admin/customers').then(r => r.json()),
      fetch('/api/admin/content').then(r => r.json()),
    ]);
    if (!st.error) setStats(st);
    if (pr.products) setProducts(pr.products);
    if (or.orders) setOrders(or.orders);
    if (cp.coupons) setCoupons(cp.coupons);
    if (cu.customers) setCustomers(cu.customers);
    if (!ct.error) {
      setContent(ct);
      setFreeShip(ct.settings?.freeShippingThreshold || '999');
      setShipFee(ct.settings?.standardShippingFee || '99');
      setCodEnabled(ct.settings?.codEnabled || 'true');
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'ADMIN') {
        router.replace('/admin/login');
      } else {
        loadAll();
      }
    }
  }, [user, loading, router, loadAll]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center text-garud-teal py-24">Verifying Admin Access...</div>;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setPImage(data.url);
      setNotice('Image uploaded successfully.');
    } else {
      setNotice(data.error || 'Image upload failed');
    }
  };

  const resetProductForm = () => {
    setEditingId(null);
    setPName('');
    setPSku('');
    setPSlug('');
    setPPrice('1499');
    setPOrigPrice('');
    setPCat('tshirts');
    setPMat('240GSM 100% Cotton');
    setPDesc('');
    setPImage('');
    setPStock('15');
    setPBestseller(false);
    setPNew(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const catLabels: Record<string, string> = {
      tshirts: 'T-Shirts',
      hoodies: 'Hoodies',
      joggers: 'Joggers',
      jackets: 'Jackets',
      accessories: 'Accessories',
    };
    const stockNum = Math.max(0, Number(pStock || 0));
    const sizes = pCat === 'accessories' ? ['One Size'] : ['S', 'M', 'L', 'XL'];

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      sku: pSku || `GRD-${Date.now().toString().slice(-4)}`,
      name: pName,
      slug: pSlug || pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: pDesc,
      price: Number(pPrice),
      originalPrice: pOrigPrice ? Number(pOrigPrice) : null,
      category: pCat,
      categoryLabel: catLabels[pCat] || 'Apparel',
      material: pMat,
      images: [pImage || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'],
      colors: [{ name: 'Jet Black', hex: '#0A0A0A' }],
      tags: [
        ...(pNew ? ['new'] : []),
        ...(pBestseller ? ['bestseller'] : []),
      ],
      isBestseller: pBestseller,
      isNewArrival: pNew,
      isActive: true,
      variants: sizes.map(sz => ({ size: sz, color: 'Jet Black', stock: stockNum })),
    };

    const res = await fetch('/api/admin/products', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      setNotice(editingId ? 'Product updated.' : 'Product created.');
      resetProductForm();
      setProductModalOpen(false);
      loadAll();
    } else {
      setNotice(data.error || 'Failed to save product.');
    }
  };

  const openAddProduct = () => {
    resetProductForm();
    setProductModalOpen(true);
  };

  const startEditProduct = (p: ProductDTO) => {
    setEditingId(p.id);
    setPName(p.name);
    setPSku(p.sku);
    setPSlug(p.slug);
    setPPrice(String(p.price));
    setPOrigPrice(p.originalPrice ? String(p.originalPrice) : '');
    setPCat(p.category);
    setPMat(p.material);
    setPDesc(p.description);
    setPImage(p.images[0] || '');
    setPStock(String(p.variants[0]?.stock ?? 10));
    setPBestseller(p.isBestseller);
    setPNew(p.isNewArrival);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setNotice('Product deleted.');
      loadAll();
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: Record<string, unknown>) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...updates }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotice(data.shiprocketNotice || 'Order updated.');
      loadAll();
    } else {
      setNotice(data.error || 'Order update failed.');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: cCode,
        discountType: cType,
        discountValue: Number(cVal),
        minOrder: Number(cMin),
        isActive: true,
      }),
    });
    if (res.ok) {
      setCCode('');
      setNotice('Coupon created.');
      loadAll();
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold">Store Control Center</p>
            <h1 className="font-display text-4xl tracking-widest text-garud-teal font-bold">GARUD ADMIN</h1>
          </div>
          <div className="flex items-center gap-3">
            {notice && (
              <div className="bg-garud-teal text-garud-cream text-xs px-4 py-2 font-semibold">
                {notice}
              </div>
            )}
            <button
              onClick={async () => {
                await logout();
                router.push('/admin/login');
              }}
              className="btn-outline-teal text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-garud-cream-border pb-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'content', label: 'Content & Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
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

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString('en-IN')}` },
                { label: 'Total Orders', value: stats.totalOrders },
                { label: 'Customers', value: stats.totalCustomers },
                { label: 'Products', value: stats.totalProducts },
              ].map((kpi, i) => (
                <div key={i} className="bg-garud-cream-dark/60 border border-garud-cream-border p-5">
                  <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-semibold mb-1">{kpi.label}</p>
                  <p className="font-display text-3xl text-garud-teal font-bold tracking-widest">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-garud-cream-dark/40 border border-garud-cream-border p-6">
              <h2 className="font-display text-2xl tracking-widest text-garud-teal font-bold mb-4">RECENT ORDERS</h2>
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-garud-muted">No orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-garud-cream-border text-garud-muted uppercase tracking-ultra">
                        <th className="py-2.5">Order #</th>
                        <th className="py-2.5">Customer</th>
                        <th className="py-2.5">Payment</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-garud-cream-border">
                      {stats.recentOrders.map(o => (
                        <tr key={o.id}>
                          <td className="py-3 font-bold text-garud-teal">{o.orderNumber}</td>
                          <td className="py-3">{o.customerName}</td>
                          <td className="py-3">{o.paymentMethod} · {o.paymentStatus}</td>
                          <td className="py-3 font-semibold text-garud-teal">{o.orderStatus}</td>
                          <td className="py-3 text-right font-bold">₹{o.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-garud-muted uppercase tracking-ultra font-semibold">
                Manage Catalog ({products.length} products)
              </p>
              <button onClick={openAddProduct} className="btn-teal flex items-center gap-2 py-3 px-6">
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-garud-cream-dark/40 border border-garud-cream-border p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-garud-teal truncate">{p.name}</p>
                    <p className="text-xs text-garud-muted">
                      {p.sku} · {p.categoryLabel} · ₹{p.price.toLocaleString('en-IN')} · Stock: {p.stock}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEditProduct(p)}
                      title="Edit Product"
                      aria-label={`Edit ${p.name}`}
                      className="border border-garud-cream-border p-2 text-garud-teal hover:bg-garud-cream hover:border-garud-teal transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Delete Product"
                      aria-label={`Delete ${p.name}`}
                      className="border border-garud-cream-border p-2 text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD / EDIT PRODUCT MODAL */}
        {productModalOpen && (
          <div className="fixed inset-0 z-[100] bg-garud-teal-deep/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <form
              onSubmit={handleSaveProduct}
              className="bg-[#FFFDF5] border border-garud-cream-border w-full max-w-2xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-garud-teal-deep text-garud-cream px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-[10px] tracking-mega uppercase text-garud-cream/65 font-semibold">
                    Catalog Management
                  </p>
                  <h2 className="font-display text-2xl tracking-widest font-bold">
                    {editingId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    resetProductForm();
                  }}
                  className="text-garud-cream/70 hover:text-garud-cream p-1 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                    placeholder="e.g. Garud Mythic Oversized Tee"
                    className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={pSku}
                      onChange={e => setPSku(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={pSlug}
                      onChange={e => setPSlug(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={pPrice}
                      onChange={e => setPPrice(e.target.value)}
                      placeholder="1499"
                      className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                      Regular MRP (₹)
                    </label>
                    <input
                      type="number"
                      value={pOrigPrice}
                      onChange={e => setPOrigPrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                      Stock Per Size *
                    </label>
                    <input
                      type="number"
                      required
                      value={pStock}
                      onChange={e => setPStock(e.target.value)}
                      placeholder="15"
                      className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                      Category *
                    </label>
                    <select
                      value={pCat}
                      onChange={e => setPCat(e.target.value)}
                      className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    >
                      <option value="tshirts">T-Shirts</option>
                      <option value="hoodies">Hoodies</option>
                      <option value="joggers">Joggers</option>
                      <option value="jackets">Jackets</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                      Fabric / Material *
                    </label>
                    <input
                      type="text"
                      required
                      value={pMat}
                      onChange={e => setPMat(e.target.value)}
                      placeholder="240GSM 100% Cotton"
                      className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                    Product Image URL or Upload
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={pImage}
                      onChange={e => setPImage(e.target.value)}
                      placeholder="https://... or upload an image"
                      className="flex-1 bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                    />
                    <label className="bg-garud-teal hover:bg-garud-teal-light text-garud-cream px-4 py-2.5 text-xs font-semibold uppercase tracking-ultra cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload size={13} /> Upload
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-ultra text-garud-teal mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={pDesc}
                    onChange={e => setPDesc(e.target.value)}
                    placeholder="Describe fit, print details, and fabric feel..."
                    className="w-full bg-white border border-garud-cream-border px-3.5 py-2.5 text-sm text-garud-ink outline-none focus:border-garud-teal focus:ring-2 focus:ring-garud-teal/15 transition-all"
                  />
                </div>

                <div className="flex flex-wrap gap-6 pt-1 pb-2">
                  <label className="flex items-center gap-2 text-xs text-garud-teal font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pNew}
                      onChange={e => setPNew(e.target.checked)}
                      className="w-4 h-4 accent-garud-teal"
                    />
                    Mark as New Arrival
                  </label>
                  <label className="flex items-center gap-2 text-xs text-garud-teal font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pBestseller}
                      onChange={e => setPBestseller(e.target.checked)}
                      className="w-4 h-4 accent-garud-teal"
                    />
                    Mark as Bestseller
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-garud-cream-dark/60 border-t border-garud-cream-border px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    resetProductForm();
                  }}
                  className="border border-garud-teal text-garud-teal hover:bg-garud-teal hover:text-garud-cream font-semibold text-xs tracking-ultra uppercase px-6 py-3 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-garud-teal hover:bg-garud-teal-light text-garud-cream font-semibold text-xs tracking-ultra uppercase px-7 py-3 inline-flex items-center justify-center gap-2 transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-sm text-garud-muted">No orders yet.</p>
            ) : (
              orders.map(o => (
                <div key={o.id} className="bg-garud-cream-dark/50 border border-garud-cream-border p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-xl text-garud-teal font-bold tracking-widest">{o.orderNumber}</p>
                      <p className="text-xs text-garud-muted">{o.customerName} ({o.customerEmail}) · {o.customerPhone}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={o.orderStatus}
                        onChange={e => handleUpdateOrder(o.id, { orderStatus: e.target.value })}
                        className="bg-garud-cream border border-garud-cream-border px-3 py-1.5 text-xs font-semibold text-garud-teal"
                      >
                        {ORDER_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                      <select
                        value={o.paymentStatus}
                        onChange={e => handleUpdateOrder(o.id, { paymentStatus: e.target.value })}
                        className="bg-garud-cream border border-garud-cream-border px-3 py-1.5 text-xs font-semibold text-garud-teal"
                      >
                        {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map(ps => <option key={ps} value={ps}>{ps}</option>)}
                      </select>
                      <button
                        onClick={() => handleUpdateOrder(o.id, { createShipment: true })}
                        className="bg-garud-teal text-garud-cream px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                      >
                        <Truck size={12} /> Shiprocket
                      </button>
                      <span className="font-bold text-garud-teal text-sm">₹{o.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-xs text-garud-ink/80">
                    {o.items.map(it => `${it.productName} (${it.size}) × ${it.quantity}`).join(' · ')}
                  </div>
                  {o.awbCode && <p className="text-xs text-garud-teal font-semibold">AWB: {o.awbCode}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* COUPONS */}
        {tab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={handleCreateCoupon} className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-3 h-fit">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">CREATE COUPON</h2>
              <input type="text" required value={cCode} onChange={e => setCCode(e.target.value.toUpperCase())} placeholder="Code (e.g. GARUD15)" className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs outline-none" />
              <div className="grid grid-cols-3 gap-2">
                <select value={cType} onChange={e => setCType(e.target.value as 'PERCENT' | 'FIXED')} className="bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs outline-none">
                  <option value="PERCENT">Percent (%)</option>
                  <option value="FIXED">Fixed (₹)</option>
                </select>
                <input type="number" required value={cVal} onChange={e => setCVal(e.target.value)} placeholder="Value" className="bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs outline-none" />
                <input type="number" required value={cMin} onChange={e => setCMin(e.target.value)} placeholder="Min Order ₹" className="bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs outline-none" />
              </div>
              <button type="submit" className="btn-teal w-full text-center">Create Coupon</button>
            </form>

            <div className="space-y-3">
              {coupons.map(c => (
                <div key={c.id} className="bg-garud-cream-dark/40 border border-garud-cream-border p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-garud-teal">{c.code}</p>
                    <p className="text-xs text-garud-muted">
                      {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`} off · Min ₹{c.minOrder} · Used {c.usedCount}x
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await fetch('/api/admin/coupons', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
                        });
                        loadAll();
                      }}
                      className="text-xs px-3 py-1 border border-garud-cream-border font-semibold"
                    >
                      {c.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/coupons?id=${c.id}`, { method: 'DELETE' });
                        loadAll();
                      }}
                      className="text-red-700 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab === 'customers' && (
          <div className="bg-garud-cream-dark/40 border border-garud-cream-border p-6 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-garud-cream-border text-garud-muted uppercase tracking-ultra">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Phone</th>
                  <th className="py-2.5">Orders</th>
                  <th className="py-2.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garud-cream-border">
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="py-3 font-semibold text-garud-teal">{c.name}</td>
                    <td className="py-3">{c.email}</td>
                    <td className="py-3">{c.phone || '—'}</td>
                    <td className="py-3 font-bold">{c._count.orders}</td>
                    <td className="py-3">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENT & SETTINGS */}
        {tab === 'content' && content && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">STORE SETTINGS</h2>
              <div className="space-y-3 text-xs">
                <label className="block">
                  <span className="text-garud-muted uppercase font-semibold">Free Shipping Threshold (₹)</span>
                  <input type="number" value={freeShip} onChange={e => setFreeShip(e.target.value)} className="w-full mt-1 bg-garud-cream border border-garud-cream-border px-3 py-2 outline-none" />
                </label>
                <label className="block">
                  <span className="text-garud-muted uppercase font-semibold">Standard Shipping Fee (₹)</span>
                  <input type="number" value={shipFee} onChange={e => setShipFee(e.target.value)} className="w-full mt-1 bg-garud-cream border border-garud-cream-border px-3 py-2 outline-none" />
                </label>
                <label className="block">
                  <span className="text-garud-muted uppercase font-semibold">Cash on Delivery</span>
                  <select value={codEnabled} onChange={e => setCodEnabled(e.target.value)} className="w-full mt-1 bg-garud-cream border border-garud-cream-border px-3 py-2 outline-none">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>
                <button
                  onClick={async () => {
                    await fetch('/api/admin/content', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'settings',
                        data: { freeShippingThreshold: freeShip, standardShippingFee: shipFee, codEnabled },
                      }),
                    });
                    setNotice('Store settings saved.');
                  }}
                  className="btn-teal"
                >
                  Save Settings
                </button>
              </div>
            </div>

            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-4">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">ANNOUNCEMENTS</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAnnouncement}
                  onChange={e => setNewAnnouncement(e.target.value)}
                  placeholder="New announcement banner text..."
                  className="flex-1 bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs outline-none"
                />
                <button
                  onClick={async () => {
                    if (!newAnnouncement.trim()) return;
                    await fetch('/api/admin/content', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'announcement', data: { text: newAnnouncement } }),
                    });
                    setNewAnnouncement('');
                    loadAll();
                  }}
                  className="bg-garud-teal text-garud-cream px-4 py-2 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {content.announcements.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs">
                    <span>{a.text}</span>
                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/content?type=announcement&id=${a.id}`, { method: 'DELETE' });
                        loadAll();
                      }}
                      className="text-red-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-3">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">
                NEWSLETTER SUBSCRIBERS ({content.subscribers.length})
              </h2>
              <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                {content.subscribers.map(s => (
                  <div key={s.id} className="flex justify-between bg-garud-cream px-3 py-2 border border-garud-cream-border">
                    <span>{s.email}</span>
                    <span className="text-garud-muted">{new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 space-y-3">
              <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest">
                CONTACT MESSAGES ({content.contacts.length})
              </h2>
              <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                {content.contacts.map(m => (
                  <div key={m.id} className="bg-garud-cream p-3 border border-garud-cream-border">
                    <p className="font-bold text-garud-teal">{m.subject} — {m.name} ({m.email})</p>
                    <p className="text-garud-ink/80 mt-1">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
