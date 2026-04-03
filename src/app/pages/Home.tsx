import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Minus } from "lucide-react";
import { useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { StyleSwitch } from "../components/StyleToggle";

export function Home() {
  const [activeStyle, setActiveStyle] = useState<"minimal" | "extravagant">("minimal");
  const { products } = useProducts();
  const filteredProducts = products.filter((p) => p.style === activeStyle);
  const newArrivals = filteredProducts.filter((p) => p.isNew).slice(0, 4);

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
          <div className="text-center text-white space-y-12 px-4">
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-black"></div>
              <Minus size={16} />
              <div className="w-12 h-px bg-black"></div>
            </div>
            <h2 className="text-4xl md:text-5xl tracking-[0.2em] uppercase">
              Less is More
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-gray-600">
              We believe in the power of simplicity. Each piece is thoughtfully
              designed to transcend trends, focusing on clean lines, quality
              materials, and timeless aesthetics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Style Toggle Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <StyleSwitch 
            activeStyle={activeStyle}
            onStyleChange={setActiveStyle}
          />
        </div>
      </section>

      {/* Collection Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl tracking-[0.2em] uppercase mb-3">
              Collections
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-px-white"></div>
              <Minus size={12} className="opacity-50" />
              <div className="w-8 h-px-white"></div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white">
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl tracking-[0.2em] uppercase mb-3">
              New Arrivals
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-px bg-black"></div>
              <Minus size={12} className="opacity-50" />
              <div className="w-8 h-px bg-black"></div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
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
              className="inline-flex items-center gap-3 border-2 border-black text-black px-10 py-4 hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-[0.2em] text-sm"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black text-white">
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
                <div className="w-12 h-px bg-white"></div>
                <Minus size={16} className="opacity-50" />
              </div>
              <h2 className="text-4xl md:text-5xl tracking-[0.2em] uppercase leading-tight">
                Original
                <br />
                Design
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                Every piece in our collection is crafted with intention. We
                reject fast fashion in favor of enduring design that speaks to
                those who value authenticity and craftsmanship.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase hover:translate-x-2 transition-transform duration-300"
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
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
                <div className="w-16 h-16 border-2 border-black flex items-center justify-center">
                  <Minus size={24} />
                </div>
              </div>
              <h3 className="text-xl tracking-[0.2em] uppercase">Minimal</h3>
              <p className="text-gray-600 leading-relaxed">
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
                <div className="w-16 h-16 border-2 border-black flex items-center justify-center">
                  <Minus size={24} />
                </div>
              </div>
              <h3 className="text-xl tracking-[0.2em] uppercase">Original</h3>
              <p className="text-gray-600 leading-relaxed">
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
                <div className="w-16 h-16 border-2 border-black flex items-center justify-center">
                  <Minus size={24} />
                </div>
              </div>
              <h3 className="text-xl tracking-[0.2em] uppercase">Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Premium materials and meticulous attention to detail.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl tracking-[0.2em] uppercase mb-3">
              What They Say
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-px bg-white"></div>
              <Minus size={12} className="opacity-50" />
              <div className="w-8 h-px bg-white"></div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white text-black p-8 space-y-6"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-black"></div>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "The quality is exceptional. Every piece feels thoughtfully
                designed and built to last. Finally, a brand that understands
                minimalism."
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwb3J0cmFpdCUyMGhlYWRzaG90JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NTE0MDIwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Reviewer"
                  className="w-12 h-12 object-cover"
                />
                <div>
                  <p className="text-sm tracking-wider uppercase">Sarah Chen</p>
                  <p className="text-xs text-gray-500 tracking-wider">
                    Verified Customer
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white text-black p-8 space-y-6"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-black"></div>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "I love how versatile the pieces are. Clean, timeless designs
                that work for any occasion. The custom print service is
                incredible."
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1758922584983-82ffd5720c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsJTIwbWluaW1hbGlzdHxlbnwxfHx8fDE3NzUxNDAyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Reviewer"
                  className="w-12 h-12 object-cover"
                />
                <div>
                  <p className="text-sm tracking-wider uppercase">Maya Rodriguez</p>
                  <p className="text-xs text-gray-500 tracking-wider">
                    Verified Customer
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white text-black p-8 space-y-6"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-black"></div>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Best clothing brand I've found in years. The attention to
                detail is unmatched and the fit is perfect. Worth every penny."
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1558730234-d8b2281b0d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHN0dWRpbyUyMGxpZ2h0aW5nfGVufDF8fHx8MTc3NTE0MDIwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Reviewer"
                  className="w-12 h-12 object-cover"
                />
                <div>
                  <p className="text-sm tracking-wider uppercase">James Park</p>
                  <p className="text-xs text-gray-500 tracking-wider">
                    Verified Customer
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="w-8 h-px bg-white"></div>
                <Minus size={12} className="opacity-50" />
                <div className="w-8 h-px bg-white"></div>
              </div>
              <h2 className="text-3xl md:text-4xl tracking-[0.2em] uppercase">
                Stay Updated
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Join our community for exclusive releases and design insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-px max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white text-black px-8 py-5 focus:outline-none uppercase tracking-widest text-sm placeholder:text-gray-400"
              />
              <button className="px-10 py-5 bg-white text-black hover:bg-gray-200 transition-colors uppercase tracking-[0.2em] text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
