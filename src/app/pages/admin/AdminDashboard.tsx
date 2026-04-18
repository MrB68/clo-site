import { useState, Suspense, lazy, useEffect, useRef, useCallback } from "react";
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
import { Bell } from "lucide-react";

import { supabase } from "../../../lib/supabase";

import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { getToken } from "firebase/messaging";
import { initMessaging } from "../../../lib/firebase";

// --- AUDIO UNLOCK AND REUSE ---
let audioUnlocked = false;

if (typeof window !== "undefined") {
  const unlockHandler = () => {
    if (!audioUnlocked) {
      const unlockAudio = new Audio("/notification.wav");
      unlockAudio.volume = 0.01;

      unlockAudio.play()
        .then(() => {
          unlockAudio.pause();
          unlockAudio.currentTime = 0;

          audioUnlocked = true;
          (window as any).audioUnlocked = true;
          // 🔥 ensure future checks see updated value
          setTimeout(() => {
            (window as any).audioUnlocked = true;
          }, 0);
        })
        .catch(() => {});
    }
  };

  window.addEventListener("click", unlockHandler, { once: true });
  window.addEventListener("keydown", unlockHandler, { once: true });
}

// expose unlock state properly (do NOT overwrite to false)
if (typeof window !== "undefined") {
  if ((window as any).audioUnlocked === undefined) {
    (window as any).audioUnlocked = false;
  }
}

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

  const [sectionNotifications, setSectionNotifications] = useState({
    orders: 0,
    reviews: 0,
    products: 0,
    promocodes: 0,
    activity: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_sound_enabled");
      return saved === null ? true : saved === "true";
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("admin_sound_enabled", String(soundEnabled));
  }, [soundEnabled]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Array<{id:string, customer:string, amount:number, time:number}>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_notifications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const processedOrdersRef = useRef(new Set<string>());

  // --- CROSS-TAB NOTIFICATION BROADCAST CHANNEL ---
  const channelRef = useRef<BroadcastChannel | null>(null);

  // --- NOTIFICATION QUEUE ---
  const queueRef = useRef<any[]>([]);
  const processingRef = useRef(false);

  const processQueue = () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    processingRef.current = true;
    const item = queueRef.current.shift();
    if (item) {
      handler({ detail: item });
    }
    setTimeout(() => {
      processingRef.current = false;
      processQueue();
    }, 300);
  };

  // --- TAB VISIBILITY STATE ---
  const isTabActiveRef = useRef(true);
  // --- BROADCAST CHANNEL SETUP ---
  useEffect(() => {
    channelRef.current = new BroadcastChannel("admin_notifications");
    channelRef.current.onmessage = (event) => {
      if (event.data?.type === "NEW_ORDER") {
        window.dispatchEvent(new CustomEvent("newOrder", { detail: event.data.payload }));
      }
    };
    return () => {
      channelRef.current?.close();
    };
  }, []);

  // --- TAB VISIBILITY LISTENER ---
  useEffect(() => {
    const handleVisibility = () => {
      isTabActiveRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);

  // --- RELATIVE TIME HELPER ---
  const timeAgo = useCallback((ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  }, []);

  useEffect(() => {
    // Check if admin is already authenticated
    const savedAdminSession = getAdminSession();
    if (savedAdminSession) {
      setAdminSession(savedAdminSession);
      setIsAuthenticated(true);
    }
  }, []);

  // Force dark mode at root level so Vercel matches local
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // ⚠️ IMPORTANT: Make sure you have a file in /public/firebase-messaging-sw.js
  // otherwise push notifications will fail
  // 🔔 Firebase Push Notification Setup
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          // Removed debug log
          return;
        }

        const messagingInstance = await initMessaging();

        if (!messagingInstance) {
          // Removed debug log
          return;
        }

        if (!("serviceWorker" in navigator)) {
          // Removed debug log
          return;
        }

        // ⚠️ IMPORTANT: Use Firebase Web Push Certificate Key (VAPID)
        // Do NOT use Server Key or any random string
        const token = await getToken(messagingInstance, {
          vapidKey: "BODpALFDlbc0JLm5gEbwhnyp643mFV9tfrM4vLi5bvwwgweDlTMejP2aYiaIjdxrhVF-SXXHHyuMkO8vk-Nan2E",
        });

        // Removed debug log

        if (token) {
          await supabase.from("admin_devices").upsert({
            token,
          });
        }
      } catch (err) {
        // Keep error logging for actual errors
        console.error("Notification setup error:", err);
      }
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Removed debug log

    let orderBuffer = 0;
    let productBuffer = 0;

    const channel = supabase
      .channel("admin-realtime")

      // 🛒 Orders (INSERT → trigger notification)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new;
          if (!order) return;
          // 🔥 Trigger global notification event
          window.dispatchEvent(
            new CustomEvent("newOrder", {
              detail: {
                id: order.order_code ?? order.id,
                customer:
                  order.customer_name ||
                  order.customer_email ||
                  "Customer",
                amount: Number(order.total ?? 0),
              },
            })
          );
          // --- BROADCAST TO OTHER TABS ---
          channelRef.current?.postMessage({
            type: "NEW_ORDER",
            payload: {
              id: order.order_code ?? order.id,
              customer:
                order.customer_name ||
                order.customer_email ||
                "Customer",
              amount: Number(order.total ?? 0),
            },
          });
          orderBuffer++;
        }
      )

      // 📦 Products (INSERT only)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        () => {
          productBuffer++;
        }
      )

      .subscribe();

    // 🔥 Batch updates every 1s (reduces re-renders)
    const interval = setInterval(() => {
      if (orderBuffer > 0 || productBuffer > 0) {
        setSectionNotifications((prev) => ({
          ...prev,
          orders: prev.orders + orderBuffer,
          products: prev.products + productBuffer,
        }));

        orderBuffer = 0;
        productBuffer = 0;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // --- GLOBAL ORDER LISTENER (REAL DATA FROM DB) ---
  const lastSoundRef = useRef(0);
  // Memoize handler so it's stable
  const handler = useCallback((e: any) => {
    const { id, customer, amount } = e.detail;

    // --- DEDUPLICATION: Only process each order once ---
    if (processedOrdersRef.current.has(id)) return;
    processedOrdersRef.current.add(id);
    setTimeout(() => {
      processedOrdersRef.current.delete(id);
    }, 10000);

    // 🔥 Add to recent orders (keep last 10)
    setRecentOrders(prev => {
      const updated = [{
        id,
        customer,
        amount,
        time: Date.now()
      }, ...prev].slice(0, 10);
      localStorage.setItem("admin_notifications", JSON.stringify(updated));
      return updated;
    });

    // 🔥 Update unread notifications counter
    setUnreadCount(prev => prev + 1);

    // 🔥 Update analytics
    setAnalytics(prev => ({
      totalOrders: prev.totalOrders + 1,
      totalRevenue: prev.totalRevenue + amount,
    }));

    // 🔔 Sound (throttled) — ALWAYS try sound even if tab inactive
    const now = Date.now();
    if (now - lastSoundRef.current > 1000) {
      lastSoundRef.current = now;

      if (soundEnabled) {
        try {
          const audio = new Audio("/notification.wav");
          audio.volume = 1;
          audio.preload = "auto";

          const play = () => audio.play().catch(() => {});

          // try immediate play
          play();

          // 🔥 robust fallback: force unlock + replay
          if (!(window as any).audioUnlocked) {
            const unlock = new Audio("/notification.wav");
            unlock.volume = 0.01;

            unlock.play()
              .then(() => {
                (window as any).audioUnlocked = true;
                setTimeout(play, 10);
              })
              .catch(() => {});
          }
        } catch (err) {
          console.error("Sound error:", err);
        }
      }
    }

    // Skip only toast if tab inactive
    if (!isTabActiveRef.current) return;

    // 🔥 PREMIUM INTERACTIVE TOAST
    toast.custom((t) => (
      <div className="bg-[#111111] text-white px-4 py-3 rounded-xl shadow-lg border border-white/10 flex items-center justify-between gap-4 min-w-[260px]">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">New Order</span>
          <span className="text-xs text-gray-400">
            {customer} • Rs {amount}
          </span>
        </div>
        <button
          onClick={() => {
            setActiveTab("orders");
            toast.dismiss(t.id);
          }}
          className="text-xs px-3 py-1 bg-white text-black rounded-md hover:bg-gray-200 transition"
        >
          View
        </button>
      </div>
    ), {
      duration: 8000,
    });
  }, [soundEnabled, setActiveTab]);

  // --- QUEUED EVENT LISTENER ---
  useEffect(() => {
    const listener = (e: any) => {
      queueRef.current.push(e.detail);
      processQueue();
    };
    window.addEventListener("newOrder", listener);
    return () => {
      window.removeEventListener("newOrder", listener);
    };
  }, [processQueue]);

  // Manual fallback fetch for orders count if realtime is delayed
  useEffect(() => {
    const fetchOrdersCount = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id", { count: "estimated", head: true });

      if (data) {
        setSectionNotifications((prev) => ({
          ...prev,
          orders: prev.orders, // keeps realtime value stable
        }));
      }
    };

    const interval = setInterval(fetchOrdersCount, 20000);
    return () => clearInterval(interval);
  }, []);

  // --- BACKGROUND SYNC FOR ANALYTICS ---
  useEffect(() => {
    let interval: any;

    const fetchAnalytics = async () => {
      const { data } = await supabase
        .from("orders")
        .select("total");

      if (data) {
        const totalRevenue = data.reduce(
          (sum, o) => sum + (o.total || 0),
          0
        );

        setAnalytics({
          totalOrders: data.length,
          totalRevenue,
        });
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchAnalytics();
        interval = setInterval(fetchAnalytics, 30000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    fetchAnalytics();
    interval = setInterval(fetchAnalytics, 30000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // --- DEBUG LOG FOR ANALYTICS ---
  // Removed debug analytics useEffect


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
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
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Profile fetch error:", profileError);
        alert("Profile not found or not linked correctly");
        return;
      }

      if (profile.role !== "admin") {
        alert("Access denied: not an admin");
        return;
      }

      const sessionData: AdminSession = {
        id: data.user.id,
        name: profile.full_name,
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

  // Memoized slices for notification panel
  const recent = recentOrders.slice(0, 5);
  const earlier = recentOrders.slice(5);

  return (
    <div className="admin-dashboard admin-dark min-h-screen w-full overflow-x-hidden transition-colors duration-300 bg-black text-gray-200">
      <Toaster position="top-right" toastOptions={{ duration: 8000 }} containerStyle={{ zIndex: 9999 }} />
      {/* Header */}
      <div className="w-full border-b shadow-sm transition-colors duration-300 border-white/10 bg-black text-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LEFT: Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <h1 className="text-lg md:text-xl font-bold tracking-widest uppercase whitespace-nowrap">
                CLO <span className="text-gray-400">Admin</span>
              </h1>
            </div>

            {/* CENTER: NAV */}
            <div className="hidden lg:flex flex-1 justify-center">
              <nav className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-2 py-2">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSectionNotifications((prev) => ({
                          ...prev,
                          orders: tab.id === "orders" ? 0 : prev.orders,
                          reviews: tab.id === "reviews" ? 0 : prev.reviews,
                          products: tab.id === "products" ? 0 : prev.products,
                          promocodes: tab.id === "promocodes" ? 0 : prev.promocodes,
                          activity: tab.id === "activity" ? 0 : prev.activity,
                        }));
                      }}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase rounded-lg transition ${
                        activeTab === tab.id
                          ? "bg-white text-black"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="flex items-center gap-2">

              {/* 🔔 Notifications */}
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
                className="relative w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl hover:bg-white/10 transition"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* 🌐 View Site */}
              <button
                onClick={handleViewSite}
                className="hidden md:flex items-center gap-1 px-3 py-2 text-xs uppercase border border-white/10 rounded-lg hover:bg-white/10 transition"
              >
                <ExternalLink size={14} />
                View
              </button>

              {/* 🚪 Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold uppercase bg-white text-black rounded-xl hover:bg-gray-200 transition"
              >
                <LogOut size={14} />
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
          <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSectionNotifications((prev) => ({
                      ...prev,
                      orders: tab.id === "orders" ? 0 : prev.orders,
                      reviews: tab.id === "reviews" ? 0 : prev.reviews,
                      products: tab.id === "products" ? 0 : prev.products,
                      promocodes: tab.id === "promocodes" ? 0 : prev.promocodes,
                      activity: tab.id === "activity" ? 0 : prev.activity,
                    }));
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium tracking-wider uppercase whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-white text-white font-semibold"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  <div className="relative flex items-center gap-2">
                    <Icon size={16} />
                    {tab.label}

                    {tab.id === "orders" && sectionNotifications.orders > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full">
                        {sectionNotifications.orders > 9 ? "9+" : sectionNotifications.orders}
                      </span>
                    )}

                    {tab.id === "reviews" && sectionNotifications.reviews > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full">
                        {sectionNotifications.reviews > 9 ? "9+" : sectionNotifications.reviews}
                      </span>
                    )}

                    {tab.id === "products" && sectionNotifications.products > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full">
                        {sectionNotifications.products > 9 ? "9+" : sectionNotifications.products}
                      </span>
                    )}

                    {tab.id === "promocodes" && sectionNotifications.promocodes > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full">
                        {sectionNotifications.promocodes > 9 ? "9+" : sectionNotifications.promocodes}
                      </span>
                    )}

                    {tab.id === "activity" && sectionNotifications.activity > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full">
                        {sectionNotifications.activity > 9 ? "9+" : sectionNotifications.activity}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-6 top-20 w-80 bg-black border border-white/10 rounded-xl shadow-xl z-50">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <div>
              <h3 className="text-sm uppercase tracking-wider">Notifications</h3>
              <p className="text-[10px] text-gray-500">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Sound</span>
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className={`relative w-12 h-6 flex items-center rounded-full transition ${soundEnabled ? "bg-green-500" : "bg-zinc-700"}`}
              >
                <span
                  className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition ${soundEnabled ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <button
                onClick={() => {
                  if (confirm("Clear all notifications?")) {
                    setRecentOrders([]);
                    localStorage.removeItem("admin_notifications");
                  }
                }}
                className="text-xs px-2 py-1 border border-white/10 rounded hover:bg-white/10"
              >
                Clear
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {recentOrders.length > 0 ? (
              <>
                <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Recent</div>
                {recent.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      setActiveTab("orders");
                      setShowNotifications(false);
                      window.dispatchEvent(new CustomEvent("focusOrder", { detail: order.id }));
                    }}
                    className="px-4 py-3 text-sm flex items-start gap-3 cursor-pointer hover:bg-white/5 transition"
                  >
                    {/* unread dot */}
                    <span className="mt-1 w-2 h-2 rounded-full bg-red-500" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">Order #{order.id}</p>
                        <span className="text-[10px] text-gray-500 shrink-0">{timeAgo(order.time)}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{order.customer} • Rs {order.amount}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab("orders");
                            setShowNotifications(false);
                            window.dispatchEvent(new CustomEvent("focusOrder", { detail: order.id }));
                          }}
                          className="text-[10px] px-2 py-1 border border-white/10 rounded hover:bg-white/10"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecentOrders(prev => {
                              const updated = prev.filter(o => o.id !== order.id);
                              localStorage.setItem("admin_notifications", JSON.stringify(updated));
                              return updated;
                            });
                          }}
                          className="text-[10px] px-2 py-1 border border-white/10 rounded hover:bg-white/10"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {earlier.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Earlier</div>
                    {earlier.map(order => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          setActiveTab("orders");
                          setShowNotifications(false);
                          window.dispatchEvent(new CustomEvent("focusOrder", { detail: order.id }));
                        }}
                        className="px-4 py-3 text-sm flex items-start gap-3 cursor-pointer hover:bg-white/5 transition"
                      >
                        {/* unread dot */}
                        <span className="mt-1 w-2 h-2 rounded-full bg-red-500" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">Order #{order.id}</p>
                            <span className="text-[10px] text-gray-500 shrink-0">{timeAgo(order.time)}</span>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{order.customer} • Rs {order.amount}</p>

                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab("orders");
                                setShowNotifications(false);
                                window.dispatchEvent(new CustomEvent("focusOrder", { detail: order.id }));
                              }}
                              className="text-[10px] px-2 py-1 border border-white/10 rounded hover:bg-white/10"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecentOrders(prev => {
                                  const updated = prev.filter(o => o.id !== order.id);
                                  localStorage.setItem("admin_notifications", JSON.stringify(updated));
                                  return updated;
                                });
                              }}
                              className="text-[10px] px-2 py-1 border border-white/10 rounded hover:bg-white/10"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">🔔</div>
                <p>No notifications</p>
                <p className="text-[10px] text-gray-600">You're all caught up</p>
              </div>
            )}
          </div>
        </div>
      )}
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