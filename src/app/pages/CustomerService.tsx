export default function CustomerService() {
  return (
    <div className="pt-28 px-6 max-w-6xl mx-auto space-y-16 text-black dark:text-white">
      {/* Header */}
      <div className="space-y-5 text-center">
        <h1 className="text-4xl md:text-5xl tracking-[0.25em] uppercase font-semibold">
          Customer Service
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          We're here to help you with orders, returns, sizing, and everything in between.
        </p>
      </div>

      {/* Support Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            title: "Order Support",
            desc: "Need help with your order? Contact us within 24 hours for quick assistance."
          },
          {
            title: "Returns & Exchanges",
            desc: "We offer easy exchanges within 2 days of delivery under our policy."
          },
          {
            title: "Shipping Info",
            desc: "Fast delivery across Nepal with tracking and updates available."
          },
          {
            title: "Payment Support",
            desc: "Issues with payments? We support eSewa, Khalti, and COD."
          }
        ].map((item, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-neutral-700 rounded-2xl p-6 space-y-3 bg-white dark:bg-neutral-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="font-semibold tracking-wide">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-neutral-700 to-transparent" />

      {/* Contact Section */}
      <div className="text-center space-y-5">
        <h2 className="text-xl font-semibold tracking-wide">Need Help?</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Our support team typically responds within a few hours.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <a
            href="mailto:support@clo.com"
            className="px-6 py-3 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            Email Support
          </a>

          <a
            href="https://wa.me/97798XXXXXXXX"
            target="_blank"
            className="px-6 py-3 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="pb-10" />
    </div>
  );
}