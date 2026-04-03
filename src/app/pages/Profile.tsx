import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { User, Mail, Calendar, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Profile() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full text-center"
        >
          <h1 className="text-2xl font-bold mb-4 tracking-widest uppercase">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6 tracking-wider">
            Please sign in to view your profile.
          </p>
          <Link
            to="/signin"
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSignOut = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      signOut();
    }, 500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm tracking-wider uppercase">Back to Shop</span>
          </Link>
          <h1 className="text-2xl tracking-widest uppercase">My Profile</h1>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-sm text-gray-300 hover:text-white transition-colors tracking-wider uppercase disabled:opacity-50"
          >
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 tracking-widest uppercase">
                Account Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium tracking-wider">{user.name}</h3>
                    <p className="text-sm text-gray-500 tracking-wider uppercase">
                      Member since {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <User size={16} className="text-gray-400" />
                      <span className="tracking-wider">{user.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <Mail size={16} className="text-gray-400" />
                      <span className="tracking-wider">{user.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Member Since
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="tracking-wider">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Account Status
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="tracking-wider text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 tracking-widest uppercase">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors tracking-wider uppercase text-sm"
                >
                  View Orders
                </Link>
                <Link
                  to="/shop"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors tracking-wider uppercase text-sm"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 transition-colors tracking-wider uppercase text-sm disabled:opacity-50"
                >
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 tracking-widest uppercase">
                Account Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 tracking-wider uppercase">
                    Total Orders
                  </span>
                  <span className="font-medium tracking-wider">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 tracking-wider uppercase">
                    Wishlist Items
                  </span>
                  <span className="font-medium tracking-wider">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 tracking-wider uppercase">
                    Reviews Written
                  </span>
                  <span className="font-medium tracking-wider">0</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}