import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function NotFound() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="text-6xl md:text-8xl tracking-wider">404</h1>
        <h2 className="text-2xl md:text-3xl tracking-wide">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors"
        >
          Back to Home
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    </div>
  );
}
