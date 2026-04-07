import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Search, LogOut, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const { user, signOut, isAuthenticated } = useAuth();

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

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    setMounted(true);
  }, []);


  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuery = searchTerm.trim();
    navigate(trimmedQuery ? `/shop?search=${encodeURIComponent(trimmedQuery)}` : "/shop");
    setSearchOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="text-2xl tracking-[0.3em] uppercase hover:opacity-70 transition-opacity">
              clo
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/shop"
                className="relative group tracking-widest uppercase text-sm text-white"
              >
                Shop
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>

              </Link>
            
              <Link
                to="/about"
                className="relative group tracking-widest uppercase text-sm text-white"
              >
                About
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/collections"
                className="relative group tracking-widest uppercase text-sm text-white"
              >
                Collections
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/sale"
                className="relative group tracking-widest uppercase text-sm text-white"
              >
                Sale
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
            
            
            
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:opacity-70 transition-opacity text-white"
              >
                <Search size={20} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hover:opacity-70 transition-opacity text-white"
                >
                  <User size={20} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-4 w-48 bg-background border border-border shadow-lg"
                    >
                      <div className="py-2">
                        {isAuthenticated ? (
                          <>
                            <div className="px-6 py-3 border-b border-gray-200">
                              <p className="text-sm font-medium tracking-wider text-foreground">
                                {user?.name}
                              </p>
                              <p className="text-xs text-gray-500 tracking-wider">
                                {user?.email}
                              </p>
                            </div>
                            <Link
                              to="/orders"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-muted transition-colors text-foreground"
                            >
                              Orders
                            </Link>
                            <Link
                              to="/profile"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-muted transition-colors text-foreground"
                            >
                              Profile
                            </Link>
                            <div className="border-t border-gray-200 my-2"></div>
                            <button
                              onClick={() => {
                                signOut();
                                setUserMenuOpen(false);
                              }}
                              className="w-full text-left px-6 py-3 text-sm tracking-wider uppercase hover:bg-muted transition-colors text-red-600 flex items-center gap-2"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/signin"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-muted transition-colors text-foreground"
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/register"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-muted transition-colors text-foreground"
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
              <Link
                to="/cart"
                className="hover:opacity-70 transition-opacity relative text-white"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
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
                      className="text-white hover:opacity-70"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t border-border"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  to="/shop"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  Shop
                </Link>
                {/*
                <Link
                  to="/custom"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  Custom Prints
                </Link>
                */}
                <Link
                  to="/about"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  About
                </Link>
                <Link
                  to="/collections"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  Collections
                </Link>
                <Link
                  to="/sale"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  Sale
                </Link>
                <div className="pt-4 border-t space-y-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="flex items-center gap-3 text-black text-sm tracking-widest uppercase"
                  >
                    <Search size={20} />
                    Search
                  </button>
                  <div className="space-y-3 pl-8">
                    <Link
                      to="/signin"
                      className="block text-sm tracking-wider uppercase text-gray-600 hover:text-black transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block text-sm tracking-wider uppercase text-gray-600 hover:text-black transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t">
                  <Link to="/cart" className="text-black relative">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>


      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_0.9fr_0.9fr_1.2fr] lg:gap-12">
            {/* Brand + SOCIAL MEDIA LINKS */}
            <div className="group space-y-6 sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl tracking-[0.3em] uppercase">clo</h3>
              <div className="space-y-2">
                <p className="max-w-xs text-gray-400 text-sm leading-6">
                  Minimal. Original. Design.
                </p>
                <p className=" flex place-items-centertext-sm uppercase tracking-[0.20em] text-white/0 transition duration-300 group-hover:text-white/75">
                  Extravagant
                </p>
              </div>

              {/* === SOCIAL MEDIA LINKS === */}
              <div className="flex items-center gap-4 pt-4">
                {/* Facebook */}
                <a
                  href=""//facebook.com/yourpage"
                  target="_blank"
                  rel="noopener noreferrer"
                 className="group/social relative w-11 h-11 flex items-center justify-center hover:scale-105 transition-all duration-300"
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
                  className="group/social relative w-11 h-11 flex items-center justify-center hover:scale-105 transition-all duration-300"
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
                  className="group/social relative w-11 h-11 flex items-center justify-center hover:scale-105 transition-all duration-300"
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
            <div className="space-y-4">
              <h4 className="font-medium tracking-widest uppercase text-sm">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/shop" className="inline-flex leading-6 hover:text-white transition-colors tracking-wider">All Products</Link></li>
                {/* Custom Prints removed */}
                <li><Link to="/shop?filter=new" className="inline-flex leading-6 hover:text-white transition-colors tracking-wider">New Arrivals</Link></li>
                <li><Link to="/collections" className="inline-flex leading-6 hover:text-white transition-colors tracking-wider">Collections</Link></li>
                <li><Link to="/sale" className="inline-flex leading-6 hover:text-white transition-colors tracking-wider">Sale</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div className="space-y-4">
              <h4 className="font-medium tracking-widest uppercase text-sm">Help</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link
                    to="/customer-service"
                    className="inline-flex leading-6 hover:text-white transition-colors tracking-wider"
                  >
                    Customer Service
                  </Link>
                </li>
                <li><Link to="/shipping" className="inline-flex leading-6 hover:text-white transition-colors tracking-wider">Shipping & Returns</Link></li>
                <li><Link to="/size-guide" className="inline-flex leading-6 hover:text-white transition-colors tracking-wider">Size Guide</Link></li>
                <li><Link to="/contact" className="inline-flex leading-6 hover:text-white transition-colors tracking-wider">Contact Us</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1 lg:max-w-md">
              <h4 className="font-medium tracking-widest uppercase text-sm">Newsletter</h4>
              <p className="max-w-md text-sm text-gray-400 leading-6">
                Subscribe for exclusive offers and updates
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  type="email"
                  placeholder="Email"
                  className="min-w-0 flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/40 tracking-wider"
                />
                <button className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors text-sm tracking-widest uppercase sm:w-auto">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* === PAYMENT METHODS SECTION === */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Payment Methods */}
              <div className="flex items-center gap-1 flex-wrap justify-center">
                <span className="text-xs uppercase tracking-wider text-white/60 mr-4 hidden sm:block">We accept:</span>

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
              <div className="flex flex-col gap-4 text-center text-sm text-gray-400 md:flex-row md:items-center md:justify-between md:text-left">
                <p>© 2026 clo. All rights reserved.</p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
                  <Link to="/privacy" className="hover:text-white transition-colors tracking-wider">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="hover:text-white transition-colors tracking-wider">
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
