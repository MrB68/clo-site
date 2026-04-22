import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValidRecovery, setIsValidRecovery] = useState(false);

  const hasRecoveryToken =
    window.location.hash.includes("access_token") ||
    window.location.search.includes("access_token");

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 🔥 PASSWORD_RECOVERY is the key event
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          if (session?.user) {
            setIsValidRecovery(true);
            setMessage("");
          }
        }
      }
    );

    // 🔥 fallback check (in case event already fired)
    const checkExistingSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user && hasRecoveryToken) {
        setIsValidRecovery(true);
      } else if (!hasRecoveryToken) {
        setMessage("Invalid or expired reset link.");
        setIsValidRecovery(false);
      }
    };

    checkExistingSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [hasRecoveryToken]);

  const handleReset = async () => {
    if (!isValidRecovery) {
      setMessage("Unauthorized password reset attempt.");
      return;
    }

    if (!password || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        // 🔥 Fetch current user
        const { data: userData } = await supabase.auth.getUser();

        // 🔥 Sync providers in DB
        if (userData?.user?.id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("providers")
            .eq("id", userData.user.id)
            .single();

          const existingProviders = Array.isArray(profileData?.providers)
            ? profileData.providers
            : [];

          // 🔥 Only add email after verified recovery flow
          const updatedProviders = hasRecoveryToken
            ? Array.from(new Set([...(existingProviders || []), "email"]))
            : existingProviders;

          await supabase
            .from("profiles")
            .update({ providers: updatedProviders })
            .eq("id", userData.user.id);
        }

        setMessage(
          "Password set successfully. Email login is now enabled. Redirecting..."
        );

        // 🔥 Force logout after reset (important)
        await supabase.auth.refreshSession();
        await supabase.auth.signOut();

        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      }
    } catch (err) {
      console.error("Reset error:", err);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 shadow-lg">
        
        <h2 className="text-2xl font-semibold text-center mb-2">
          Reset Password
        </h2>

        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your new password below.
        </p>

        <input
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
          disabled={!isValidRecovery}
          className="mb-4 p-3 bg-black border border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-white/20"
        />

        <input
          type="password"
          placeholder="Confirm password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={!isValidRecovery}
          className="mb-4 p-3 bg-black border border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-white/20"
        />

        <button
          onClick={handleReset}
          disabled={loading || !isValidRecovery}
          className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-300">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <a
            href="/signin"
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}