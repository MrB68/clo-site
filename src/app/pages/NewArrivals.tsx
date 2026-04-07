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
    <div className="min-h-screen">
      <div className="bg-black text-white pt-32 pb-24 text-center space-y-6 relative overflow-hidden">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400">
          Exclusive Drop
        </p>

        <h1 className="text-6xl md:text-7xl tracking-[0.5em] font-extralight">
          NEW ARRIVALS
        </h1>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/40 pointer-events-none" />
      </div>

      {/* HERO + SIDE PRODUCTS */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 pb-12"
      >
        <div className="grid grid-cols-3 gap-8 items-start">
          
          {/* LEFT */}
          {leftProduct && (
            <ProductCard product={{ ...leftProduct, featured: false }} />
          )}

          {/* HERO */}
          {heroProduct && (
            <div className="scale-110 z-10 transition-transform duration-500">
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
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 pb-16"
      >
        <div className="grid grid-cols-3 gap-8">
          {remaining.slice(2).map((product: any, index: number) => {
            const isNew =
              new Date(product.created_at || product.createdAt || 0).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000;

            const position = index % 3;

            return (
              <div key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.04, duration: 0.6, ease: "easeOut" }}
                  className="relative group transition-all duration-500 hover:-translate-y-1"
                >
                  {isNew && (
                    <span className="absolute top-4 left-4 bg-white text-black text-[10px] px-3 py-1 z-10 tracking-[0.2em]">
                      NEW
                    </span>
                  )}

                  <div
                    className={`
                      ${position === 1 ? "scale-110 z-10" : "scale-100"}
                      ${position === 0 ? "mt-4" : ""}
                      ${position === 1 ? "mt-0" : ""}
                      ${position === 2 ? "mt-2" : ""}
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