import React, { useMemo } from "react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../contexts/ProductsContext";
import { motion } from "motion/react";

export default function Sale() {
  const { products } = useProducts();

  const saleProducts = useMemo(() => {
    return products.filter((p: any) => {
      const original = p.originalPrice ?? p.original_price;
      const current = p.price;
      return original && current && original > current;
    });
  }, [products]);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.4em] text-neutral-500 dark:text-neutral-400 mb-3">
          LIMITED TIME
        </p>
        <h1 className="text-4xl md:text-5xl tracking-[0.25em] uppercase font-light">
          Sale Collection
        </h1>
        <div className="mt-6 w-16 h-[1px] bg-black mx-auto dark:bg-white" />
      </div>

      {/* Empty State */}
      {saleProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm tracking-wide">
            No items currently on sale.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
        >
          {saleProducts.map((product: any, index: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}