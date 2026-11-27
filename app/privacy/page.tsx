export const metadata = {
  title: 'Privacy Policy — GARUD',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent py-16 px-6 md:px-16">
      <div className="max-w-3xl mx-auto space-y-6 text-sm text-garud-ink/85 leading-relaxed">
        <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold">Legal</p>
        <h1 className="font-display text-5xl tracking-widest text-garud-teal font-bold">PRIVACY POLICY</h1>
        <p>GARUD collects only the information required to process orders, manage your customer account, and deliver requested updates.</p>
        <p>Passwords are stored using strong cryptographic hashing (bcrypt), and online payments are processed securely through Razorpay without storing raw card details on our servers.</p>
      </div>
    </div>
  );
}
