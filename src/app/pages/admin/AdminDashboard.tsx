import { useState, Suspense, lazy, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BarChart3, Users, MessageSquare, Share2, LogOut, Package, Plus, ExternalLink, TicketPercent, Palette, Moon, Sun, History, ArchiveRestore } from "lucide-react";
import {
  appendAdminAuditLog,
  authenticateAdmin,
  createAdminSession,
  getAdminAccounts,
  getAdminSession,
  saveAdminSession,
  clearAdminSession,
  type AdminSession,
} from "../../utils/admin";

// Lazy load admin components for code splitting
const SalesAnalytics = lazy(() => import("./SalesAnalytics").then(module => ({ default: module.SalesAnalytics })));
const OrderManagement = lazy(() => import("./OrderManagement").then(module => ({ default: module.OrderManagement })));
const ClientManagement = lazy(() => import("./ClientManagement").then(module => ({ default: module.ClientManagement })));
const ReviewManagement = lazy(() => import("./ReviewManagement").then(module => ({ default: module.ReviewManagement })));
const SocialIntegration = lazy(() => import("./SocialIntegration").then(module => ({ default: module.SocialIntegration })));
const ProductManagement = lazy(() => import("./ProductManagement").then(module => ({ default: module.ProductManagement })));
const PromoCodeManagement = lazy(() => import("./PromoCodeManagement").then(module => ({ default: module.PromoCodeManagement })));
const CustomDesignManagement = lazy(() => import("./CustomDesignManagement").then(module => ({ default: module.CustomDesignManagement })));
const ActivityLog = lazy(() => import("./ActivityLog").then(module => ({ default: module.ActivityLog })));
const RecycleBin = lazy(() => import("./RecycleBin").then(module => ({ default: module.RecycleBin })));

type AdminTab = 'analytics' | 'orders' | 'clients' | 'reviews' | 'social' | 'products' | 'promocodes' | 'customdesigns' | 'recyclebin' | 'activity';

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
    id: "promocodes",
    label: "Promo Codes",
    icon: TicketPercent,
    component: PromoCodeManagement
  },
  {
    id: "customdesigns",
    label: "Custom Designs",
    icon: Palette,
    component: CustomDesignManagement
  },
  {
    id: "recyclebin",
    label: "Recycle Bin",
    icon: ArchiveRestore,
    component: RecycleBin
  },
  {
    id: "activity",
    label: "Activity Log",
    icon: History,
    component: ActivityLog
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [adminTheme, setAdminTheme] = useState<"light" | "dark">("light");
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already authenticated
    const savedAdminSession = getAdminSession();
    if (savedAdminSession) {
      setIsAuthenticated(true);
      setAdminSession(savedAdminSession);
    }

    const savedAdminTheme = localStorage.getItem("adminTheme");
    if (savedAdminTheme === "dark" || savedAdminTheme === "light") {
      setAdminTheme(savedAdminTheme);
    }
  }, []);

  const toggleAdminTheme = () => {
    const nextTheme = adminTheme === "dark" ? "light" : "dark";
    setAdminTheme(nextTheme);
    localStorage.setItem("adminTheme", nextTheme);
    window.dispatchEvent(
      new CustomEvent("adminThemeUpdated", {
        detail: { theme: nextTheme },
      })
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matchingAdmin = authenticateAdmin(email, password);

    if (matchingAdmin) {
      const nextSession: AdminSession = createAdminSession(matchingAdmin);
      setIsAuthenticated(true);
      setAdminSession(nextSession);
      saveAdminSession(nextSession);
      appendAdminAuditLog({
        adminId: nextSession.id,
        adminName: nextSession.name,
        adminEmail: nextSession.email,
        branch: nextSession.branch,
        action: "logged in",
        entityType: "admin-session",
        entityName: nextSession.email,
        details: `Signed into the ${nextSession.branch} dashboard.`,
      });
      setEmail("");
      setPassword("");
    } else {
      alert("Incorrect admin email or password");
    }
  };

  const handleLogout = () => {
    if (adminSession) {
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: "logged out",
        entityType: "admin-session",
        entityName: adminSession.email,
        details: `Signed out of the ${adminSession.branch} dashboard.`,
      });
    }
    setIsAuthenticated(false);
    setAdminSession(null);
    clearAdminSession();
  };

  const handleViewSite = () => {
    navigate('/');
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black dark:border-white"></div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className={`admin-login admin-${adminTheme} flex min-h-screen items-center justify-center px-4 ${adminTheme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md rounded-lg p-8 shadow-lg transition-colors duration-300 ${adminTheme === "dark" ? "border border-white/10 bg-neutral-950 text-white" : "bg-white text-black"}`}
        >
          <h1 className="text-2xl font-bold text-center mb-6 tracking-widest uppercase">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border px-4 py-2 tracking-wider focus:outline-none ${adminTheme === "dark" ? "border-white/20 bg-neutral-900 text-white focus:border-white" : "border-gray-300 focus:border-black"}`}
                placeholder="Enter admin email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border px-4 py-2 tracking-wider focus:outline-none ${adminTheme === "dark" ? "border-white/20 bg-neutral-900 text-white focus:border-white" : "border-gray-300 focus:border-black"}`}
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
              className={`w-full py-3 text-sm uppercase tracking-wider transition-colors ${adminTheme === "dark" ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-gray-800"}`}
            >
              Access Admin Panel
            </button>
          </form>
          <p className={`mt-4 text-center text-xs ${adminTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Demo accounts are available for head office and branch managers.
          </p>
          <div className={`mt-3 space-y-1 text-center text-xs ${adminTheme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
            {getAdminAccounts().map((account) => (
              <p key={account.id}>
                {account.branch}: {account.email} / {account.password}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const ActiveComponent = adminTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className={`admin-dashboard admin-${adminTheme} min-h-screen transition-colors duration-300 ${adminTheme === "dark" ? "bg-black text-white" : "bg-gray-50 text-black"}`}>
      {/* Header */}
      <div className="w-full border-b border-gray-200 bg-white shadow-sm transition-colors duration-300">
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
                        ? "border-b-2 border-black text-black dark:border-white dark:text-white"
                        : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="ml-4 flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleAdminTheme}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium uppercase tracking-wider text-gray-600 transition-colors hover:text-black"
              >
                {adminTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <span className="hidden sm:inline">
                  {adminTheme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
              <button
                onClick={handleViewSite}
                className="hidden items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider text-gray-600 transition-colors hover:text-black sm:flex"
              >
                <ExternalLink size={16} />
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider text-gray-600 transition-colors hover:text-black"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="w-full border-b border-gray-200 bg-white transition-colors duration-300 md:hidden">
        <div className="px-4 py-3">
          <div className="mb-3 flex flex-wrap justify-center gap-3">
            <button
              onClick={toggleAdminTheme}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider text-gray-600 transition-colors hover:text-black"
            >
              {adminTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {adminTheme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleViewSite}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider text-gray-600 transition-colors hover:text-black"
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
                      ? "border-b-2 border-black text-black dark:border-white dark:text-white"
                      : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
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
        <div className="mb-6 w-full">
          <div className="rounded-lg border border-black/10 bg-white p-4 transition-colors duration-300 dark:border-white/10 dark:bg-neutral-950">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-wider uppercase">
                  Active Admin Access
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  This dashboard is currently using the admin account shown below.
                </p>
              </div>
              <div className="grid gap-2 text-sm sm:text-right">
                <p className="tracking-wider">
                  <span className="font-semibold">Name:</span>{" "}
                  {adminSession?.name ?? DEMO_ADMIN_ACCOUNT.name}
                </p>
                <p className="tracking-wider text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-black dark:text-white">Email:</span>{" "}
                  {adminSession?.email ?? DEMO_ADMIN_ACCOUNT.email}
                </p>
                <p className="tracking-wider text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-black dark:text-white">Role:</span>{" "}
                  {adminSession?.role ?? "Administrator"}
                </p>
                <p className="tracking-wider text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-black dark:text-white">Branch:</span>{" "}
                  {adminSession?.branch ?? "Head Office"}
                </p>
              </div>
            </div>
          </div>
        </div>

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
