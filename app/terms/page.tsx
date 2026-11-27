export const metadata = {
  title: 'Terms & Conditions — GARUD',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent py-16 px-6 md:px-16">
      <div className="max-w-3xl mx-auto space-y-6 text-sm text-garud-ink/85 leading-relaxed">
        <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold">Legal</p>
        <h1 className="font-display text-5xl tracking-widest text-garud-teal font-bold">TERMS &amp; CONDITIONS</h1>
        <p>By accessing and placing orders on GARUD, you agree to provide accurate billing and shipping information.</p>
        <p>All product prices are listed in INR (₹) inclusive of applicable taxes. Limited drops are fulfilled on a first-come, server-validated stock basis.</p>
      </div>
    </div>
  );
}
