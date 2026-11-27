export const metadata = {
  title: 'Shipping Policy — GARUD',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent py-16 px-6 md:px-16">
      <div className="max-w-3xl mx-auto space-y-6 text-sm text-garud-ink/85 leading-relaxed">
        <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold">Logistics</p>
        <h1 className="font-display text-5xl tracking-widest text-garud-teal font-bold">SHIPPING POLICY</h1>
        <p>All GARUD orders are processed and dispatched from our Mumbai fulfillment studio within 24–48 business hours.</p>
        <p><strong>Free Shipping:</strong> Orders above ₹999 qualify for complimentary standard shipping across India. Orders below ₹999 incur a flat ₹99 shipping charge.</p>
        <p><strong>Delivery Time:</strong> 3–5 business days for metro cities and 5–7 business days for other serviceable PIN codes. Tracking AWB details are updated in your Customer Dashboard once dispatched.</p>
      </div>
    </div>
  );
}
