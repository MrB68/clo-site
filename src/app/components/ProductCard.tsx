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
      className="group relative border border-black/10 bg-white transition-colors duration-300 dark:border-white/10 dark:bg-neutral-950"
    >
      <Link to={`/product/${product?.id}`}>
        <div className="relative aspect-3/4 overflow-hidden bg-neutral-100 transition-colors duration-300 dark:bg-neutral-900">
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

        <div className="space-y-3 border-t border-black/10 p-6 transition-colors duration-300 dark:border-white/10">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-sm tracking-widest uppercase text-black transition-colors duration-300 dark:text-white">
              {product?.name || "Unnamed Product"}
            </h3>

            {/* ✅ Fixed price */}
            <p className="whitespace-nowrap text-sm tracking-wider text-black transition-colors duration-300 dark:text-white">
              {formatPrice(product?.price)}
            </p>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 transition-colors duration-300 dark:text-gray-400">
            {product?.category || "Unknown"}
          </p>
        </div>
      </Link>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 right-4 border border-black bg-white p-3 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:border-white dark:bg-neutral-950 dark:text-white"
      >
        <Plus size={16} />
      </motion.button>
    </motion.div>
  );
}
