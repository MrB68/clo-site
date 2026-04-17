import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { motion } from "motion/react";

export default function NewArrivals() {
  const { products } = useProducts();

  // 🔥 Sort by newest
  const sorted = [...products]
    .sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 24); // limit for premium feel

  const heroProduct = sorted.find((p: any) => p.featured === true) || sorted[0];
  const remaining = sorted.filter((p: any) => p.id !== heroProduct?.id);
  const leftProduct = remaining[0];
  const rightProduct = remaining[1];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="bg-black text-white pt-24 md:pt-32 pb-16 md:pb-24 text-center space-y-4 md:space-y-6 relative overflow-hidden">
        <p className="text-[10px] tracking-[0.35em] uppercase text-gray-500">
          Exclusive Drop
        </p>

        <h1 className="text-3xl sm:text-5xl md:text-7xl tracking-[0.3em] md:tracking-[0.5em] font-extralight">
          NEW ARRIVALS
        </h1>
        <p className="text-xs text-gray-400 tracking-wider mt-2">
          Discover the latest pieces curated for you
        </p>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/40 pointer-events-none" />
      </div>

      {/* HERO + SIDE PRODUCTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 pb-12 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* LEFT */}
          {leftProduct && (
            <ProductCard product={{ ...leftProduct, featured: false }} />
          )}

          {/* HERO */}
          {heroProduct && (
            <div className="md:scale-110 z-10 transition-transform duration-500">
              <ProductCard product={{ ...heroProduct, featured: true }} />
            </div>
          )}

          {/* RIGHT */}
          {rightProduct && (
            <ProductCard product={{ ...rightProduct, featured: false }} />
          )}

        </div>
      </motion.div>

      {/* CASCADING PRODUCTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 pb-20 space-y-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {remaining.slice(2).map((product: any, index: number) => {
            const isNew =
              new Date(product.created_at || product.createdAt || 0).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000;

            const position = index % 3;

            return (
              <div key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.04, duration: 0.6, ease: "easeOut" }}
                  className="relative group transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]"
                >
                  {isNew && (
                    <span className="absolute top-3 left-3 bg-white text-black text-[10px] px-2 py-1 z-10 tracking-[0.2em]">
                      NEW
                    </span>
                  )}

                  <div
                    className={`
                      ${position === 1 ? "md:scale-110 scale-100 z-10" : "scale-100"}
                      md:${position === 0 ? "mt-4" : ""}
                      md:${position === 1 ? "mt-0" : ""}
                      md:${position === 2 ? "mt-2" : ""}
                      transition-all duration-500 ease-out group-hover:scale-[1.03]
                    `}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        featured: false,
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}