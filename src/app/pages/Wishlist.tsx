import { useWishlist } from "../contexts/WishlistContext";
import { useProducts } from "../contexts/ProductsContext";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { products } = useProducts();

  const wishlistProducts = products.filter((p: any) =>
    wishlist.some((item: any) => item.product_id === p.id)
  );

  return (
    <div className="min-h-screen px-4 py-12 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl tracking-wide mb-8">
        Your Wishlist
      </h1>

      {wishlistProducts.length === 0 ? (
        <p className="text-gray-400">No items in wishlist</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistProducts.map((product: any) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  className="w-full h-[300px] object-cover"
                />
              </Link>

              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs"
              >
                Remove
              </button>

              <p className="mt-2 text-sm">{product.name}</p>
              <p className="text-sm font-medium">
                NPR {product.price.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}