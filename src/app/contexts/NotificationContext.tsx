import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

// 🔇 Disabled here — sound handled globally in AdminDashboard
const playNotificationSound = () => {};

const STORAGE_KEY = "clo_notifications_cache";

const saveToCache = (data: Notification[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

const loadFromCache = (): Notification[] => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  meta?: {
    order_id?: string;
    order_code?: string;
    total?: number;
    status?: string;
    link?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  prependNotification: (n: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const mergeUnique = (incoming: Notification[], current: Notification[]) => {
  const map = new Map<string, Notification>();
  [...incoming, ...current].forEach((n) => {
    map.set(n.id, n);
  });
  // sort newest first
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromCache());

  useEffect(() => {
    saveToCache(notifications);
  }, [notifications]);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const activeChannelRef = useRef<any>(null);

  const hasLoadedRef = useRef(false);
  const lastCountRef = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("notifications_channel");

      channelRef.current.onmessage = (event) => {
        const incoming = event.data as Notification[];
        setNotifications((prev) => mergeUnique(incoming, prev));
      };
    }

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  // 🔥 Fetch notifications on login
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !data) {
        return;
      }

      setNotifications((prev) => {
        const updated = mergeUnique(data as Notification[], prev);
        channelRef.current?.postMessage(data);
        return updated;
      });

      const currentCount = data ? data.length : 0;

      // 🔇 skip first load, only play when NEW notifications arrive
      if (hasLoadedRef.current && currentCount > lastCountRef.current) {
        playNotificationSound();
      }

      lastCountRef.current = currentCount;
      hasLoadedRef.current = true;
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000); // fallback sync every 15s
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    if (activeChannelRef.current) {
      supabase.removeChannel(activeChannelRef.current);
    }

    const channel = supabase
      .channel("notifications_ctx")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const incoming = payload.new as Notification;

          setNotifications((prev) => {
            const updated = mergeUnique([incoming], prev);
            channelRef.current?.postMessage([incoming]);
            return updated;
          });

          const meta = incoming.meta || {};
          const link = meta.link || (meta.order_id ? `/orders/${meta.order_id}` : undefined);

          toast.custom((t) => (
            <div className="bg-black text-white p-4 rounded-xl border border-white/10 w-[320px]">
              <p className="text-sm font-semibold">{incoming.title}</p>

              {incoming.message && (
                <p className="text-xs text-gray-400 mt-1">{incoming.message}</p>
              )}

              {(meta.order_code || meta.total || meta.status) && (
                <div className="mt-2 text-[11px] text-gray-500 flex gap-2 flex-wrap">
                  {meta.order_code && <span>#{meta.order_code}</span>}
                  {meta.total && <span>Rs {meta.total}</span>}
                  {meta.status && <span className="uppercase">{meta.status}</span>}
                </div>
              )}

              {link && (
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.location.href = link;
                  }}
                  className="mt-3 text-[11px] border border-white/20 px-3 py-1 rounded hover:bg-white/10"
                >
                  View Details
                </button>
              )}
            </div>
          ));

          // 🔊 play sound (fallback trigger)
          try {
            const globalAudio = (window as any).notificationAudio;
            const unlocked = (window as any).audioUnlocked;
            if (unlocked && globalAudio) {
              globalAudio.currentTime = 0;
              globalAudio.play().catch(() => {});
            }
          } catch {}

        }
      )
      .subscribe();

    activeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      activeChannelRef.current = null;
    };
  }, [user?.id]);

  const prependNotification = (n: Notification) => {
    setNotifications((prev) => mergeUnique([n], prev));
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, prependNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
