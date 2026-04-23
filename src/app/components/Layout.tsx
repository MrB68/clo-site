
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, LogOut, X, Home, Store, Layers, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Bell } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
const timeAgo = (dateStr?: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};
const triggerHaptic = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10);
  }
};


export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [profileName, setProfileName] = useState<string>("");
  const [footerOpen, setFooterOpen] = useState<string | null>(null);
  const toggleFooter = (section: string) => {
    setFooterOpen(prev => (prev === section ? null : section));
  };
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { notifications, setNotifications } = useNotifications();
  const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;
  const [notifOpen, setNotifOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = localStorage.getItem("cartItems");
      if (cartItems) {
        try {
          const items = JSON.parse(cartItems);
          const totalItems = Array.isArray(items)
            ? items.reduce(
              (sum, item) =>
                sum +
                (typeof item?.quantity === "number" && item.quantity > 0
                  ? item.quantity
                  : 1),
              0
            )
            : 0;
          setCartCount(totalItems);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Listen for cartUpdated to trigger bounce on cart icon
  useEffect(() => {
    const trigger = () => {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 400);
    };

    window.addEventListener("cartUpdated", trigger);
    return () => window.removeEventListener("cartUpdated", trigger);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?.id || !supabase) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!error && data?.full_name) {
        setProfileName(data.full_name);
      }
    };

    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !supabase) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new;
          setNotifications((prev: any) => [n, ...(prev || [])]);

          const meta = n.meta || {}; // expect { order_id, order_code, total, status, link }
          const title = n.title || "Update";
          const message = n.message || "";
          const link = meta.link || (meta.order_id ? `/orders/${meta.order_id}` : undefined);

          toast.custom((t) => (
            <div className="bg-black text-white p-4 rounded-xl border border-white/10 w-[320px]">
              <p className="text-sm font-semibold leading-tight">{title}</p>
              {message && (
                <p className="text-xs text-gray-400 mt-1 leading-snug">{message}</p>
              )}
              {(meta.order_code || meta.total || meta.status) && (
                <div className="mt-2 text-[11px] text-gray-500 flex flex-wrap gap-2">
                  {meta.order_code && <span>#{meta.order_code}</span>}
                  {meta.total && <span>Rs {meta.total}</span>}
                  {meta.status && <span className="uppercase">{meta.status}</span>}
                </div>
              )}
              {link && (
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate(link);
                  }}
                  className="mt-3 text-[11px] uppercase tracking-wider border border-white/20 px-3 py-1 rounded hover:bg-white/10"
                >
                  View
                </button>
              )}
            </div>
          ));

          // 🔊 Chrome-safe sound (fresh instance)
          try {
            const unlocked = (window as any).audioUnlocked;
            if (unlocked) {
              const audio = new Audio("/notification.wav");
              audio.volume = 1;
              const p = audio.play();
              if (p !== undefined) p.catch(() => {});
            }
          } catch {}
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);


  // toast handled by ToastProvider


  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuery = searchTerm.trim();
    navigate(trimmedQuery ? `/shop?search=${encodeURIComponent(trimmedQuery)}` : "/shop");
    setSearchOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden max-w-[100vw]">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20 flex-wrap">
            {/* Logo */}
            <Link to="/" className="text-2xl tracking-[0.3em] uppercase hover:opacity-70 transition-opacity absolute left-4 md:static">
              clo
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2 pointer-events-auto">
              <Link
                to="/shop"
                className="relative group tracking-widest uppercase text-sm text-white whitespace-nowrap"
              >
                Shop
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/about"
                className="relative group tracking-widest uppercase text-sm text-white whitespace-nowrap"
              >
                About
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/collections"
                className="relative group tracking-widest uppercase text-sm text-white whitespace-nowrap"
              >
                Collections
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/sale"
                className="relative group tracking-widest uppercase text-sm text-white whitespace-nowrap"
              >
                Sale
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
            
            
            
            {/* Icons (visible on all screens) */}
            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:opacity-70 transition-opacity text-white flex items-center justify-center"
              >
                <Search size={20} />
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hover:opacity-70 transition-opacity text-white flex items-center justify-center"
                >
                  <User size={20} />
                </button>
                <AnimatePresence mode="popLayout" initial={false}>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-4 w-56 bg-black border border-gray-800 shadow-2xl text-white rounded-xl overflow-hidden"
                    >
                      <div className="py-2">
                        {isAuthenticated ? (
                          <>
                            <div className="px-6 py-3 border-b border-gray-800">
                              <p className="text-sm font-medium tracking-wider text-white">
                                {profileName || "User"}
                              </p>
                              <p className="text-xs text-gray-400 tracking-wider mt-1 break-all">
                                {user?.email}
                              </p>
                            </div>
                            <Link
                              to="/orders"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-white/5 transition-colors text-white"
                            >
                              Orders
                            </Link>
                            <Link
                              to="/wishlist"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-white/5 transition-colors text-white"
                            >
                              Wishlist
                            </Link>
                            <Link
                              to="/profile"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-white/5 transition-colors text-white"
                            >
                              Profile
                            </Link>
                            <div className="border-t border-gray-800 my-2"></div>
                            <button
                              onClick={async () => {
                                await supabase.auth.signOut();
                                setUserMenuOpen(false);

                                // 🔥 force immediate UI update + redirect
                                navigate("/signin");
                              }}
                              className="w-full text-left px-6 py-3 text-sm tracking-wider uppercase hover:bg-white/5 transition-colors text-red-600 flex items-center gap-2"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                          <Link
                            to="/signin"
                            className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-white/5 transition-colors text-white"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-white/5 transition-colors text-white"
                          >
                            Register
                          </Link>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={async () => {
                    const next = !notifOpen;
                    setNotifOpen(next);

                    if (next && (notifications?.length || 0) > 0) {
                      // mark all as read in DB
                      await supabase
                        .from("notifications")
                        .update({ is_read: true })
                        .eq("user_id", user?.id || "");

                      // update local state
                      setNotifications((prev: any[]) =>
                        (prev || []).map((n) => ({ ...n, is_read: true }))
                      );
                    }
                  }}
                  className="hover:opacity-70 transition-opacity text-white flex items-center justify-center"
                >
                  <Bell size={20} />
                </button>

                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-semibold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                <AnimatePresence mode="popLayout" initial={false}>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-4 w-[320px] bg-black border border-gray-800 shadow-2xl text-white rounded-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between text-sm uppercase tracking-wider">
                        <span>Notifications</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await supabase
                                .from("notifications")
                                .delete()
                                .eq("user_id", user?.id);

                              setNotifications([]);
                            }}
                            className="text-xs text-red-500 hover:text-red-400 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {(notifications || []).length === 0 ? (
                          <p className="px-4 py-4 text-gray-400 text-sm">
                            No notifications
                          </p>
                        ) : (
                          (notifications || []).map((n: any) => {
                            const meta = n.meta || {};
                            const link =
                            meta.link ||
                            (meta.order_id
                              ? `/orders?orderId=${meta.order_id}&action=details`
                              : undefined);
                            return (
                              <div
                                key={n.id}
                                onClick={async () => {
                                  // mark single as read
                                  await supabase
                                    .from("notifications")
                                    .update({ is_read: true })
                                    .eq("id", n.id);

                                  setNotifications((prev: any[]) =>
                                    (prev || []).map((x) =>
                                      x.id === n.id ? { ...x, is_read: true } : x
                                    )
                                  );

                                  if (link) {
                                    navigate(link);
                                  } else {
                                    console.warn("No link found for notification:", n);
                                  }
                                }}
                                className={`px-4 py-3 border-b border-gray-800 text-sm cursor-pointer flex flex-col gap-1 hover:bg-white/5 ${
                                  !n.is_read ? "bg-white/5" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium leading-tight">
                                    {n.title}
                                  </p>
                                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                    {new Date(n.created_at).toLocaleString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>

                                {n.message && (
                                  <p className="text-xs text-gray-400 leading-snug">
                                    {n.message}
                                  </p>
                                )}

                                {(meta.order_code || meta.total || meta.status) && (
                                  <div className="mt-1 text-[11px] text-gray-500 flex flex-wrap gap-2">
                                    {meta.order_code && <span>#{meta.order_code}</span>}
                                    {meta.total && <span>Rs {meta.total}</span>}
                                    {meta.status && (
                                      <span className="uppercase">{meta.status}</span>
                                    )}
                                  </div>
                                )}

                                {link && (
                                  <span className="mt-1 text-[11px] uppercase tracking-wider text-white/70">
                                    Tap to view →
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.div
                id="cart-icon"
                animate={cartBounce ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  to="/cart"
                  className="hover:opacity-70 transition-opacity relative text-white flex items-center justify-center"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-semibold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence mode="popLayout" initial={false}>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-black">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center"
                >
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="SEARCH PRODUCTS..."
                    autoFocus
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="flex-1 bg-neutral-900 text-white border-b-2 border-white/20 px-4 py-3 focus:outline-none focus:border-white transition-colors uppercase tracking-widest text-sm placeholder:text-gray-500"
                  />
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      type="submit"
                      className="bg-white text-black hover:bg-gray-200 px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors"
                    >
                      Search
                    </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-white hover:opacity-70 flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>

      {/* Main Content */}
      <main className="pt-20 pb-20 md:pb-0">
        <Outlet />
      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden bg-white/10 backdrop-blur-xl border border-white/10 flex justify-between px-5 py-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] w-[92%] max-w-md">
        <Link
          to="/"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-95 ${
            location.pathname === "/" ? "text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <Home size={18} />
          <span className="mt-1">Home</span>
          {location.pathname === "/" && (
            <span className="mt-1 w-1 h-1 bg-white rounded-full"></span>
          )}
        </Link>
        <Link
          to="/shop"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-95 ${
            location.pathname === "/shop" ? "text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <Store size={18} />
          <span className="mt-1">Shop</span>
          {location.pathname === "/shop" && (
            <span className="mt-1 w-1 h-1 bg-white rounded-full"></span>
          )}
        </Link>
        <Link
          to="/collections"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-95 ${
            location.pathname === "/collections" ? "text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <Layers size={18} />
          <span className="mt-1">Collections</span>
          {location.pathname === "/collections" && (
            <span className="mt-1 w-1 h-1 bg-white rounded-full"></span>
          )}
        </Link>
        <Link
          to="/sale"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-95 ${
            location.pathname === "/sale" ? "text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <Tag size={18} />
          <span className="mt-1">Sale</span>
          {location.pathname === "/sale" && (
            <span className="mt-1 w-1 h-1 bg-white rounded-full"></span>
          )}
        </Link>
      </div>
      </main>


      <footer className="bg-black text-white pb-28 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col gap-10 md:grid md:grid-cols-2 lg:grid-cols-[1fr_0.9fr_0.9fr_1.2fr] lg:gap-12 text-center md:text-center lg:text-left">
            {/* Brand + SOCIAL MEDIA LINKS */}
            <div className="group space-y-6 sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl tracking-[0.3em] uppercase">clo</h3>
              <div className="space-y-2">
                <p className="max-w-xs mx-auto md:mx-0 text-gray-400 text-sm leading-6 text-center md:text-left">
                  <span className="whitespace-nowrap">
                    Minimal. Original. Design.
                  </span>
                  <span className="block text-white md:text-white/0 transition duration-300 md:group-hover:text-white/75 uppercase tracking-[0.20em] mt-1">
                    Extravagant
                  </span>
                </p>
              </div>

              {/* === SOCIAL MEDIA LINKS === */}
              <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                {/* Facebook */}
                <a
                  href=""//facebook.com/yourpage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social relative w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300"
                >

                  {/* White Icon (default) */}
                  <img
                    src="/icons/facebook-white.svg"
                    alt="Facebook"
                    className="w-9 h-9 absolute transition-opacity duration-300 group-hover/social:opacity-0"
                  />

                  {/* Colored Icon (hover) */}
                  <img
                    src="/icons/facebook-color.svg"
                    alt="Facebook"
                    className="w-9 h-9 absolute opacity-0 transition-opacity duration-300 group-hover/social:opacity-100"
                  />

                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/clofitstudios/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social relative w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300"
                  aria-label="Instagram"
                >

                  {/* White Icon (default) */}
                  <img
                    src="/icons/instagram-white.svg"
                    alt="Instagram"
                    className="w-9 h-9 absolute transition-opacity duration-300 group-hover/social:opacity-0"
                  />

                  {/* Colored Icon (hover) */}
                  <img
                    src="/icons/instagram-color.svg"
                    alt="Instagram"
                    className="w-9 h-9 absolute opacity-0 transition-opacity duration-300 group-hover/social:opacity-100"
                  />

                </a>

                {/* TikTok */}
                <a
                  href=""//tiktok.com/yourpage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social relative w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300"
                >

                  {/* White Icon (default) */}
                  <img
                    src="/icons/tiktok-white.svg"
                    alt="TikTok"
                    className="w-9 h-9 absolute transition-opacity duration-300 group-hover/social:opacity-0"
                  />

                  {/* Colored Icon (hover) */}
                  <img
                    src="/icons/tiktok-color.svg"
                    alt="TikTok"
                    className="w-9 h-9 absolute opacity-0 transition-opacity duration-300 group-hover/social:opacity-100"
                  />

                </a>
              </div>
            </div>

            {/* Shop */}
            <div className="space-y-4 pt-6 border-t border-white/10 md:border-0 md:pt-0 flex flex-col items-center lg:items-center mx-auto max-w-[240px]">
              <button
                onClick={() => toggleFooter("shop")}
                className="w-full text-xs uppercase tracking-[0.25em] text-white/80 flex flex-col items-center text-center"
              >
                Shop
                <span className="md:hidden">{footerOpen === "shop" ? "-" : "+"}</span>
              </button>
              <ul className={`space-y-3 text-sm text-gray-400 ${footerOpen === "shop" ? "block" : "hidden"} md:block text-center flex flex-col items-center`}>
                <li><Link to="/shop" onClick={triggerHaptic} className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white">All Products</Link></li>
                {/* Custom Prints removed */}
                <li><Link to="/shop?filter=new" onClick={triggerHaptic} className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white">New Arrivals</Link></li>
                <li><Link to="/collections" onClick={triggerHaptic} className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white">Collections</Link></li>
                <li><Link to="/sale" onClick={triggerHaptic} className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white">Sale</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div className="space-y-4 pt-6 border-t border-white/10 md:border-0 md:pt-0 flex flex-col items-center lg:items-center mx-auto max-w-[240px]">
              <button
                onClick={() => toggleFooter("help")}
                className="w-full text-xs uppercase tracking-[0.25em] text-white/80 flex flex-col items-center text-center"
              >
                Help
                <span className="md:hidden">{footerOpen === "help" ? "-" : "+"}</span>
              </button>
              <ul className={`space-y-3 text-sm text-gray-400 ${footerOpen === "help" ? "block" : "hidden"} md:block text-center flex flex-col items-center`}>
                <li>
                  <Link
                    to="/customer-service"
                    onClick={triggerHaptic}
                    className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white"
                  >
                    Customer Service
                  </Link>
                </li>
                <li><Link to="/shipping" onClick={triggerHaptic} className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white">Shipping & Returns</Link></li>
                <li><Link to="/size-guide" onClick={triggerHaptic} className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white">Size Guide</Link></li>
                <li><Link to="/contact" onClick={triggerHaptic} className="inline-flex leading-6 transition-colors tracking-wider py-1.5 text-sm text-white/60 hover:text-white">Contact Us</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4 pt-6 border-t border-white/10 md:border-0 md:pt-0 sm:col-span-2 lg:col-span-1 lg:max-w-md">
              <button
                onClick={() => toggleFooter("newsletter")}
                className="w-full text-xs uppercase tracking-[0.25em] text-white/80 flex justify-between items-center md:block"
              >
                Newsletter
                <span className="md:hidden">{footerOpen === "newsletter" ? "-" : "+"}</span>
              </button>
              <div className={`${footerOpen === "newsletter" ? "block" : "hidden"} md:block`}>
                <p className="max-w-md text-sm text-gray-400 leading-6">
                  Subscribe for exclusive offers and updates
                </p>
                <div className="flex flex-col gap-3 mt-3">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-transparent border-b border-white/30 px-2 py-3 text-sm focus:outline-none focus:border-white tracking-wider placeholder:text-white/40"
                  />
                  <button className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 transition-all text-xs tracking-[0.25em] uppercase">
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* === PAYMENT METHODS SECTION === */}
          <div className="mt-16 border-t border-white/10 pt-10">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
              {/* Payment Methods */}
              <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 mr-4">We accept:</span>

                {/* Cash on Delivery */}
                <div className="group flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <img
                    src="/icons/COD.svg"
                    alt="COD"
                    className="w-9 h-11 text-white group-hover:text-green-400" />
                </div>

                {/* eSewa */}
                {/*
                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <img
                    src="/icons/ESEWA.png"
                    alt="eSewa"
                    className="w-18 h-7 text-white group-hover:text-green-400" />
                </div>
                */}

                {/* Khalti */}
                {/* 
                <div className="group flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <img
                    src="/icons/KHALTI.png"
                    alt="Khalti"
                    className="w-18 h-9 text-white group-hover:text-green-400" />
                </div>
                */}

                {/* Nepal Pay */}
                {/*
                <div className="group flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <img
                    src="/icons/NCH.png"
                    alt="Nepal Pay"
                    className="w-18 h-9 object-contain"
                  />
                </div>
                */}
              </div>

              {/* Copyright & Legal */}
              <div className="flex flex-col gap-4 text-center text-xs text-white/50 md:flex-row md:items-center md:justify-between md:text-left">
                <p>© 2026 CLO. All rights reserved.</p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
                  <Link to="/privacy" onClick={triggerHaptic} className="transition-colors tracking-wider hover:text-white">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" onClick={triggerHaptic} className="transition-colors tracking-wider hover:text-white">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;