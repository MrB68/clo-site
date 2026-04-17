import { supabase } from "./supabase";

export const logActivity = async (
  action: string,
  details: string,
  user_email: string
) => {
  const { error } = await supabase.from("activity_logs").insert([
    {
      action,
      details,
      user_email
    }
  ]);

  if (error) {
    console.error("Activity Log Error:", error);
  }
};