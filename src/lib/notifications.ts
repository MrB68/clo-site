import { supabase } from "./supabase";

export const createNotification = async ({
  userId,
  type,
  title,
  message,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) => {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
  });
};