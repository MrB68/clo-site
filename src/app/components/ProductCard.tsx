import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Product } from "../contexts/ProductsContext";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // ✅ Safe price formatter
  const formatPrice = (price?: number | null) =>
    `NPR ${(price ?? 0).toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white"
    >
      <Link to={`/product/${product?.id}`}>
        <div className="relative overflow-hidden bg-white aspect-3/4">
          <img
            src={product?.image}
            alt={product?.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />

          {product?.isNew && (
            <span className="absolute top-0 left-0 bg-black text-white px-4 py-2 text-xs tracking-[0.2em] uppercase">
              New
            </span>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        </div>

        <div className="p-6 space-y-3 border-t border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-sm tracking-widest uppercase">
              {product?.name || "Unnamed Product"}
            </h3>

            {/* ✅ Fixed price */}
            <p className="text-sm tracking-wider whitespace-nowrap">
              {formatPrice(product?.price)}
            </p>
          </div>

          <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
            {product?.category || "Unknown"}
          </p>
        </div>
      </Link>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 right-4 bg-white border border-black p-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <Plus size={16} />
      </motion.button>
    </motion.div>
  );
}