export default function Contact() {
  return (
    <div className="pt-28 px-6 max-w-5xl mx-auto space-y-16 text-white bg-black min-h-screen">
      {/* Header */}
      <div className="space-y-5 text-center">
        <h1 className="text-4xl md:text-5xl tracking-[0.25em] uppercase font-semibold">
          Contact
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          We’d love to hear from you. Reach out for support, inquiries, or feedback.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            title: "Email",
            value: "support@clo.com",
            desc: "For general inquiries and support"
          },
          {
            title: "Phone",
            value: "+977-98XXXXXXXX",
            desc: "Call us during business hours"
          },
          {
            title: "WhatsApp",
            value: "+977-98XXXXXXXX",
            desc: "Chat with us instantly"
          },
          {
            title: "Instagram",
            value: "@clo",
            desc: "Follow us for updates & drops"
          }
        ].map((item, i) => (
          <div
            key={i}
            className="border border-white/10 rounded-2xl p-6 space-y-3 bg-neutral-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
          >
            <h3 className="font-semibold tracking-wide">{item.title}</h3>
            <p className="text-sm font-medium">{item.value}</p>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

      {/* Support Section */}
      <div className="text-center space-y-5">
        <h2 className="text-xl font-semibold tracking-wide">Customer Support</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Our team typically responds within a few hours. For urgent issues, please contact via phone.
        </p>
      </div>

      {/* Footer spacing */}
      <div className="pb-10" />
    </div>
  );
}