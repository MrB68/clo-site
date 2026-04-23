import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../contexts/WishlistContext";

type ProductCardProps = {
  product: any;
  hideBadge?: boolean;
  imageOnly?: boolean;
};

export function ProductCard({ product, hideBadge, imageOnly = false }: ProductCardProps) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = wishlist?.some((item: any) => item.product_id === product.id);

  const isFeatured = product?.featured;
  const price = product.price ?? 0;
  const original =
    product.originalPrice ?? product.original_price ?? null;

  const hasDiscount = original !== null && Number(original) > Number(price);

  const discount = hasDiscount
    ? Math.round(((Number(original) - Number(price)) / Number(original)) * 100)
    : 0;

  const saveAmount = hasDiscount ? original - price : 0;
  const stock = Number(product?.stock ?? 0);
  const isOutOfStock = stock <= 0;

  // 🔥 track previous stock for animation
  const [prevStock, setPrevStock] = useState(stock);

  useEffect(() => {
    if (stock !== prevStock) {
      setPrevStock(stock);
    }
  }, [stock]);

  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    setIsAdding(true);

    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

    cartItems.push({
      productId: product.id,
      quantity: 1,
      selectedSize: product.sizes?.[0] || "Default",
      selectedColor: product.colors?.[0] || "Default",
    });

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));

    setTimeout(() => setIsAdding(false), 400);
  };

  return (
    <Link
      to={isOutOfStock ? "#" : `/product/${product.id}`}
      onClick={(e) => {
        if (isOutOfStock) e.preventDefault();
      }}
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl w-full ${
          isFeatured ? "md:col-span-2 lg:col-span-2" : ""
        }`}>
        {/* IMAGE */}
        <div className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          {/* First Image */}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full object-cover transition-all duration-700 ease-out ${
              isFeatured ? "h-[520px]" : "h-[420px]"
            } group-hover:opacity-0 group-hover:scale-115`}
          />

          {/* Second Image (hover preview) */}
          {product.images && product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} hover`}
              className={`absolute inset-0 w-full object-cover opacity-0 transition-all duration-700 ease-out pointer-events-none ${
                isFeatured ? "h-[520px]" : "h-[420px]"
              } group-hover:opacity-100 group-hover:scale-115`}
            />
          )}

          {/* WISHLIST BUTTON */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isWishlisted) {
                removeFromWishlist(product.id);
              } else {
                addToWishlist(product.id);
              }
            }}
            className="absolute top-3 right-3 z-30 p-2 backdrop-blur-md bg-black/40 rounded-full hover:bg-black/60 transition"
          >
            <Heart
              size={16}
              className={`transition ${
                isWishlisted
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-white"
              }`}
            />
          </button>

          {/* SALE BADGE */}
          {!hideBadge && hasDiscount && !isOutOfStock && (
            <span className="absolute top-3 left-3 z-20 bg-black text-white px-3 py-1 text-[10px] tracking-[0.2em] uppercase shadow-md">
              Sale
            </span>
          )}

          {/* OUT OF STOCK BADGE */}
          {isOutOfStock && (
            <span className="absolute top-3 left-3 z-30 bg-red-700 text-white px-3 py-1 text-[10px] tracking-[0.2em] uppercase shadow-lg">
              Out of Stock
            </span>
          )}

          {/* % BADGE */}
          {hasDiscount && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute top-12 right-3 z-20 bg-red-600 text-white px-3 py-1 text-[10px] tracking-[0.2em] uppercase shadow-md"
            >
              -{discount}%
            </motion.span>
          )}

          {/* QUICK VIEW BUTTON */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <button
              disabled={isOutOfStock}
              className={`px-4 py-2 text-xs tracking-wide border ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                  : "bg-white dark:bg-[#111111] text-black dark:text-white border-black dark:border-white"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "View"}
            </button>

            {!isOutOfStock && (
              <motion.button
                onClick={handleQuickAdd}
                whileTap={{ scale: 0.9 }}
                animate={isAdding ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-2 text-xs tracking-wide bg-black text-white border border-white"
              >
                Add
              </motion.button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {!imageOnly && (
        <div className={`mt-6 space-y-3 px-2 ${isFeatured ? "md:px-4" : ""}`}>
          {/* PRODUCT NAME */}
          <h3 className="text-[16px] font-medium tracking-wide line-clamp-2 min-h-[52px] break-words leading-snug">
            {product.name}
          </h3>

          {/* STOCK INFO */}
          {!isOutOfStock && stock <= 5 && (
            <motion.p
              key={stock}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-orange-500"
            >
              Only {stock} left
            </motion.p>
          )}

          {isOutOfStock && (
            <motion.p
              key="out-of-stock"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-red-500"
            >
              Currently unavailable
            </motion.p>
          )}

          {/* PRICE SECTION */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-lg font-medium">
              NPR {price.toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                NPR {original.toLocaleString()}
              </span>
            )}
          </div>

          {/* SAVE TEXT */}
          {hasDiscount && (
            <p className="text-xs text-green-600 tracking-wide">
              Save NPR {saveAmount.toLocaleString()}
            </p>
          )}
        </div>
        )}
      </motion.div>
    </Link>
  );
}