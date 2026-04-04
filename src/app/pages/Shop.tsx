import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { StyleToggle } from "../components/StyleToggle";

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<"minimal" | "extravagant">("minimal");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { products } = useProducts();
  const searchQuery = searchParams.get("search")?.trim().toLowerCase() ?? "";

  // Filter products
  let filteredProducts = [...products];

  // Filter by style
  filteredProducts = filteredProducts.filter((p) => p.style === selectedStyle);

  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      [product.name, product.description, product.category]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery)
    );
  }

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
    searchQuery.length > 0 ||
    selectedCategory !== "all" ||
    selectedSize !== "all" ||
    priceRange !== "all";

  const searchLabel = useMemo(() => {
    if (!searchQuery) {
      return null;
    }

    return searchParams.get("search")?.trim() ?? "";
  }, [searchParams, searchQuery]);

  return (
    <div className="bg-white pt-20 text-black transition-colors duration-300 dark:bg-black dark:text-white">
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
            <p className="text-sm tracking-wider text-gray-400 dark:text-gray-500">
              {filteredProducts.length} products available
            </p>
            {searchLabel ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-black"
                >
                  Search: {searchLabel} · Clear
                </button>
              </div>
            ) : null}
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
                      className="text-xs tracking-wider uppercase text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
                  <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
                  <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
                  <span className="bg-black px-2 py-0.5 text-xs text-white dark:bg-white dark:text-black">
                    Active
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <label className="text-xs tracking-[0.2em] uppercase text-gray-600 dark:text-gray-400">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border-2 border-gray-300 px-4 py-2 text-sm tracking-wider uppercase transition-colors focus:border-black focus:outline-none dark:border-white/20 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
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
              <div className="grid grid-cols-1 gap-px bg-gray-200 transition-colors duration-300 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="tracking-wider text-gray-500 dark:text-gray-400">
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
            className="h-full w-72 overflow-y-auto bg-white p-6 text-black transition-colors duration-300 dark:bg-neutral-950 dark:text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium tracking-widest uppercase">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Style Toggle in Mobile */}
            <div className="mb-8">
              <h4 className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
                className="mb-6 text-xs tracking-wider uppercase text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
              >
                Clear all filters
              </button>
            )}

            {/* Category Filter */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
              <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
              <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
              className="w-full bg-black py-3 text-sm tracking-[0.2em] uppercase text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Apply Filters
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
