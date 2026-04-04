import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Minus } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { StyleSwitch } from "../components/StyleToggle";
import { getCustomerProfileByEmail } from "../utils/customerProfile";
import { supabase } from "../../lib/supabase";

export function Home() {
  const { products } = useProducts();
  const [reviews, setReviews] = useState<any[]>([]);
  const filteredProducts = products.filter((p) => p.style === "minimal");
  const newArrivals = filteredProducts.filter((p) => p.isNew).slice(0, 4);
  const featuredReviews = reviews
  .filter((review) => review.rating > 4)
  .slice(0, 3);

  useEffect(() => {
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch reviews:", error);
      return;
    }

    setReviews(data || []);
  };

  fetchReviews();
}, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-black">
          <img
            src="https://images.unsplash.com/photo-1724184888115-e76e42f53dcc?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Hero"
            className="w-full h-full object-cover opacity-90"
          />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white space-y-12 px-4 md:px-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-6xl md:text-8xl tracking-[0.3em] uppercase">
                clo
              </h1>
              <div className="flex items-center justify-center gap-8">
                <Minus size={40} className="opacity-50" />
                <p className="text-sm md:text-base tracking-[0.2em] uppercase opacity-80">
                  Minimal · Original · Design
                </p>
                <Minus size={40} className="opacity-50" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 border-2 border-white text-white px-12 py-4 hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-[0.2em] text-sm"
              >
                Explore Collection
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="border-b border-black bg-white px-4 py-32 text-black transition-all duration-700 dark:border-white/10 dark:bg-black dark:text-white sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
              <div className="h-px w-12 bg-black transition-colors duration-500 dark:bg-white"></div>
              <Minus size={16} className="text-black transition-colors duration-500 dark:text-white" />
              <div className="h-px w-12 bg-black transition-colors duration-500 dark:bg-white"></div>
            </div>
            <h2 className="text-4xl tracking-[0.2em] uppercase text-black transition-colors duration-500 dark:text-white md:text-5xl">
              Less is More
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 transition-colors duration-500 dark:text-gray-300 md:text-lg">
              We believe in the power of simplicity. Each piece is thoughtfully designed to transcend trends, focusing on clean lines, quality materials, and timeless aesthetics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Style Toggle Section */}
      <section className="border-t border-black bg-white px-4 py-32 transition-all duration-700 dark:border-white/10 dark:bg-black sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <StyleSwitch />
        </div>
      </section>

      {/* Collection Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black text-white transition-all duration-700">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl tracking-[0.2em] uppercase mb-3 text-white">
              Collections
            </h2>
            <div className="flex items-center justify-center gap-4 opacity-50">
              <div className="w-8 h-px bg-white"></div>
              <Minus size={12} className="text-white" />
              <div className="w-8 h-px bg-white"></div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black">
            {/* Men */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative overflow-hidden aspect-4/5g-black cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1759357251907-cb8302565818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbW9ub2Nocm9tZSUyMGZhc2hpb24lMjBtb2RlbHxlbnwxfHx8fDE3NzUxMzk4NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Men's Collection"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-linear-to-trom-black/80 via-black/20 to-transparent flex items-end p-12">
                <div className="text-white w-full">
                  <h3 className="text-3xl tracking-[0.2em] uppercase mb-4">
                    Men
                  </h3>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-2"
                  >
                    View Collection <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Women */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden aspect-4/5g-black cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1604513830532-8fce22d9941f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwc3RyZWV0d2VhciUyMGNsb3RoaW5nfGVufDF8fHx8MTc3NTEzOTg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Women's Collection"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
                <div className="text-white w-full">
                  <h3 className="text-3xl tracking-[0.2em] uppercase mb-4">
                    Women
                  </h3>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-2"
                  >
                    View Collection <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="border-b border-black bg-white px-4 py-32 text-black transition-all duration-700 dark:border-white/10 dark:bg-black dark:text-white sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="mb-3 text-3xl tracking-[0.2em] uppercase text-black transition-colors duration-500 dark:text-white md:text-4xl">
              New Arrivals
            </h2>
            <div className="flex items-center justify-center gap-4 opacity-50">
              <div className="h-px w-8 bg-black transition-colors duration-500 dark:bg-white"></div>
              <Minus size={12} className="text-black transition-colors duration-500 dark:text-white" />
              <div className="h-px w-8 bg-black transition-colors duration-500 dark:bg-white"></div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-px bg-gray-200 transition-colors duration-500 sm:grid-cols-2 lg:grid-cols-4 dark:bg-white/10">
            {newArrivals.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 border-2 border-black px-10 py-4 text-sm uppercase tracking-[0.2em] text-black transition-all duration-500 hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="bg-white px-4 py-32 text-black transition-all duration-700 dark:bg-black dark:text-white sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-black transition-colors duration-500 dark:bg-white"></div>
                <Minus size={16} className="text-black opacity-50 transition-colors duration-500 dark:text-white" />
              </div>
              <h2 className="text-4xl leading-tight tracking-[0.2em] uppercase text-black transition-colors duration-500 dark:text-white md:text-5xl">
                Original Design
              </h2>
              <p className="text-lg leading-relaxed text-gray-600 opacity-80 transition-colors duration-500 dark:text-gray-300">
                Every piece in our collection is crafted with intention. We reject fast fashion in favor of enduring design that speaks to those who value authenticity and craftsmanship.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-black transition-all duration-300 hover:translate-x-2 dark:text-white"
              >
                Our Philosophy <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-3/4"
            >
              <img
                src="https://images.unsplash.com/photo-1629922952881-2eed9b2f995b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZmFzaGlvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTA3NjEzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Design Philosophy"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 transition-all duration-700 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 border-2 border-white flex items-center justify-center transition-colors duration-500">
                  <Minus size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl tracking-[0.2em] uppercase transition-colors duration-500 text-white">Minimal</h3>
              <p className="leading-relaxed transition-colors duration-500 opacity-75 text-gray-300">
                Clean lines and refined silhouettes that stand the test of time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 border-2 border-white flex items-center justify-center transition-colors duration-500">
                  <Minus size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl tracking-[0.2em] uppercase transition-colors duration-500 text-white">Original</h3>
              <p className="leading-relaxed transition-colors duration-500 opacity-75 text-gray-300">
                Unique designs that reflect authentic creative vision.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 border-2 border-white flex items-center justify-center transition-colors duration-500">
                  <Minus size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl tracking-[0.2em] uppercase transition-colors duration-500 text-white">Quality</h3>
              <p className="leading-relaxed transition-colors duration-500 opacity-75 text-gray-300">
                Premium materials and meticulous attention to detail.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white px-4 py-32 text-black transition-all duration-700 dark:bg-black dark:text-white sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="mb-3 text-3xl tracking-[0.2em] uppercase text-black transition-colors duration-500 dark:text-white md:text-4xl">
              What They Say
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-black transition-colors duration-500 dark:bg-white"></div>
              <Minus size={12} className="text-black opacity-50 transition-colors duration-500 dark:text-white" />
              <div className="h-px w-8 bg-black transition-colors duration-500 dark:bg-white"></div>
            </div>
          </motion.div>

          {featuredReviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {featuredReviews.map((review, index) => {
                const profile = getCustomerProfileByEmail(review.customerEmail);

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="space-y-6 border-2 border-black bg-white p-8 transition-all duration-500 dark:border-white/15 dark:bg-neutral-950"
                  >
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, starIndex) => (
                        <div
                          key={starIndex}
                          className="h-4 w-4 bg-black transition-colors duration-500 dark:bg-white"
                        ></div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {review.productName}
                      </p>
                      <p className="leading-relaxed text-black opacity-80 transition-colors duration-500 dark:text-white">
                        "{review.comment}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4 border-t border-black pt-4 dark:border-white/15">
                      {profile?.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={review.customerName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm uppercase tracking-wider text-white dark:bg-white dark:text-black">
                          {review.customerName
                            .split(" ")
                            .map((name: any[]) => name[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm tracking-wider uppercase text-black dark:text-white">
                          {review.customerName}
                        </p>
                        <p className="text-xs tracking-wider text-gray-500 dark:text-gray-400">
                          Verified Customer
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-gray-600 transition-colors duration-500 dark:text-gray-300">
                High-rated approved customer reviews will appear here once they start coming in.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white px-4 py-32 text-black transition-all duration-700 dark:bg-black dark:text-white sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-black transition-colors duration-500 dark:bg-white"></div>
                <Minus size={12} className="text-black opacity-50 transition-colors duration-500 dark:text-white" />
                <div className="h-px w-8 bg-black transition-colors duration-500 dark:bg-white"></div>
              </div>
              <h2 className="text-3xl tracking-[0.2em] uppercase text-black transition-colors duration-500 dark:text-white md:text-4xl">
                Stay Updated
              </h2>
              <p className="mx-auto max-w-md text-gray-600 opacity-75 transition-colors duration-500 dark:text-gray-300">
                Join our community for exclusive releases and design insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-px max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-8 py-5 focus:outline-none uppercase tracking-widest text-sm transition-all duration-500 bg-black text-white placeholder:text-gray-500"
              />
              <button className="px-10 py-5 uppercase tracking-[0.2em] text-sm whitespace-nowrap transition-all duration-500 bg-black text-white hover:bg-gray-900">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
