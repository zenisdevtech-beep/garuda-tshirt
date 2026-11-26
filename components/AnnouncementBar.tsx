'use client';

const messages = [
  'FREE SHIPPING ON ORDERS ABOVE ₹999',
  'NEW DROP — THE WARRIORS COLLECTION IS HERE',
  'USE CODE: GARUD10 FOR 10% OFF YOUR FIRST ORDER',
  'FREE SHIPPING ON ORDERS ABOVE ₹999',
  'NEW DROP — THE WARRIORS COLLECTION IS HERE',
  'USE CODE: GARUD10 FOR 10% OFF YOUR FIRST ORDER',
];

export default function AnnouncementBar() {
  return (
    <div className="bg-garud-teal overflow-hidden py-2.5 relative z-50 border-b border-garud-teal-deep">
      <div className="flex whitespace-nowrap animate-ticker">
        {messages.map((msg, i) => (
          <span key={i} className="text-garud-cream text-[11px] font-semibold tracking-ultra uppercase px-10 flex-shrink-0">
            {msg}
            <span className="mx-6 opacity-40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
