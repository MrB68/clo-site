import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, ShoppingBag, Heart, Truck, RefreshCw, Shield } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";

export function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

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

  // Mock additional images (in real app, each product would have multiple images)
  const productImages = [product.image, product.image, product.image];

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black">
            Shop
          </Link>
          <span>/</span>
          <span className="text-black capitalize">{product.category}</span>
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
              className="relative aspect-3/4 bg-gray-100 overflow-hidden"
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
                  className={`aspect-3/4 bg-gray-100 overflow-hidden ${
                    activeImage === index ? "ring-2 ring-black" : ""
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
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
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
                      className={i < 4 ? "fill-black" : "fill-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(24 reviews)</span>
              </div>
              <p className="text-3xl">NPR {product.price.toLocaleString()}</p>
            </div>

            <p className="text-gray-600 leading-relaxed">
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
                        : "border-gray-300 hover:border-black"
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
                        : "border-gray-300 hover:border-black"
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
              <div className="flex items-center border border-gray-300 w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="flex-1 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <button className="flex-1 bg-black text-white py-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <ShoppingBag size={20} />
                Add to Cart
              </button>
              <button className="p-4 border border-gray-300 hover:border-black transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">
                    On orders over $100
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Free Returns</p>
                  <p className="text-xs text-gray-600">
                    30-day return policy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Secure Checkout</p>
                  <p className="text-xs text-gray-600">
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
          <div className="space-y-6">
            {[
              {
                name: "Sarah M.",
                rating: 5,
                date: "March 15, 2026",
                comment:
                  "Absolutely love this piece! The quality is exceptional and fits perfectly. Worth every penny.",
              },
              {
                name: "James L.",
                rating: 4,
                date: "March 10, 2026",
                comment:
                  "Great product, fast shipping. The material feels premium and the design is timeless.",
              },
              {
                name: "Emma K.",
                rating: 5,
                date: "March 5, 2026",
                comment:
                  "Best purchase I've made this year. The attention to detail is incredible!",
              },
            ].map((review, index) => (
              <div key={index} className="border-b pb-6">
                <div className="flex items-center gap-4 mb-3">
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
                  <span className="font-medium">{review.name}</span>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
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
