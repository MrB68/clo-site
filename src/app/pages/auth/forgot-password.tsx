import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setMessage("Enter your email");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Enter a valid email.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // 🔍 Check if user exists
      const { data: userExists } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (!userExists) {
        setMessage("No account found with this email.");
        setLoading(false);
        return;
      }

      // 🔥 Block Google-only accounts from password reset
      const { error: providerError } = await supabase.auth.signInWithPassword({
        email,
        password: "dummy_password",
      });

      if (
        providerError?.message.toLowerCase().includes("oauth") ||
        providerError?.message.toLowerCase().includes("provider")
      ) {
        setMessage("This account uses Google. Please sign in with Google.");
        setLoading(false);
        return;
      }

      // 🔥 Check if email is verified
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: "invalid_password_check",
      });

      if (verifyError?.message.toLowerCase().includes("email not confirmed")) {
        setMessage("Please verify your email before resetting password.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Reset link sent. Check your email.");
      }
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 shadow-lg">
        
        <h2 className="text-2xl font-semibold text-center mb-2">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your email and we’ll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-3 bg-black border border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-white/20"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              message.toLowerCase().includes("sent")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
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