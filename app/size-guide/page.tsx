export const metadata = {
  title: 'Size Guide — GARUD',
  description: 'GARUD streetwear sizing chart in inches for T-Shirts, Hoodies, and Joggers.',
};

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-transparent py-16 px-6 md:px-16">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-2">Fit Reference</p>
          <h1 className="font-display text-5xl tracking-widest text-garud-teal font-bold">SIZE GUIDE (INCHES)</h1>
        </div>

        <div className="bg-garud-cream-dark/50 border border-garud-cream-border p-6 overflow-x-auto">
          <h2 className="font-display text-2xl text-garud-teal font-bold tracking-widest mb-4">OVERSIZED TEES &amp; HOODIES</h2>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-garud-teal text-garud-cream">
                <th className="p-3">Size</th>
                <th className="p-3">Chest</th>
                <th className="p-3">Length</th>
                <th className="p-3">Shoulder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garud-cream-border">
              {[
                ['XS', '40"', '26.5"', '19.5"'],
                ['S', '42"', '27.5"', '20.5"'],
                ['M', '44"', '28.5"', '21.5"'],
                ['L', '46"', '29.5"', '22.5"'],
                ['XL', '48"', '30.5"', '23.5"'],
                ['XXL', '50"', '31.5"', '24.5"'],
              ].map(row => (
                <tr key={row[0]}>
                  {row.map((c, idx) => (
                    <td key={idx} className={`p-3 ${idx === 0 ? 'font-bold text-garud-teal' : ''}`}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
