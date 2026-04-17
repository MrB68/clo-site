import { supabase } from "./supabase";

export const toggleWishlist = async (userId: string, productId: string) => {
  // check if exists
  const { data } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (data) {
    // remove
    await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    return false;
  } else {
    // add
    await supabase
      .from("wishlist")
      .insert([{ user_id: userId, product_id: productId }]);

    return true;
  }
};