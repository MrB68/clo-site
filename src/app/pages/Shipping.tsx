export default function Shipping() {
  return (
    <div className="pt-28 px-6 max-w-6xl mx-auto space-y-16 text-white bg-black min-h-screen">
      {/* Header */}
      <div className="space-y-5 text-center">
        <h1 className="text-4xl md:text-5xl tracking-[0.25em] uppercase font-semibold">
          Shipping & Returns
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          Fast, reliable delivery across Nepal with a simple and transparent exchange process.
        </p>
      </div>

      {/* Shipping Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Processing Time", desc: "Orders are processed within 1–2 business days." },
          { title: "Inside Valley", desc: "Delivery within 1–2 days inside Kathmandu Valley." },
          { title: "Outside Valley", desc: "Delivery within 2–4 days depending on location." }
        ].map((item, i) => (
          <div
            key={i}
            className="border border-white/10 rounded-2xl p-6 space-y-3 bg-neutral-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

      {/* Charges + Returns */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4 border border-white/10 rounded-2xl p-6 bg-neutral-900 hover:shadow-md transition">
          <h2 className="text-lg font-semibold tracking-wide">Shipping Charges</h2>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Kathmandu Valley: NPR 100–150</li>
            <li>• Outside Valley: NPR 150–250</li>
            <li>• Free shipping on selected offers</li>
          </ul>
        </div>

        <div className="space-y-4 border border-white/10 rounded-2xl p-6 bg-neutral-900 hover:shadow-md transition">
          <h2 className="text-lg font-semibold tracking-wide">Returns & Exchanges</h2>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Exchanges within 2 days of delivery</li>
            <li>• Items must be unused</li>
            <li>• Original packaging required</li>
            <li>• Sale items may not be eligible</li>
          </ul>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Important Notes</h2>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Double-check shipping details before placing an order</li>
          <li>• Delivery delays may occur due to courier issues</li>
          <li>• Failed deliveries may incur extra charges</li>
        </ul>
      </div>

      {/* Contact */}
      <div className="text-center space-y-5 border-t border-white/10 pt-10">
        <h2 className="text-xl font-semibold tracking-wide">Need Help?</h2>
        <p className="text-sm text-gray-400">
          Our support team is available to assist you anytime.
        </p>

        <div className="text-sm text-gray-300 space-y-2 pb-10">
          <p>Email: support@clo.com</p>
          <p>Phone: +977-98XXXXXXXX</p>
        </div>
      </div>
    </div>
  );
}