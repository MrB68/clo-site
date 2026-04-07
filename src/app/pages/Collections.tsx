import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useProducts } from "../contexts/ProductsContext";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Collections() {
  const { products } = useProducts();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    (products || []).forEach((p) => {
      const key = p?.category?.toLowerCase();
      if (!key) return;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [products]);

  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data, error } = await supabase.from("collections").select("*");
      if (!error && data) {
        setCollections(data);
      }
    };

    fetchCollections();
  }, []);

  const normalize = (v?: string) =>
    (v || "").toLowerCase().replace(/\s+/g, "-");

  const bestSellerCategory = useMemo(() => {
    if (!products || products.length === 0) return null;

    const salesMap: Record<string, number> = {};

    products.forEach((p) => {
      const key = normalize(p.category);
      if (!key) return;

      // use sold if present, else count as 1
      const sold = typeof (p as any).sold === "number" ? (p as any).sold : 1;
      salesMap[key] = (salesMap[key] || 0) + sold;
    });

    const top = Object.entries(salesMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    return top || null;
  }, [products]);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl tracking-[0.2em] uppercase mb-4">
          Collections
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Discover curated styles crafted for every identity.
        </p>
      </div>

      {/* Premium Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          {
            title: "New Arrivals",
            description: "Latest drops",
            link: "/new-arrivals",
          },
          {
            title: "Best Sellers",
            description: "Most loved",
            link: bestSellerCategory
              ? `/collections/${bestSellerCategory}`
              : (collections[0]?.slug ? `/collections/${collections[0].slug}` : "/shop"),
          },
          {
            title: "On Sale",
            description: "Limited time deals",
            link: "/sale",
          },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.link}
            className="group border border-black/10 dark:border-white/10 rounded-xl p-6 flex flex-col justify-between hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
          >
            <div>
              <h3 className="text-xl font-semibold tracking-wide mb-1">
                {item.title}
              </h3>
              <p className="text-sm opacity-70">{item.description}</p>
            </div>

            <span className="mt-4 text-xs uppercase tracking-widest opacity-70 group-hover:opacity-100">
              Explore →
            </span>
          </Link>
        ))}
      </div>

      {/* Optional safety: show message if no collections */}
      {collections.length === 0 && (
        <p className="text-center text-gray-500">No collections available.</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id || index}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <Link to={`/collections/${collection.slug || collection.name?.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <img
                  src={
                    products.find(p => p.category === (collection.slug || collection.name?.toLowerCase().replace(/\s+/g, "-")))?.image ||
                    "/images/placeholder.jpg"
                  }
                  alt={collection.name || "Collection"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-5 pointer-events-none">
                {/* Top badge */}
                <div className="flex justify-end">
                  <span className="text-xs bg-white/90 text-black dark:bg-black/70 dark:text-white px-3 py-1 rounded-full font-medium tracking-wide shadow">
                    {counts[collection.slug || collection.name?.toLowerCase().replace(/\s+/g, "-")] || 0} items
                  </span>
                </div>

                {/* Bottom content */}
                <div>
                  <h2 className="text-white text-2xl md:text-3xl font-semibold tracking-wide mb-1 group-hover:translate-y-[-2px] transition">
                    {collection.name || "Collection"}
                  </h2>
                  <p className="text-white/70 text-sm mb-3">
                    Shop {collection.name || "Collection"}
                  </p>

                  <span className="inline-block text-xs uppercase tracking-widest text-white/80 border border-white/30 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-black transition">
                    Explore
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}