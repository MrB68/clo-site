import { supabase } from "./supabase";

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  meta,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  meta?: {
    order_id?: string;
    order_code?: string;
    total?: number;
    status?: string;
    link?: string;
  };
}) => {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    meta, // 🔥 critical for rich + clickable notifications
  });
};