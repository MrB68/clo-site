import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export default function BestSellers() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .gt("orders_count", 0)
        .order("orders_count", { ascending: false })
        .limit(24);

      if (error) {
        console.error("Error fetching best sellers:", error);
      } else {
        setProducts(data || []);
      }
    };

    fetchBestSellers();

    // 🔥 Realtime subscription
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        () => {
          fetchBestSellers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayProducts = products;

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-3xl md:text-5xl tracking-[0.2em] uppercase">
          Best Sellers
        </h1>
        <p className="text-gray-400 mt-3 text-sm">
          Most loved by our customers
        </p>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product: any) => (
            <div key={product.id} className="relative">
              
              {/* Sold badge */}
              {(product.orders_count ?? 0) > 0 && (
                <span className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 z-10">
                  {product.orders_count} sold
                </span>
              )}

              <Link to={`/product/${product.slug || product.id}`} className="block group">
                <div className="aspect-[3/4] bg-neutral-900 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="mt-2">
                  <h2 className="text-sm text-white">
                    {product.name}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Rs. {product.price}
                  </p>
                </div>
              </Link>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}