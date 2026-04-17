import { useParams } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CollectionDetail() {
  const { category } = useParams();
  const { products } = useProducts();

  const [collectionData, setCollectionData] = useState<any>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!category) return;

      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", category)
        .single();

      if (!error && data) {
        setCollectionData(data);
      }
    };

    fetchCollection();
  }, [category]);

  const filteredProducts = products.filter(
    (p) => p.category?.toLowerCase() === category?.toLowerCase()
  );

  const heroImage =
    collectionData?.image ||
    products.find(p => p.category === category)?.image ||
    "/placeholder.jpg";

  return (
    <div className="bg-black text-white min-h-screen">
      
      {/* HERO */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl tracking-[0.3em] uppercase">
            {collectionData?.name || category}
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <div className="pt-16 pb-20 px-4 max-w-7xl mx-auto">
        
        {/* FILTER BAR */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <span className="text-sm tracking-wide">
            {filteredProducts.length} Products
          </span>

          <select className="bg-neutral-900 border border-white/20 px-3 py-1 text-sm text-white">
            <option>Sort by</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">
              No products available in this collection yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden bg-neutral-900 transition-all duration-500 hover:shadow-2xl"
              >
                <div className="relative">
                  <div className="overflow-hidden relative">
                    {/* Primary Image */}
                    <ProductCard product={product} />

                    {/* SECOND IMAGE SWAP */}
                    {product.images && product.images[1] && (
                      <img
                        src={product.images[1]}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                      />
                    )}
                  </div>

                  {/* Premium hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}