import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "clo_notifications_cache";

const saveToCache = (data: Notification[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const loadFromCache = (): Notification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

  const channelRef = new BroadcastChannel("notifications_channel");

  useEffect(() => {
    channelRef.onmessage = (event) => {
      const incoming = event.data as Notification[];
      setNotifications((prev) => mergeUnique(incoming, prev));
    };

    return () => {
      channelRef.close();
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
          channelRef.postMessage(data);
          return updated;
        });
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000); // fallback sync every 15s
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

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
            channelRef.postMessage([incoming]);
            return updated;
          });

          // 🔔 trigger toast
          window.dispatchEvent(
            new CustomEvent("toast", {
              detail: {
                title: incoming.title,
                message: incoming.message,
              },
            })
          );
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
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
