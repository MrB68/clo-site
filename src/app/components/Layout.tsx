import { Outlet, Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Search, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const { user, signOut, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHomePage
            ? "bg-white shadow-sm"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="text-2xl tracking-[0.3em] uppercase">
              clo
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/shop"
                className={`hover:opacity-70 transition-opacity tracking-widest uppercase text-sm ${
                  scrolled || !isHomePage ? "text-black" : "text-white"
                }`}
              >
                Shop
              </Link>
              <Link
                to="/custom"
                className={`hover:opacity-70 transition-opacity tracking-widest uppercase text-sm ${
                  scrolled || !isHomePage ? "text-black" : "text-white"
                }`}
              >
                Custom
              </Link>
              <Link
                to="/about"
                className={`hover:opacity-70 transition-opacity tracking-widest uppercase text-sm ${
                  scrolled || !isHomePage ? "text-black" : "text-white"
                }`}
              >
                About
              </Link>
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`hover:opacity-70 transition-opacity ${
                  scrolled || !isHomePage ? "text-black" : "text-white"
                }`}
              >
                <Search size={20} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`hover:opacity-70 transition-opacity ${
                    scrolled || !isHomePage ? "text-black" : "text-white"
                  }`}
                >
                  <User size={20} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-4 w-48 bg-white border border-gray-200 shadow-lg"
                    >
                      <div className="py-2">
                        {isAuthenticated ? (
                          <>
                            <div className="px-6 py-3 border-b border-gray-200">
                              <p className="text-sm font-medium tracking-wider text-black">
                                {user?.name}
                              </p>
                              <p className="text-xs text-gray-500 tracking-wider">
                                {user?.email}
                              </p>
                            </div>
                            <Link
                              to="/orders"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-50 transition-colors text-black"
                            >
                              Orders
                            </Link>
                            <Link
                              to="/profile"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-50 transition-colors text-black"
                            >
                              Profile
                            </Link>
                            <div className="border-t border-gray-200 my-2"></div>
                            <button
                              onClick={() => {
                                signOut();
                                setUserMenuOpen(false);
                              }}
                              className="w-full text-left px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-50 transition-colors text-red-600 flex items-center gap-2"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/signin"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-50 transition-colors text-black"
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/register"
                              className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-50 transition-colors text-black"
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
                className={`hover:opacity-70 transition-opacity ${
                  scrolled || !isHomePage ? "text-black" : "text-white"
                }`}
              >
                <ShoppingCart size={20} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden ${
                scrolled || !isHomePage ? "text-black" : "text-white"
              }`}
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
              className="bg-white border-t border-gray-200"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="SEARCH PRODUCTS..."
                    autoFocus
                    className="flex-1 bg-transparent border-b-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-black transition-colors uppercase tracking-widest text-sm placeholder:text-gray-400"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-black hover:opacity-70"
                  >
                    <X size={20} />
                  </button>
                </div>
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
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  to="/shop"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  Shop
                </Link>
                <Link
                  to="/custom"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  Custom Prints
                </Link>
                <Link
                  to="/about"
                  className="block text-black hover:opacity-70 transition-opacity tracking-widest uppercase text-sm"
                >
                  About
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
                  <Link to="/cart" className="text-black">
                    <ShoppingCart size={20} />
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

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-xl tracking-[0.3em] uppercase">clo</h3>
              <p className="text-gray-400 text-sm">
                Minimal. Original. Design.
              </p>
            </div>

            {/* Shop */}
            <div className="space-y-4">
              <h4 className="font-medium tracking-widest uppercase text-sm">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors tracking-wider">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/custom" className="hover:text-white transition-colors tracking-wider">
                    Custom Prints
                  </Link>
                </li>
                <li>
                  <Link to="/shop?filter=new" className="hover:text-white transition-colors tracking-wider">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors tracking-wider">
                    Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div className="space-y-4">
              <h4 className="font-medium tracking-widest uppercase text-sm">Help</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors tracking-wider">
                    Customer Service
                  </a>
                </li>
                <li>
                  <Link to="/shipping" className="hover:text-white transition-colors tracking-wider">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link to="/size-guide" className="hover:text-white transition-colors tracking-wider">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors tracking-wider">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="font-medium tracking-widest uppercase text-sm">Newsletter</h4>
              <p className="text-sm text-gray-400">
                Subscribe for exclusive offers and updates
              </p>
              <div className="flex gap-px">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 bg-white/10 border border-white/20 px-4 py-2 text-sm focus:outline-none focus:border-white/40 tracking-wider"
                />
                <button className="px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-sm tracking-widest uppercase">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2026 clo. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors tracking-wider">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors tracking-wider">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
