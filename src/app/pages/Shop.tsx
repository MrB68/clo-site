import { useState } from "react";
import { motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { StyleToggle } from "../components/StyleToggle";

export function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<"minimal" | "extravagant">("minimal");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { products } = useProducts();

  // Filter products
  let filteredProducts = [...products];

  // Filter by style
  filteredProducts = filteredProducts.filter((p) => p.style === selectedStyle);

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === selectedCategory
    );
  }

  if (selectedSize !== "all") {
    filteredProducts = filteredProducts.filter((p) =>
      p.sizes.includes(selectedSize)
    );
  }

  if (priceRange !== "all") {
    if (priceRange === "under-100") {
      filteredProducts = filteredProducts.filter((p) => p.price < 13300);
    } else if (priceRange === "100-200") {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= 13300 && p.price <= 26600
      );
    } else if (priceRange === "200-300") {
      filteredProducts = filteredProducts.filter(
        (p) => p.price > 26600 && p.price <= 39900
      );
    } else if (priceRange === "over-300") {
      filteredProducts = filteredProducts.filter((p) => p.price > 39900);
    }
  }

  // Sort products
  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSize("all");
    setPriceRange("all");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedSize !== "all" ||
    priceRange !== "all";

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <h1 className="text-4xl md:text-5xl tracking-[0.2em] uppercase">Shop</h1>
            <div className="flex justify-center">
              <StyleToggle
                activeStyle={selectedStyle}
                onStyleChange={setSelectedStyle}
              />
            </div>
            <p className="text-gray-400 tracking-wider text-sm">
              {filteredProducts.length} products available
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium tracking-widest uppercase text-sm">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-black tracking-wider uppercase"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                    Category
                  </h4>
                  {["all", "men", "women", "accessories"].map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize tracking-wider">{category}</span>
                    </label>
                  ))}
                </div>

                {/* Size Filter */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                    Size
                  </h4>
                  {["all", "XS", "S", "M", "L", "XL"].map((size) => (
                    <label
                      key={size}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="size"
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize(size)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm tracking-wider">{size}</span>
                    </label>
                  ))}
                </div>

                {/* Price Filter */}
                <div className="space-y-3">
                  <h4 className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                    Price
                  </h4>
                  {[
                    { value: "all", label: "All Prices" },
                    { value: "under-100", label: "Under NPR 13,300" },
                    { value: "100-200", label: "NPR 13,300 - NPR 26,600" },
                    { value: "200-300", label: "NPR 26,600 - NPR 39,900" },
                    { value: "over-300", label: "Over NPR 39,900" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === option.value}
                        onChange={() => setPriceRange(option.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm tracking-wider">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Mobile Filter */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm tracking-wider uppercase"
              >
                <SlidersHorizontal size={18} />
                Filters
                {hasActiveFilters && (
                  <span className="bg-black text-white px-2 py-0.5 text-xs">
                    Active
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 tracking-[0.2em] uppercase">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-2 border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-black tracking-wider uppercase bg-white"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-gray-500 tracking-wider">
                  No products found matching your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm tracking-[0.2em] uppercase underline hover:no-underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setFiltersOpen(false)}>
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white h-full w-72 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium tracking-widest uppercase">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Style Toggle in Mobile */}
            <div className="mb-8">
              <h4 className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3">
                Style
              </h4>
              <StyleToggle
                activeStyle={selectedStyle}
                onStyleChange={setSelectedStyle}
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  clearFilters();
                  setFiltersOpen(false);
                }}
                className="text-xs text-gray-500 hover:text-black mb-6 tracking-wider uppercase"
              >
                Clear all filters
              </button>
            )}

            {/* Category Filter */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                Category
              </h4>
              {["all", "men", "women", "accessories"].map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category-mobile"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm capitalize tracking-wider">{category}</span>
                </label>
              ))}
            </div>

            {/* Size Filter */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                Size
              </h4>
              {["all", "XS", "S", "M", "L", "XL"].map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="size-mobile"
                    checked={selectedSize === size}
                    onChange={() => setSelectedSize(size)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm tracking-wider">{size}</span>
                </label>
              ))}
            </div>

            {/* Price Filter */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                Price
              </h4>
              {[
                { value: "all", label: "All Prices" },
                { value: "under-100", label: "Under $100" },
                { value: "100-200", label: "$100 - $200" },
                { value: "200-300", label: "$200 - $300" },
                { value: "over-300", label: "Over $300" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="price-mobile"
                    checked={priceRange === option.value}
                    onChange={() => setPriceRange(option.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm tracking-wider">{option.label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors tracking-[0.2em] uppercase text-sm"
            >
              Apply Filters
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}