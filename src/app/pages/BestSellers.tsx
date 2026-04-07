import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";

export default function BestSellers() {
  const { products } = useProducts();

  // 🔥 Sort by real sales
  const sorted = [...products]
    .map((p: any) => {
      const salesValue =
        p.orders_count ??
        p.sales_count ??
        p.sold ??
        0;

      return {
        ...p,
        sales: isNaN(Number(salesValue)) ? 0 : Number(salesValue),
      };
    })
    .filter((p: any) => p.sales > 0) // only real best sellers
    .sort((a: any, b: any) => b.sales - a.sales)
    .slice(0, 24);

  const finalProducts = sorted.length > 0 ? sorted : products.slice(0, 24);

  return (
    <div className="pt-20">
      {/* 🔥 HERO */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl tracking-[0.2em]">
          BEST SELLERS
        </h1>
        <p className="text-gray-400 mt-3 text-sm">
          Most loved by our customers
        </p>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {finalProducts.map((product: any, index: number) => (
            <div key={product.id} className="relative group">
              

              {/* 🔥 SOLD BADGE */}
              {product.sales > 0 && (
                <span className="absolute top-12 right-3 bg-black/80 text-white text-xs px-2 py-1 z-10">
                  {product.sales} sold
                </span>
              )}

              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}