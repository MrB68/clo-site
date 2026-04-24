import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Minus } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";
import { ProductCard } from "../components/ProductCard";
import { StyleSwitch } from "../components/StyleToggle";
import { getCustomerProfileByEmail } from "../utils/customerProfile";
import { supabase } from "../../lib/supabase";

// Animation variants for smooth staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Home() {
  const { products } = useProducts();
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<"minimal" | "extravagant">("minimal");
  const filteredProducts = products.filter((p) => p.style === selectedStyle);

  // --- Premium Design Slider State/Ref ---
  // Detect mobile view for scroll/duplication logic
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [designIndex, setDesignIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const scrollTimeoutRef = useRef<any>(null);
  const designRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

useEffect(() => {
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);

  // Responsive: detect real mobile device width & update isMobileView state
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const toTime = (v: any) => {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
};

const newArrivals = [...filteredProducts]
  .filter((p) => p.createdAt)
  .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  const featuredReviews = reviews
    .filter((review) => review.rating > 4)
    .slice(0, 3);

  // Ref for auto-scroll horizontal carousel
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const newArrivalsRef = useRef<HTMLDivElement | null>(null);
  const collectionsRef = useRef<HTMLDivElement | null>(null);
  const scrollPauseTimeout = useRef<any>(null);
  const newArrivalsPauseTimeout = useRef<any>(null);
  // Auto-scroll for Collections carousel
  useEffect(() => {
    const el = collectionsRef.current;
    if (el && !el.dataset.paused) el.dataset.paused = "false";
    if (!el) return;

    const speed = 1.0;

    const interval = setInterval(() => {
      if (!el) return;
      if (el.dataset.paused !== "true") {
        el.scrollBy({ left: isMobileView ? 1.2 : speed, behavior: "auto" });
        // Restart from beginning when reaching end
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollTo({ left: 0, behavior: "auto" });
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isMobileView, products]);

  // Force dark mode class on html and body, enforce background for Vercel
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";
  }, []);

  // Load EmbedSocial Instagram Feed script (with deduplication and safe re-trigger)
  useEffect(() => {
    const scriptId = "EmbedSocialHashtagScript";

    // Clear previous embeds (prevents duplication)
    const existing = document.querySelectorAll('.embedsocial-hashtag');
    existing.forEach((el) => {
      el.innerHTML = "";
    });

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://embedsocial.com/cdn/ht.js";
      script.async = true;
      document.head.appendChild(script);
    } else {
      // If script already exists, force re-run by removing and re-adding it
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://embedsocial.com/cdn/ht.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fetch reviews
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

      const normalized = (data || []).map((r: any) => ({
        ...r,
        customerName:
          r.customer_name ||
          (r.customer_email ? r.customer_email.split("@")[0] : "User"),
      }));

      setReviews(normalized);
    };

    fetchReviews();
  }, []);

  // Auto-scroll (seamless loop, pauses on interaction)
  useEffect(() => {
    const el = scrollRef.current;
    if (el && !el.dataset.paused) el.dataset.paused = "false";
    if (!el) return;

    const speed = 1.0;

    const interval = setInterval(() => {
      if (!el) return;
      if (el.dataset.paused !== "true") {
        el.scrollBy({ left: isMobileView ? 1.2 : speed, behavior: "auto" });
        // Restart from beginning when reaching end
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollTo({ left: 0, behavior: "auto" });
        }
      }
    }, 20); // ~50fps, larger step for mobile

    return () => clearInterval(interval);
  }, [selectedStyle, isMobileView]);

  // Auto-scroll for New Arrivals
  useEffect(() => {
    const el = newArrivalsRef.current;
    if (el && !el.dataset.paused) el.dataset.paused = "false";
    if (!el) return;

    const speed = 1.0;

    const interval = setInterval(() => {
      if (!el) return;
      if (el.dataset.paused !== "true") {
        el.scrollBy({ left: isMobileView ? 1.2 : speed, behavior: "auto" });
        // Restart from beginning when reaching end
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollTo({ left: 0, behavior: "auto" });
        }
      }
    }, 20); // ~50fps, larger step for mobile

    return () => clearInterval(interval);
  }, [isMobileView]);

  // --- Auto-rotate effect for Premium Design Slider ---
  useEffect(() => {
    const items = products.filter((p) => p.images?.[0]).slice(0, 6);
    if (!items.length) return;

    const interval = setInterval(() => {
      if (isInteracting) return;

      setDesignIndex((prev) => {
        const next = (prev + 1) % items.length;
        const el = designRef.current;
        if (el) {
          el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products, isInteracting]);


  return (
    <div className="bg-black text-white min-h-screen w-full" style={{ backgroundColor: "#000000", color: "#ffffff" }}>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <motion.img
            src="/home.jpeg"
            alt="Hero"
            className="w-full h-full object-cover object-center opacity-95 brightness-110"
            initial={{ scale: 1 }}
            animate={{ scale: 1.2, y: [-30, 30] }}
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,black_85%)] opacity-70" />
          <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
        <motion.div
          className="relative z-10 h-full flex items-center justify-center"
          style={{ transform: `translateY(${scrollY * -0.1}px)`, opacity: 1 - scrollY / 600 }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-center text-white space-y-8 px-6 md:px-0"
          >
            <motion.div
              variants={itemVariants}
              className="space-y-6"
            >
              <motion.h1
                className="text-4xl sm:text-5xl md:text-8xl tracking-[0.2em] uppercase flex justify-center gap-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                {"clo".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>
              <div className="flex items-center justify-center gap-4 sm:gap-8">
                <Minus size={40} className="opacity-50" />
                <motion.p
                  className="text-sm md:text-base tracking-[0.2em] uppercase opacity-80"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Minimal · Original · Design
                </motion.p>
                <Minus size={40} className="opacity-50" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Link
                to="/collections"
                className="inline-flex items-center gap-3 border border-white/40 text-white px-8 py-4 sm:px-12 hover:bg-white hover:border-white hover:text-black transition-all duration-500 uppercase tracking-[0.2em] text-sm backdrop-blur-sm [&_svg]:transition-colors [&_svg]:duration-500 hover:[&_svg]:text-black"
              >
                Explore Collections
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="border-b border-white/10 bg-black px-4 py-32 text-white transition-all duration-700 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
              <div className="h-px w-12 bg-white"></div>
              <Minus size={16} className="text-white" />
              <div className="h-px w-12 bg-white"></div>
            </div>
            <motion.h2
              variants={itemVariants}
              className="text-4xl tracking-[0.2em] uppercase text-white md:text-5xl"
            >
              Less is More
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg"
            >
              We believe in the power of simplicity. Each piece is thoughtfully designed to transcend trends, focusing on clean lines, quality materials, and timeless aesthetics.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="bg-black px-4 pt-16 pb-24 text-white sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl tracking-[0.2em] uppercase text-white">
              Instagram
            </h2>
          </div>

          {/* EmbedSocial Instagram Feed - Premium block */}
          <div className="relative overflow-hidden rounded-none w-full max-w-full">
            {/* edge fade */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 sm:w-20 md:w-24 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 sm:w-20 md:w-24 bg-gradient-to-l from-black via-black/70 to-transparent z-10" />

            <div
              className="embedsocial-hashtag w-full max-w-full transition-all duration-700"
              data-ref="7f88fdb0dc61f75d8a641acda7f911377702b98e"
              data-dynamicload="yes"
              data-lazyload="yes"
            ></div>
          </div>
        </div>
      </section>
      <style>
        {`
      /* Remove EmbedSocial branding */
      .embedsocial-hashtag .feed-powered-by-es,
      .embedsocial-hashtag .es-widget-branding {
        display: none !important;
      }

      /* Instagram feed premium styling */
      .embedsocial-hashtag {
        filter: contrast(1.05) brightness(0.95);
      }

      .embedsocial-hashtag img {
        transition: transform 0.6s ease;
      }

      .embedsocial-hashtag img:hover {
        transform: scale(1.05);
      }
      .embedsocial-hashtag iframe,
      .embedsocial-hashtag > div {
        max-width: 100% !important;
        width: 100% !important;
      }
      `}
      </style>

      {/* Style Toggle Section */}
      <section className="border-t border-white/10 bg-black px-4 pt-20 pb-8 transition-all duration-700 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <StyleSwitch activeStyle={selectedStyle} onStyleChange={setSelectedStyle} />
        </div>
      </section>

      {/* Selected Style Products */}
      <section className="bg-black px-4 pt-0 pb-20 text-white sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl tracking-[0.2em] uppercase text-white">
              {selectedStyle === "minimal" ? "Minimal Picks" : "Extravagant Picks"}
            </h2>
          </div>
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden touch-auto cursor-grab active:cursor-grabbing md:scroll-auto snap-none relative [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] overscroll-x-contain will-change-transform translate-z-0"
            style={{}}
            onMouseEnter={() => {
              if (scrollRef.current) scrollRef.current.dataset.paused = "true";
            }}
            onMouseLeave={() => {
              if (scrollRef.current) scrollRef.current.dataset.paused = "false";
            }}
            onTouchStart={() => {
              if (!scrollRef.current) return;
              scrollRef.current.dataset.paused = "true";
              if (scrollPauseTimeout.current) clearTimeout(scrollPauseTimeout.current);
            }}
            onTouchEnd={() => {
              if (!scrollRef.current) return;
              scrollPauseTimeout.current = setTimeout(() => {
                if (scrollRef.current) scrollRef.current.dataset.paused = "false";
              }, 2000);
            }}
          >
            <div className="pointer-events-none absolute left-0 top-0 h-full w-6 sm:w-12 md:w-16 bg-gradient-to-r from-black/40 md:from-black/20 via-black/20 md:via-black/10 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-6 sm:w-12 md:w-16 bg-gradient-to-l from-black/40 md:from-black/20 via-black/20 md:via-black/10 to-transparent z-10" />
            <div className="flex gap-1 sm:gap-3 select-none snap-none items-stretch">
              {(isMobileView
                ? filteredProducts.filter((p) => p.images?.[0]).slice(0, 12)
                : [
                    ...filteredProducts.filter((p) => p.images?.[0]).slice(0, 12),
                    ...filteredProducts.filter((p) => p.images?.[0]).slice(0, 12)
                  ]
              ).map((product, index) => (
                <motion.div
                  key={product.id + "-" + index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`min-w-[75%] sm:min-w-[50%] md:min-w-[33.33%]
max-w-[85%] sm:max-w-[50%] md:max-w-[33.33%] flex-shrink-0 transition-all duration-700 group-hover:scale-105 overflow-visible`}
                >
                  <div className="group relative overflow-hidden h-[420px] sm:h-[480px] md:h-[520px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_button]:hidden md:[&_button]:block">
                    <ProductCard product={product} imageOnly />
                    <div className="pointer-events-none absolute inset-0 hidden md:flex items-end justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-500">
                      <div className="pointer-events-auto w-full text-center pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <p className="text-xs tracking-[0.3em] uppercase text-white">
                          View Product
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              to={`/shop?style=${selectedStyle}`}
              className="inline-flex items-center gap-3 border-2 border-white px-10 py-4 text-sm uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-white hover:!text-black [&_svg]:transition-colors [&_svg]:duration-500 hover:[&_svg]:text-black"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Collection Carousel */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black text-white transition-all duration-700">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-20"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl tracking-[0.2em] uppercase mb-3 text-white">
              Collections
            </motion.h2>
            <div className="flex items-center justify-center gap-4 opacity-50">
              <div className="w-8 h-px bg-white"></div>
              <Minus size={12} className="text-white" />
              <div className="w-8 h-px bg-white"></div>
            </div>
          </motion.div>

          <div
            ref={collectionsRef}
            className="overflow-x-auto overflow-y-hidden touch-auto cursor-grab active:cursor-grabbing snap-none relative [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] overscroll-x-contain will-change-transform translate-z-0"
            onMouseEnter={() => {
              if (collectionsRef.current) collectionsRef.current.dataset.paused = "true";
            }}
            onMouseLeave={() => {
              if (collectionsRef.current) collectionsRef.current.dataset.paused = "false";
            }}
            onTouchStart={() => {
              if (!collectionsRef.current) return;
              collectionsRef.current.dataset.paused = "true";
            }}
            onTouchEnd={() => {
              if (!collectionsRef.current) return;
              setTimeout(() => {
                if (collectionsRef.current) collectionsRef.current.dataset.paused = "false";
              }, 2000);
            }}
          >
            <div className="flex gap-1 sm:gap-3 select-none snap-none">
              {(isMobileView
                ? [...new Set(products.map((p) => p.category))]
                : [
                    ...new Set(products.map((p) => p.category)),
                    ...new Set(products.map((p) => p.category))
                  ]
              ).map((category, index) => {
                const categoryProducts = products.filter((p) => p.category === category);
                const previewImage =
                  categoryProducts.find((p) => p.images?.[0])?.images?.[0] ||
                  "https://images.unsplash.com/photo-1521334884684-d80222895322";

                return (
                  <div className="min-w-[75%] max-w-[75%] sm:min-w-[50%] sm:max-w-[50%] md:min-w-[33.33%] md:max-w-[33.33%] flex-shrink-0" key={category + "-" + index}>
                    <Link to={`/collections/${category}`} className="block">
                      <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden h-[420px] sm:h-[480px] md:h-[520px] bg-black flex items-center justify-center cursor-pointer transition-all duration-700 hover:scale-[1.03] opacity-100"
                      >
                        <img
                          src={previewImage || "/placeholder.png"}
                          alt={`${category} collection`}
                          className="max-w-full max-h-full object-contain p-2 sm:p-4 bg-transparent transition-all duration-700 group-hover:scale-105 relative z-0 block mx-auto"
                        />

                        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-3 sm:p-4">
                          <div className="text-white w-full text-center">
                            <h3 className="text-sm sm:text-base md:text-xl tracking-[0.15em] uppercase text-center leading-tight break-words">
                              {category?.charAt(0).toUpperCase() + category?.slice(1)}
                            </h3>
                            <span
                              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase opacity-70 mt-1"
                            >
                              View Collection <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/collections"
              className="inline-flex items-center gap-3 border-2 border-white px-10 py-4 text-sm uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-white hover:!text-black [&_svg]:transition-colors [&_svg]:duration-500 hover:[&_svg]:text-black"
            >
              View All Collections
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* New Arrivals */}
      <section className="border-b border-white/10 bg-black px-4 py-32 text-white transition-all duration-700 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <motion.h2 variants={itemVariants} className="mb-3 text-3xl tracking-[0.2em] uppercase text-white md:text-4xl">
              New Arrivals
            </motion.h2>
            <div className="flex items-center justify-center gap-4 opacity-50">
              <div className="h-px w-8 bg-white"></div>
              <Minus size={12} className="text-white" />
              <div className="h-px w-8 bg-white"></div>
            </div>
          </motion.div>

          <div
            ref={newArrivalsRef}
            className="overflow-x-auto overflow-y-hidden touch-auto cursor-grab active:cursor-grabbing md:scroll-auto snap-none relative [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] overscroll-x-contain will-change-transform translate-z-0"
            style={{}}
            onMouseEnter={() => {
              if (newArrivalsRef.current) newArrivalsRef.current.dataset.paused = "true";
            }}
            onMouseLeave={() => {
              if (newArrivalsRef.current) newArrivalsRef.current.dataset.paused = "false";
            }}
            onTouchStart={() => {
              if (!newArrivalsRef.current) return;
              newArrivalsRef.current.dataset.paused = "true";
              if (newArrivalsPauseTimeout.current) clearTimeout(newArrivalsPauseTimeout.current);
            }}
            onTouchEnd={() => {
              if (!newArrivalsRef.current) return;
              newArrivalsPauseTimeout.current = setTimeout(() => {
                if (newArrivalsRef.current) newArrivalsRef.current.dataset.paused = "false";
              }, 2000);
            }}
          >
            <div className="pointer-events-none absolute left-0 top-0 h-full w-6 sm:w-12 md:w-16 bg-gradient-to-r from-black/40 md:from-black/20 via-black/20 md:via-black/10 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-6 sm:w-12 md:w-16 bg-gradient-to-l from-black/40 md:from-black/20 via-black/20 md:via-black/10 to-transparent z-10" />

            <div className="flex gap-4 select-none snap-none">
              {(isMobileView
                ? newArrivals.filter((p) => p.images?.[0])
                : [
                    ...newArrivals.filter((p) => p.images?.[0]),
                    ...newArrivals.filter((p) => p.images?.[0])
                  ]
              ).map((product, index) => (
                <motion.div
                  key={product.id + "-" + index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="show"
                  className="min-w-[75%] sm:min-w-[50%] md:min-w-[33.33%]
max-w-[85%] sm:max-w-[50%] md:max-w-[33.33%] flex-shrink-0 transition-all duration-700 hover:scale-[1.03] overflow-visible"
                >
                  <div className="group relative overflow-hidden h-[420px] sm:h-[480px] md:h-[520px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_button]:hidden md:[&_button]:block">
                    <ProductCard product={product} imageOnly />
                    <div className="pointer-events-none absolute inset-0 hidden md:flex items-end justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-500">
                      <div className="pointer-events-auto w-full text-center pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <p className="text-xs tracking-[0.3em] uppercase text-white">
                          View Product
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/new-arrivals"
              className="inline-flex items-center gap-3 border-2 border-white px-10 py-4 text-sm uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-white hover:!text-black [&_svg]:transition-colors [&_svg]:duration-500 hover:[&_svg]:text-black"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Design Principles */}
      <section className="bg-black px-4 py-32 text-white transition-all duration-700 sm:px-6 lg:px-8">
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
                <div className="h-px w-12 bg-white"></div>
                <Minus size={16} className="text-white opacity-50" />
              </div>
              <h2 className="text-4xl leading-tight tracking-[0.2em] uppercase text-white md:text-5xl">
                Original Design
              </h2>
              <p className="text-lg leading-relaxed text-gray-300 opacity-80">
                Every piece in our collection is crafted with intention. We reject fast fashion in favor of enduring design that speaks to those who value authenticity and craftsmanship.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-white transition-all duration-300 hover:translate-x-2"
              >
                Our Philosophy <ArrowRight size={16} />
              </Link>
            </motion.div>
            <div className="flex flex-col items-center w-full">
              <motion.div
                ref={designRef}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-full h-[420px] sm:h-[550px] md:h-[650px] overflow-x-auto overflow-y-hidden touch-pan-x scroll-smooth [&::-webkit-scrollbar]:hidden"
                onScroll={(e) => {
                  const el = e.currentTarget as HTMLDivElement;

                  const index = Math.round(el.scrollLeft / el.clientWidth);
                  setDesignIndex(index);

                  setIsInteracting(true);
                  if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                  scrollTimeoutRef.current = setTimeout(() => {
                    setIsInteracting(false);
                  }, 1200);
                }}
              >
                <div className="flex h-full">
                  {products
                    .filter((p) => p.images?.[0])
                    .slice(0, 6)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="min-w-full h-full relative flex items-center justify-center bg-black"
                      >
                        <img
                          src={product.images?.[0] || ""}
                          alt={product.name}
                          className="w-full h-full object-contain bg-black"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* indicators */}
              <div className="mt-6 flex justify-center">
                <div className="flex gap-3">
                  {products
                    .filter((p) => p.images?.[0])
                    .slice(0, 6)
                    .map((_, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          const el = designRef.current;
                          if (!el) return;
                          el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                          setDesignIndex(i);
                        }}
                        className={`h-[3px] rounded-full cursor-pointer transition-all duration-500 ${designIndex === i ? "w-10 bg-white" : "w-4 bg-white/30 hover:bg-white/60"}`}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 transition-all duration-700 bg-black text-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <motion.div
              variants={itemVariants}
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
              variants={itemVariants}
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
              variants={itemVariants}
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
        </motion.div>
      </section>

      {/* Reviews Section */}
      <section className="bg-black px-4 py-32 text-white transition-all duration-700 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <motion.h2 variants={itemVariants} className="mb-3 text-3xl tracking-[0.2em] uppercase text-white md:text-4xl">
              What They Say
            </motion.h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-white"></div>
              <Minus size={12} className="text-white opacity-50" />
              <div className="h-px w-8 bg-white"></div>
            </div>
          </motion.div>

          {featuredReviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {featuredReviews.map((review, index) => {
                const profile = review.customerEmail
                  ? getCustomerProfileByEmail(review.customerEmail)
                  : null;

                return (
                  <motion.div
                    key={review.id}
                    variants={itemVariants}
                    className="space-y-6 border-2 border-white/15 bg-neutral-950 p-8 transition-all duration-500"
                  >
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, starIndex) => (
                        <div
                          key={starIndex}
                          className="h-4 w-4 bg-white"
                        ></div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-wider text-gray-400">
                        {review.productName}
                      </p>
                      <p className="leading-relaxed text-white opacity-80">
                        "{review.comment}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4 border-t border-white/15 pt-4">
                      {profile?.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={review.customer_name || review.customerName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm uppercase tracking-wider text-black">
                          {(review.customer_name || review.customerName || "Anonymous")
                            .split(" ")
                            .map((name: string) => name?.[0] || "")
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm tracking-wider uppercase text-white">
                          {review.customer_name || review.customerName}
                        </p>
                        <p className="text-xs tracking-wider text-gray-400">
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
              <p className="text-gray-300">
                High-rated approved customer reviews will appear here once they start coming in.
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Newsletter */}
      <section className="bg-black px-4 py-32 text-white transition-all duration-700 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-white"></div>
                <Minus size={12} className="text-white opacity-50" />
                <div className="h-px w-8 bg-white"></div>
              </div>
              <motion.h2 variants={itemVariants} className="text-3xl tracking-[0.2em] uppercase text-white md:text-4xl">
                Stay Updated
              </motion.h2>
              <motion.p variants={itemVariants} className="mx-auto max-w-md text-gray-300 opacity-75">
                Join our community for exclusive releases and design insights.
              </motion.p>
            </div>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-px max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-8 py-5 focus:outline-none uppercase tracking-widest text-sm transition-all duration-500 bg-black text-white placeholder:text-gray-500"
              />
              <button className="px-10 py-5 uppercase tracking-[0.2em] text-sm whitespace-nowrap transition-all duration-500 bg-black text-white hover:bg-gray-900">
                Subscribe
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}