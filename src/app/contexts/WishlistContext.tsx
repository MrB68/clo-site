import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./AuthContext";

interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { user } = useAuth();

  // 🔥 Fetch wishlist when user changes
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      const { data } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", user.id);

      setWishlist(data || []);
    };

    fetchWishlist();
  }, [user]);

  // ➕ Add
  const addToWishlist = async (productId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from("wishlist")
      .insert([{ product_id: productId, user_id: user.id }])
      .select();

    if (data) {
      setWishlist((prev) => [...prev, data[0]]);
    }
  };

  // ➖ Remove
  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    await supabase
      .from("wishlist")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", user.id);

    setWishlist((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}