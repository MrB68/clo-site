'use client';
import { useState } from 'react';

export default function SizeGuide() {
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');

  const getRecommendedSize = () => {
    if (!height || !weight) return '';
    // very simple heuristic; adjust later
    if (weight < 55) return 'S';
    if (weight < 70) return 'M';
    if (weight < 85) return 'L';
    return 'XL';
  };

  const recommended = getRecommendedSize();

  return (
    <div className="pt-28 px-6 max-w-6xl mx-auto space-y-16 text-white bg-black min-h-screen">
      {/* Header */}
      <div className="space-y-5 text-center">
        <h1 className="text-4xl md:text-5xl tracking-[0.25em] uppercase font-semibold">
          Size Guide
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          Find your perfect fit with our sizing recommendations.
        </p>
      </div>

      {/* Fit Guide Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Regular Fit",
            desc: "Choose your usual size for a clean and standard fit."
          },
          {
            title: "Oversized Fit",
            desc: "Size up for a relaxed, street-style oversized look."
          },
          {
            title: "Slim Fit",
            desc: "Size down for a tighter, body-hugging fit."
          }
        ].map((item, i) => (
          <div
            key={i}
            className="border border-white/10 rounded-2xl p-6 space-y-3 bg-neutral-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="font-semibold tracking-wide">{item.title}</h3>
            <p className="text-sm text-gray-300">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Size Calculator */}
      <div className="border border-white/10 rounded-2xl p-6 bg-neutral-900 space-y-6">
        <h2 className="text-lg font-semibold tracking-wide text-center">Size Calculator</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Height (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
            className="p-3 rounded-xl border border-white/10 bg-neutral-800 text-sm text-white outline-none"
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            className="p-3 rounded-xl border border-white/10 bg-neutral-800 text-sm text-white outline-none"
          />
        </div>

        <div className="text-center">
          {recommended ? (
            <p className="text-lg font-medium">
              Recommended Size: <span className="font-semibold">{recommended}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Enter your height and weight to get a recommendation
            </p>
          )}
        </div>
      </div>

      {/* Size Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-neutral-800">
            <tr>
              <th className="p-3 text-left font-medium">Size</th>
              <th className="p-3 text-left font-medium">Chest (in)</th>
              <th className="p-3 text-left font-medium">Length (in)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {[
              { size: "S", chest: "36–38", length: "26" },
              { size: "M", chest: "38–40", length: "27" },
              { size: "L", chest: "40–42", length: "28" },
              { size: "XL", chest: "42–44", length: "29" }
            ].map((row, i) => (
              <tr key={i} className="bg-neutral-900">
                <td className="p-3">{row.size}</td>
                <td className="p-3">{row.chest}</td>
                <td className="p-3">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tips Section */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Sizing Tips</h2>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Measure your chest for best accuracy</li>
          <li>• Compare with your favorite fitting clothing</li>
          <li>• When in doubt, size up for comfort</li>
        </ul>
      </div>

      {/* Footer spacing */}
      <div className="pb-10" />
    </div>
  );
}