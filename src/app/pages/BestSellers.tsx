import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";

export default function BestSellers() {
  const { products } = useProducts();

  const sorted = [...products]
    .map((p: any) => {
      // Try ALL possible sales-related fields
      const salesValue =
        p.orders_count ??
        p.sales_count ??
        p.sold ??
        p.total_orders ??
        p.orderCount ??
        0;

      const sales = Number(salesValue);

      return {
        ...p,
        sales: isNaN(sales) ? 0 : sales,
      };
    })
    .sort((a: any, b: any) => b.sales - a.sales);

  // Ensure we always show top items even if sales = 0
  const finalProducts = sorted.slice(0, 24);

  console.log("Best Sellers Data:", sorted);

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
              {product.sales !== undefined && (
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