import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm tracking-wider uppercase">Back to Shop</span>
          </Link>
          <h1 className="text-2xl tracking-widest uppercase">Privacy Policy</h1>
          <div></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-8"
        >
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold mb-6 tracking-widest uppercase">Privacy Policy</h2>

            <p className="text-gray-600 mb-6 tracking-wider">
              Last updated: January 2024
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">1. Information We Collect</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">2. How We Use Your Information</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">3. Information Sharing</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">4. Data Security</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">5. Cookies</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">6. Your Rights</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              You have the right to access, update, or delete your personal information. You may also opt out of certain data processing activities.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">7. Contact Us</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              If you have any questions about this Privacy Policy, please contact us at privacy@clo.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}