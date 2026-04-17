import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export function Terms() {
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
          <h1 className="text-2xl tracking-widest uppercase">Terms of Service</h1>
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
            <h2 className="text-2xl font-bold mb-6 tracking-widest uppercase">Terms of Service</h2>

            <p className="text-gray-600 mb-6 tracking-wider">
              Last updated: January 2024
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">1. Acceptance of Terms</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              By accessing and using CLO's website and services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">2. Use License</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              Permission is granted to temporarily access the materials on CLO's website for personal, non-commercial transitory viewing only.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">3. User Accounts</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">4. Prohibited Uses</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">5. Products and Pricing</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              All prices are subject to change without notice. We reserve the right to modify or discontinue products without notice.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">6. Returns and Exchanges</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              Items may be returned within 30 days of purchase. Items must be in original condition and packaging.
            </p>

            <h3 className="text-xl font-semibold mb-4 tracking-widest uppercase">7. Contact Information</h3>
            <p className="text-gray-700 mb-6 tracking-wider">
              If you have any questions about these Terms of Service, please contact us at contact@clo.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}