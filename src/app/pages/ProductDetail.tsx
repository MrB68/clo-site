import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Heart, Truck, RefreshCw, Shield } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

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
  const price = product?.price ?? 0;
  const original = product?.originalPrice ?? (product as any)?.original_price ?? null;
  const hasDiscount = original && original > price;
  const discount = hasDiscount
    ? Math.round(((original - price) / original) * 100)
    : 0;
  const saveAmount = hasDiscount ? original - price : 0;
  const stock = Number(product?.stock ?? 0);
  const isOutOfStock = stock <= 0;
  // ENFORCE sizeStock on frontend (critical inventory lock)
  const sizeStock: Record<string, number> = (product as any)?.sizeStock || (product as any)?.size_stock || {};
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const productImageRef = useRef<HTMLImageElement | null>(null);
  // DERIVE selected size stock
  const selectedSizeStock = selectedSize ? Number(sizeStock[selectedSize] ?? 0) : 0;
  const isSizeOutOfStock = selectedSize ? selectedSizeStock <= 0 : false;

  const animateToCart = () => {
    const cart = document.getElementById("cart-icon");
    const img = productImageRef.current;

    if (!cart || !img) return;

    const clone = img.cloneNode(true) as HTMLElement;

    const rect = img.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    clone.style.position = "fixed";
    clone.style.top = rect.top + "px";
    clone.style.left = rect.left + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.zIndex = "9999";
    clone.style.transition = "all 0.7s cubic-bezier(0.4,0,0.2,1)";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = cartRect.top + "px";
      clone.style.left = cartRect.left + "px";
      clone.style.width = "20px";
      clone.style.height = "20px";
      clone.style.opacity = "0.3";
      clone.style.transform = "scale(0.5)";
    });

    setTimeout(() => clone.remove(), 700);
  };

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
    const fetchReviews = async () => {
      if (!product) return;

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product.id);

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
      }
    };

    fetchReviews();
  }, [product]);

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
    (review) => review.product_id === product.id && review.status === "approved"
  );
  const averageRating = approvedReviews.length
    ? approvedReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
    approvedReviews.length
    : 0;

  // Use multiple images if available, otherwise fallback to a single image
  const productImages =
    (product as any)?.images && (product as any).images.length > 0
      ? (product as any).images
      : [product.image];

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    if (isOutOfStock) {
      toast.error("This item is out of stock");
      setIsAdding(false);
      return;
    }

    // ADD TO CART VALIDATION (CRITICAL)
    if (!selectedSize) {
      toast.error("Please select a size");
      setIsAdding(false);
      return;
    }

    if (isSizeOutOfStock) {
      toast.error("Selected size is out of stock");
      setIsAdding(false);
      return;
    }

    if (quantity > selectedSizeStock) {
      toast.error(`Only ${selectedSizeStock} items available for this size`);
      setIsAdding(false);
      return;
    }

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

      animateToCart();
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Added to cart 🛒");
      setTimeout(() => setIsAdding(false), 500);
    } catch {
      toast.error("Unable to add item to cart");
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-black pt-20 text-white min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="transition-colors hover:text-white">
            Shop
          </Link>
          <span>/</span>
          <span className="capitalize text-white">{product.category}</span>
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
              className="relative aspect-3/4 overflow-hidden bg-neutral-900"
            >
              <img
                ref={productImageRef}
                src={productImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isNew && (
                <span className="absolute top-12 left-4 bg-black text-white px-3 py-1 text-xs tracking-wider">
                  NEW
                </span>
              )}

              {/* SALE badge */}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-wider">
                  SALE
                </span>
              )}

              {/* Discount % badge */}
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs tracking-wider">
                  -{discount}%
                </span>
              )}
            </motion.div>

            {/* Thumbnail Navigation */}
            <div className="grid grid-cols-3 gap-4">
              {productImages.map((img: string | undefined, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`aspect-3/4 overflow-hidden bg-neutral-900 ${activeImage === index ? "ring-2 ring-white" : ""
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
              <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">
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
                <span className="text-sm text-gray-400">
                  ({approvedReviews.length} review{approvedReviews.length === 1 ? "" : "s"})
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-semibold">
                    NPR {price.toLocaleString()}
                  </span>

                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">
                      NPR {original.toLocaleString()}
                    </span>
                  )}
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-3">
                    <span className="bg-red-600 text-white px-3 py-1 text-xs tracking-wider uppercase">
                      -{discount}%
                    </span>

                    <span className="text-sm text-green-600">
                      Save NPR {saveAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="leading-relaxed text-gray-300">
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
                    className={`px-4 py-2 border text-sm transition-colors ${selectedColor === color
                        ? "border-white bg-white text-black"
                        : "border-white/20 hover:border-white"
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
                <Link to="/size-guide" className="text-sm underline hover:no-underline">
                  Size Guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  const sStock = Number(sizeStock[size] ?? 0);
                  const disabled = sStock <= 0;

                  return (
                    <button
                      key={size}
                      disabled={disabled}
                      onClick={() => !disabled && setSelectedSize(size)}
                      className={`px-4 py-2 border text-sm transition-colors ${
                        disabled
                          ? "border-gray-700 text-gray-500 cursor-not-allowed"
                          : selectedSize === size
                          ? "border-white bg-white text-black"
                          : "border-white/20 hover:border-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm mb-3">Quantity</label>
              <div className="flex w-32 items-center border border-white/20">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 transition-colors hover:bg-neutral-900"
                >
                  -
                </button>
                <span className="flex-1 text-center">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(selectedSizeStock || 1, quantity + 1)
                    )
                  }
                  className="px-4 py-2 transition-colors hover:bg-neutral-900"
                >
                  +
                </button>
              </div>
              {/* STOCK INFO */}
              {selectedSize && !isSizeOutOfStock && selectedSizeStock <= 5 && (
                <p className="text-sm text-orange-500 mt-2">
                  Only {selectedSizeStock} left in size {selectedSize}
                </p>
              )}

              {selectedSize && isSizeOutOfStock && (
                <p className="text-sm text-red-500 mt-2">
                  Size {selectedSize} is out of stock
                </p>
              )}

              {!selectedSize && !isOutOfStock && stock <= 5 && (
                <p className="text-sm text-orange-500 mt-2">
                  Only {stock} left in stock
                </p>
              )}
              {!selectedSize && isOutOfStock && (
                <p className="text-sm text-red-500 mt-2">
                  Out of stock
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <motion.button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isSizeOutOfStock}
                className={`flex flex-1 items-center justify-center gap-2 py-4 transition-colors ${
                  isOutOfStock || isSizeOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-neutral-200"
                }`}
                whileTap={{ scale: 0.92 }}
                animate={isAdding ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ShoppingBag size={20} />
                {isOutOfStock || isSizeOutOfStock ? "Out of Stock" : "Add to Cart"}
              </motion.button>
              <button className="border border-white/20 p-4 transition-colors hover:border-white">
                <Heart size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-start gap-3">
                <Truck size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-400">
                    On orders over NPR 3000 (Nationwide)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Easy Exchange</p>
                  <p className="text-xs text-gray-400">
                    Exchange available within 2 days of delivery
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Secure Payments</p>
                  <p className="text-xs text-gray-400">
                    eSewa / Khalti / COD supported
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-medium uppercase tracking-wider text-white">
                      {((review.name || "User").toString().split(" "))
                        .map((part: string) => part[0] || "")
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < (review.rating ?? 0) ? "fill-black" : "fill-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.name || "Anonymous"}</span>
                    <span className="text-sm text-gray-500">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "Recently"}
                    </span>
                  </div>
                  <p className="mb-2 font-medium">{review.title || "Review"}</p>
                  <p className="text-gray-300">{review.comment || ""}</p>
                  {review.adminReply && (
                    <div className="mt-4 rounded-lg border border-white/10 bg-neutral-900 p-4">
                      <p className="text-sm font-medium">Reply from {review.adminReplyBy || "Admin"}</p>
                      <p className="mt-2 text-sm text-gray-300">
                        {review.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
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
