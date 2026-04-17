import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  const channelRef = { current: null as BroadcastChannel | null };
  let activeChannel: any = null;

  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("notifications_channel");
    }

    return () => {
      channelRef.current?.close();
    };
  }, []);

  useEffect(() => {
    channelRef.current && (channelRef.current.onmessage = (event) => {
      const incoming = event.data as Notification[];
      setNotifications((prev) => mergeUnique(incoming, prev));
    });

    return () => {
      channelRef.current?.close();
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

      if (!error && data) {
        setNotifications((prev) => {
          const updated = mergeUnique(data as Notification[], prev);
          channelRef.current?.postMessage(data);
          return updated;
        });
        if (data && data.length > 0) {
          playNotificationSound();
        }
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000); // fallback sync every 15s
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    if (activeChannel) {
      supabase.removeChannel(activeChannel);
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
          console.log("🔥 REALTIME NOTIFICATION:", payload);

          const incoming = payload.new as Notification;

          setNotifications((prev) => {
            const updated = mergeUnique([incoming], prev);
            channelRef.current?.postMessage([incoming]);
            return updated;
          });

          toast.custom(() => (
            <div className="bg-black text-white px-5 py-3 rounded-xl border border-white/10 uppercase tracking-wider">
              {incoming.title || "New Notification"}
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

          // 🔗 open order page when notification clicked (toast handler will use this)
          window.dispatchEvent(
            new CustomEvent("notification-click", {
              detail: {
                orderId: incoming.id,
              },
            })
          );
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    activeChannel = channel;

    return () => {
      supabase.removeChannel(channel);
      activeChannel = null;
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
