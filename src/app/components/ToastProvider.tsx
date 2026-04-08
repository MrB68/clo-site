import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Toast {
  id: number;
  title: string;
  message: string;
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const id = Date.now();

      const newToast = {
        id,
        title: e.detail.title,
        message: e.detail.message,
      };

      setToasts((prev) => [newToast, ...prev]);

      // auto remove after 4s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-[300px] bg-black border border-gray-800 rounded-xl shadow-2xl p-4 backdrop-blur-md"
          >
            <p className="text-sm font-semibold text-white">
              {toast.title}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {toast.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}