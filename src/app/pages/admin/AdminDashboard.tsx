import { useState, Suspense, lazy, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BarChart3, Users, MessageSquare, Share2, LogOut, Package, Plus, ExternalLink, TicketPercent, Palette, Moon, Sun, History, ArchiveRestore } from "lucide-react";
import {
  appendAdminAuditLog,
  getAdminSession,
  saveAdminSession,
  clearAdminSession,
  type AdminSession,
} from "../../utils/admin";

import { supabase } from "../../../lib/supabase";

import toast from "react-hot-toast";

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
  component: React.LazyExoticComponent<React.ComponentType<any>>;
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
  /*
    id: "clients",
    label: "Client Management",
    icon: Users,
    component: ClientManagement
  },*/ /*Client management is currently on hold, can be re-enabled when needed*/
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
  /*{
    id: "customdesigns",
    label: "Custom Designs",
    icon: Palette,
    component: CustomDesignManagement
  },*/// Custom designs are currently on hold, can be re-enabled when needed
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
  const adminTheme = "dark";
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already authenticated
    const savedAdminSession = getAdminSession();
    if (savedAdminSession) {
      setAdminSession(savedAdminSession);
      setIsAuthenticated(true);
    }
  }, []);


  useEffect(() => {
    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          // 🔊 Play sound
          const audio = new Audio("/notification.wav");
          audio.play().catch(() => {});

          // 💬 Custom CLO toast
          toast.custom((t) => (
            <div className="bg-black text-white px-5 py-3 rounded-xl shadow-xl border border-white/10 tracking-wider uppercase">
              🛒 New Order Received
            </div>
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        alert("Invalid email or password");
        return;
      }

      if (!data.user.email_confirmed_at) {
        alert("Please verify your email before logging in.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        alert("Profile not found");
        return;
      }

      if (profile.role !== "admin") {
        alert("Access denied: not an admin");
        return;
      }

      const sessionData: AdminSession = {
        id: data.user.id,
        name: profile.name,
        email: data.user.email || "",
        role: profile.role,
        branch: "Main",
        lastLoginAt: new Date().toISOString(),
      };

      saveAdminSession(sessionData);
      setAdminSession(sessionData);
      setIsAuthenticated(true);

      setEmail("");
      setPassword("");

      appendAdminAuditLog({
        adminId: sessionData.id,
        adminName: sessionData.name,
        adminEmail: sessionData.email,
        branch: sessionData.branch,
        action: "logged in",
        entityType: "admin-session",
        entityName: sessionData.email,
        details: "Admin logged into dashboard",
      });

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

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
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="admin-login admin-dark flex min-h-screen items-center justify-center px-4 bg-black text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-lg p-8 shadow-lg transition-colors duration-300 border border-white/10 bg-neutral-950 text-white"
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
                className="w-full border px-4 py-2 tracking-wider focus:outline-none border-white/20 bg-neutral-900 text-white focus:border-white"
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
                  className="w-full border px-4 py-2 tracking-wider focus:outline-none border-white/20 bg-neutral-900 text-white focus:border-white"
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
              className="w-full py-3 text-sm uppercase tracking-wider transition-colors bg-white text-black hover:bg-neutral-200"
            >
              Access Admin Panel
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const ActiveComponent = adminTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-dashboard admin-dark min-h-screen transition-colors duration-300 bg-neutral-950 text-gray-200">
      {/* Header */}
      <div className="w-full border-b shadow-sm transition-colors duration-300 border-white/10 bg-black text-gray-200">
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
                        ? "border-b-2 border-white text-white font-semibold"
                        : "text-gray-500 hover:text-white"
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
                onClick={handleViewSite}
                className="hidden items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors sm:flex text-gray-500 hover:text-white"
              >
                <ExternalLink size={16} />
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors text-gray-500 hover:text-white"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="w-full border-b transition-colors duration-300 md:hidden border-white/10 bg-neutral-950 text-white">
        <div className="px-4 py-3">
          <div className="mb-3 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleViewSite}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors text-gray-500 hover:text-white"
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
                      ? "border-b-2 border-white text-white font-semibold"
                      : "text-gray-500 hover:text-white"
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
          <div className="rounded-lg border p-4 transition-colors duration-300 border-zinc-800 bg-black">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-wider uppercase">
                  Active Admin Access
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This dashboard is currently using the admin account shown below.
                </p>
              </div>
              <div className="grid gap-2 text-sm sm:text-right">
                <p className="tracking-wider">
                  <span className="font-semibold">Name:</span>{" "}
                  {adminSession?.name ?? "Unknown Admin"}
                </p>
                <p className="tracking-wider text-gray-500">
                  <span className="font-semibold text-white">Email:</span>{" "}
                  {adminSession?.email ?? "No email"}
                </p>
                <p className="tracking-wider text-gray-500">
                  <span className="font-semibold text-white">Role:</span>{" "}
                  {adminSession?.role ?? "Administrator"}
                </p>
                <p className="tracking-wider text-gray-500">
                  <span className="font-semibold text-white">Branch:</span>{" "}
                  {adminSession?.branch ?? "Head Office"}
                </p>
              </div>
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
