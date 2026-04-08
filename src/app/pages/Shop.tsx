import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { StyleToggle } from "../components/StyleToggle";
import { supabase } from "@/lib/supabase";

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStyle, setSelectedStyle] = useState<"minimal" | "extravagant">("minimal");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { products } = useProducts();
 const [categories, setCategories] = useState<string[]>([]);

useEffect(() => {
  const fetchCollections = async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("slug");

    if (!error && data) {
      setCategories(data.map((c: any) => c.slug));
    }
  };

  fetchCollections();
}, []);
  const prices = products.map((p) => Number(p.price) || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 100;

  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products]);
  const searchQuery = searchParams.get("search")?.trim().toLowerCase() ?? "";

  // Filter products
  let filteredProducts = [...products];
  // Always sort by admin-defined display_order first
  filteredProducts.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // --- Dynamic filter from URL ---
  const urlFilter = searchParams.get("filter");

  // Normalize originalPrice FIRST
  filteredProducts = filteredProducts.map((p: any) => ({
    ...p,
    originalPrice: p.originalPrice ?? p.original_price ?? null,
  }));

  // Apply URL-based filters (premium sections)
  if (urlFilter === "sale") {
    filteredProducts = filteredProducts.filter(
      (p: any) => p.originalPrice && p.originalPrice > p.price
    );
  }

  if (urlFilter === "new") {
    filteredProducts = [...filteredProducts].sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  if (urlFilter === "popular") {
    filteredProducts = [...filteredProducts].sort((a: any, b: any) => {
      const scoreA = a.orders_count || 0;
      const scoreB = b.orders_count || 0;
      return scoreB - scoreA;
    });
  }

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

  if (selectedCategory !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === selectedCategory
    );
  }

  if (selectedSize !== "All") {
    filteredProducts = filteredProducts.filter((p) =>
      Array.isArray(p.sizes) && p.sizes.includes(selectedSize)
    );
  }

  // Slider price filter
  if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
  }
// Featured filter (real behavior)
if (sortBy === "featured") {
  filteredProducts = filteredProducts.filter((p: any) => p.featured === true);
}
  // Sort products
  if (sortBy === "price-low") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedSize("All");
    setPriceRange([minPrice, maxPrice]);
  };

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedCategory !== "All" ||
    selectedSize !== "All" ||
    !(priceRange[0] === minPrice && priceRange[1] === maxPrice);

  const searchLabel = useMemo(() => {
    if (!searchQuery) {
      return null;
    }

    return searchParams.get("search")?.trim() ?? "";
  }, [searchParams, searchQuery]);

  return (
    <div className="bg-black pt-20 text-white">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <h1 className="text-5xl md:text-6xl tracking-[0.35em] font-light uppercase">Shop</h1>
            <div className="flex justify-center">
              <StyleToggle
                activeStyle={selectedStyle}
                onStyleChange={setSelectedStyle}
              />
            </div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500">
              {filteredProducts.length} products {urlFilter ? `in ${urlFilter.replace("-", " ")}` : "available"}
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
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-10 border border-black/10 p-6 bg-neutral-950/70 backdrop-blur-xl shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-light tracking-[0.35em] uppercase text-xs">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] tracking-[0.3em] uppercase text-gray-400 hover:text-black transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-[10px] uppercase tracking-[0.35em] text-gray-400">
                    Category
                  </h4>
                  {["All", ...categories].map((category) => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 accent-black"
                      />
                      <span className="text-sm capitalize tracking-wide group-hover:opacity-100 opacity-80 transition">{category}</span>
                    </label>
                  ))}
                </div>

                {/* Size */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-[10px] uppercase tracking-[0.35em] text-gray-400">
                    Size
                  </h4>
                  {["All", "XS", "S", "M", "L", "XL"].map((size) => (
                    <label key={size} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize(size)}
                        className="w-4 h-4 accent-black"
                      />
                      <span className="text-sm tracking-wide group-hover:opacity-100 opacity-80 transition">{size}</span>
                    </label>
                  ))}
                </div>

                {/* Price */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.35em] text-gray-400">
                    Price
                  </h4>

                  <div className="px-1 pt-2">
                    <div className="flex justify-between text-[10px] tracking-[0.2em] text-gray-400 mb-3">
                      <span>NPR {priceRange[0]}</span>
                      <span>NPR {priceRange[1]}</span>
                    </div>

                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          Math.min(Number(e.target.value), priceRange[1] - 1),
                          priceRange[1],
                        ])
                      }
                      className="w-full"
                    />

                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          Math.max(Number(e.target.value), priceRange[0] + 1),
                        ])
                      }
                      className="w-full mt-2"
                    />
                  </div>
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
                <label className="text-xs tracking-[0.2em] uppercase text-gray-400">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border border-white px-5 py-2 text-[10px] tracking-[0.3em] uppercase text-white transition-all focus:border-white focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-neutral-950 p-5 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-white/10"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="tracking-wider text-gray-400">
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
            className="h-full w-72 overflow-y-auto bg-neutral-950 p-6 text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium tracking-widest uppercase">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Style Toggle in Mobile */}
            <div className="mb-8">
              <h4 className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-400">
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
                className="mb-6 text-xs tracking-wider uppercase text-gray-400 transition-colors hover:text-black"
              >
                Clear all filters
              </button>
            )}

            {/* Category Filter */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Category
              </h4>
              {["All", ...categories].map((category) => (
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
              <h4 className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Size
              </h4>
              {["All", "XS", "S", "M", "L", "XL"].map((size) => (
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
            <div className="space-y-4 mb-6">
              <h4 className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Price
              </h4>

              <div className="px-1">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>NPR {(Math.round(priceRange[0] / 1000) * 1000).toLocaleString()}</span>
                  <span>NPR {(Math.round(priceRange[1] / 1000) * 1000).toLocaleString()}</span>
                </div>

                <div className="relative h-1 bg-gray-200 rounded mb-4 hover:bg-gray-300 transition-colors duration-200">
                  <div
                    className="absolute h-1 bg-black rounded transition-all duration-300 ease-out"
                    style={{
                      left: `${maxPrice > minPrice ? ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100 : 0}%`,
                      width: `${maxPrice > minPrice ? ((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100 : 0}%`,
                    }}
                  />
                </div>

                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([
                      Math.min(Number(e.target.value), priceRange[1] - 1),
                      priceRange[1],
                    ])
                  }
                  className="w-full appearance-none bg-transparent cursor-pointer relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-125"
                />

                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([
                      priceRange[0],
                      Math.max(Number(e.target.value), priceRange[0] + 1),
                    ])
                  }
                  className="w-full appearance-none bg-transparent -mt-2 cursor-pointer relative z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-125"
                />
              </div>
            </div>

            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-black py-3 text-sm tracking-[0.2em] uppercase text-white transition-colors hover:bg-gray-800"
            >
              Apply Filters
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
