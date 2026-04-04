import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, ShoppingBag, Heart, Truck, RefreshCw, Shield } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { toast } from "sonner";
import { getStoredReviews, type StoredReview } from "../utils/reviews";
import { getCustomerProfileByEmail } from "../utils/customerProfile";

interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState<StoredReview[]>(() => getStoredReviews());

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedSize(product.sizes[0] ?? "");
    setSelectedColor(product.colors[0] ?? "");
    setQuantity(1);
    setActiveImage(0);
  }, [product]);

  useEffect(() => {
    const syncReviews = () => {
      setReviews(getStoredReviews());
    };

    syncReviews();
    window.addEventListener("reviewsUpdated", syncReviews);
    window.addEventListener("storage", syncReviews);

    return () => {
      window.removeEventListener("reviewsUpdated", syncReviews);
      window.removeEventListener("storage", syncReviews);
    };
  }, []);

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Link to="/shop" className="underline hover:no-underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const approvedReviews = reviews.filter(
    (review) => review.productId === product.id && review.status === "approved"
  );
  const averageRating = approvedReviews.length
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) /
      approvedReviews.length
    : 0;

  // Mock additional images (in real app, each product would have multiple images)
  const productImages = [product.image, product.image, product.image];

  const handleAddToCart = () => {
    const nextItem: CartItem = {
      productId: product.id,
      quantity,
      selectedSize: selectedSize || product.sizes[0] || "One Size",
      selectedColor: selectedColor || product.colors[0] || "Default",
    };

    try {
      const existingCart = localStorage.getItem("cartItems");
      const parsedCart = existingCart ? JSON.parse(existingCart) : [];
      const cartItems = Array.isArray(parsedCart) ? parsedCart : [];

      const existingIndex = cartItems.findIndex(
        (item) =>
          item?.productId === nextItem.productId &&
          item?.selectedSize === nextItem.selectedSize &&
          item?.selectedColor === nextItem.selectedColor
      );

      if (existingIndex >= 0) {
        cartItems[existingIndex] = {
          ...cartItems[existingIndex],
          quantity:
            (typeof cartItems[existingIndex].quantity === "number"
              ? cartItems[existingIndex].quantity
              : 0) + nextItem.quantity,
        };
      } else {
        cartItems.push(nextItem);
      }

      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Added to cart");
    } catch {
      toast.error("Unable to add item to cart");
    }
  };

  return (
    <div className="bg-white pt-20 text-black transition-colors duration-300 dark:bg-black dark:text-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link to="/" className="transition-colors hover:text-black dark:hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="transition-colors hover:text-black dark:hover:text-white">
            Shop
          </Link>
          <span>/</span>
          <span className="capitalize text-black dark:text-white">{product.category}</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-3/4 overflow-hidden bg-gray-100 transition-colors duration-300 dark:bg-neutral-900"
            >
              <img
                src={productImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-wider">
                  NEW
                </span>
              )}
            </motion.div>

            {/* Thumbnail Navigation */}
            <div className="grid grid-cols-3 gap-4">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`aspect-3/4 overflow-hidden bg-gray-100 transition-colors duration-300 dark:bg-neutral-900 ${
                    activeImage === index ? "ring-2 ring-black dark:ring-white" : ""
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl tracking-wide mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(averageRating)
                          ? "fill-black"
                          : "fill-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({approvedReviews.length} review{approvedReviews.length === 1 ? "" : "s"})
                </span>
              </div>
              <p className="text-3xl">NPR {product.price.toLocaleString()}</p>
            </div>

            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              {product.description}
            </p>

            {/* Color Selection */}
            <div>
              <label className="block text-sm mb-3">
                Color: <span className="font-medium">{selectedColor}</span>
              </label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      selectedColor === color
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-black dark:border-white/20 dark:hover:border-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm">
                  Size: <span className="font-medium">{selectedSize}</span>
                </label>
                <button className="text-sm underline hover:no-underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-black dark:border-white/20 dark:hover:border-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm mb-3">Quantity</label>
              <div className="flex w-32 items-center border border-gray-300 dark:border-white/20">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-900"
                >
                  -
                </button>
                <span className="flex-1 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-900"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 bg-black py-4 text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <ShoppingBag size={20} />
                Add to Cart
              </button>
              <button className="border border-gray-300 p-4 transition-colors hover:border-black dark:border-white/20 dark:hover:border-white">
                <Heart size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="space-y-4 border-t border-black/10 pt-6 dark:border-white/10">
              <div className="flex items-start gap-3">
                <Truck size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    On orders over $100
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Free Returns</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    30-day return policy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Secure Checkout</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    SSL encrypted payment
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 border-t pt-24">
          <h2 className="text-2xl tracking-wide mb-8">Customer Reviews</h2>
          {approvedReviews.length > 0 ? (
            <div className="space-y-6">
              {approvedReviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center gap-4 mb-3">
                    {getCustomerProfileByEmail(review.customerEmail)?.profileImage ? (
                      <img
                        src={getCustomerProfileByEmail(review.customerEmail)?.profileImage}
                        alt={review.customerName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-medium uppercase tracking-wider text-white dark:bg-white dark:text-black">
                        {review.customerName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating ? "fill-black" : "fill-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.customerName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mb-2 font-medium">{review.title}</p>
                  <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  {review.adminReply && (
                    <div className="mt-4 rounded-lg border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-neutral-900">
                      <p className="text-sm font-medium">Reply from {review.adminReplyBy || "Admin"}</p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {review.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No approved reviews yet for this product.
            </p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t pt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl tracking-wide">You May Also Like</h2>
              <Link
                to="/shop"
                className="text-sm underline hover:no-underline"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
