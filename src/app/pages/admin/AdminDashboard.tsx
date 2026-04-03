import { useState, Suspense, lazy, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BarChart3, Users, MessageSquare, Share2, LogOut, Package, Plus, ExternalLink } from "lucide-react";

// Lazy load admin components for code splitting
const SalesAnalytics = lazy(() => import("./SalesAnalytics").then(module => ({ default: module.SalesAnalytics })));
const OrderManagement = lazy(() => import("./OrderManagement").then(module => ({ default: module.OrderManagement })));
const ClientManagement = lazy(() => import("./ClientManagement").then(module => ({ default: module.ClientManagement })));
const ReviewManagement = lazy(() => import("./ReviewManagement").then(module => ({ default: module.ReviewManagement })));
const SocialIntegration = lazy(() => import("./SocialIntegration").then(module => ({ default: module.SocialIntegration })));
const ProductManagement = lazy(() => import("./ProductManagement").then(module => ({ default: module.ProductManagement })));

type AdminTab = 'analytics' | 'orders' | 'clients' | 'reviews' | 'social' | 'products';

interface AdminTabItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  component: React.LazyExoticComponent<React.ComponentType>;
}

const adminTabs: AdminTabItem[] = [
  {
    id: "analytics",
    label: "Sales Analytics",
    icon: BarChart3,
    component: SalesAnalytics
  },
  {
    id: "orders",
    label: "Order Management",
    icon: Package,
    component: OrderManagement
  },
  {
    id: "products",
    label: "Product Management",
    icon: Plus,
    component: ProductManagement
  },
  {
    id: "clients",
    label: "Client Management",
    icon: Users,
    component: ClientManagement
  },
  {
    id: "reviews",
    label: "Review Management",
    icon: MessageSquare,
    component: ReviewManagement
  },
  {
    id: "social",
    label: "Social Integration",
    icon: Share2,
    component: SocialIntegration
  }
];

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      setPassword("");
    } else {
      alert("Incorrect admin password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
  };

  const handleViewSite = () => {
    navigate('/');
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full"
        >
          <h1 className="text-2xl font-bold text-center mb-6 tracking-widest uppercase">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors tracking-wider uppercase text-sm"
            >
              Access Admin Panel
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">
            Demo password: admin123
          </p>
        </motion.div>
      </div>
    );
  }

  const ActiveComponent = adminTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Centered CLO Admin Title */}
          <div className="flex justify-center items-center h-16 mb-2">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-center">CLO Admin</h1>
          </div>

          {/* Navigation and Actions Row */}
          <div className="flex justify-between items-center pb-3">
            <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium tracking-wider uppercase transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-black border-b-2 border-black"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4 ml-4">
              <button
                onClick={handleViewSite}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wider uppercase text-gray-600 hover:text-black transition-colors"
              >
                <ExternalLink size={16} />
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wider uppercase text-gray-600 hover:text-black transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 w-full">
        <div className="px-4 py-3">
          <div className="flex justify-center mb-3">
            <button
              onClick={handleViewSite}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wider uppercase text-gray-600 hover:text-black transition-colors"
            >
              <ExternalLink size={16} />
              View Site
            </button>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium tracking-wider uppercase whitespace-nowrap transition-colors shrink-0 ${
                    activeTab === tab.id
                      ? "text-black border-b-2 border-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* View Site Section */}
        <div className="mb-6 w-full">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">Preview Your Changes</h3>
                <p className="text-blue-700 text-sm mt-1">
                  View the live website to see how your product updates, pricing changes, and other modifications appear to customers.
                </p>
              </div>
              <button
                onClick={handleViewSite}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <ExternalLink size={16} />
                View Live Site
              </button>
            </div>
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}