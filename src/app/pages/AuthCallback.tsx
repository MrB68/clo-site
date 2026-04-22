import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user || (event !== "SIGNED_IN" && event !== "INITIAL_SESSION" && event !== "PASSWORD_RECOVERY")) return;

        try {
          const user = session.user;

          // 🔥 Apply pending password after OTP verification
          const pendingPassword = sessionStorage.getItem("pending_password");

          if (pendingPassword) {
            const { error: passwordError } = await supabase.auth.updateUser({
              password: pendingPassword,
            });

            if (passwordError) {
              console.error("Failed to set password:", passwordError);
            } else {
              // 🔥 ensure session reflects updated credentials
              await supabase.auth.refreshSession();
              sessionStorage.removeItem("pending_password");
            }
          }

          // 🔥 small delay to ensure DB is ready
          await new Promise((res) => setTimeout(res, 100));

          // 🔥 Get existing providers (if any)
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("providers, provider")
            .eq("id", user.id)
            .maybeSingle();

          const existingProviders = Array.isArray(existingProfile?.providers)
            ? existingProfile.providers
            : existingProfile?.provider
            ? [existingProfile.provider]
            : [];

          // 🔥 Derive provider strictly from auth (no fallback)
          const authProvider = user.app_metadata?.provider;

          // 🔥 Merge without ever removing existing providers
          const mergedSet = new Set(existingProviders || []);
          if (authProvider) mergedSet.add(authProvider);

          const mergedProviders = Array.from(mergedSet);

          const updatePayload: any = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || "",
          };

          // only write providers if we have at least one
          if (mergedProviders.length > 0) {
            updatePayload.providers = mergedProviders;
          }

          await supabase.from("profiles").upsert(updatePayload);

          const redirect =
            localStorage.getItem("redirectAfterLogin") || "/";

          localStorage.removeItem("redirectAfterLogin");

          navigate(redirect, { replace: true });
        } catch (err) {
          console.error("Callback error:", err);
          navigate("/signin");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm tracking-wider animate-pulse">
        Verifying your account...
      </p>
    </div>
  );
}