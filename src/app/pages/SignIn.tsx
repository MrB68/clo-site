import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const googleBtnRef = useRef<HTMLButtonElement | null>(null);
  const emailBtnRef = useRef<HTMLButtonElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);


  const query = new URLSearchParams(location.search);
  const emailFromQuery = query.get("email");
  const verify = query.get("verify");
  const providerFromQuery = query.get("provider");

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  useEffect(() => {
    if (!providerFromQuery) return;

    if (providerFromQuery === "google") {
      setError("Use Google to sign in with this account.");

      setTimeout(() => {
        googleBtnRef.current?.focus();
        googleBtnRef.current?.classList.add("ring-2", "ring-white", "animate-pulse");

        setTimeout(() => {
          googleBtnRef.current?.classList.remove("animate-pulse");
        }, 2000);
      }, 100);

    } else if (providerFromQuery === "email") {
      setError("Use your email and password to sign in.");

      setTimeout(() => {
        emailBtnRef.current?.focus();
        emailBtnRef.current?.classList.add("ring-2", "ring-white", "animate-pulse");

        setTimeout(() => {
          emailBtnRef.current?.classList.remove("animate-pulse");
        }, 2000);
      }, 100);
    }
  }, [providerFromQuery]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // 🔥 prevent multiple requests

    setError("");
    setIsLoading(true);

    try {
      // 🔥 Check provider from DB first
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("providers, provider")
        .ilike("email", email.toLowerCase().trim())
        .maybeSingle();

      const providers = Array.isArray(existingUser?.providers)
        ? existingUser.providers
        : (existingUser?.provider ? [existingUser.provider] : []);

      if (providers.includes("google") && !providers.includes("email")) {
        setError("This account uses Google. Please sign in with Google.");

        // 🔥 focus + highlight Google button
        setTimeout(() => {
          googleBtnRef.current?.focus();
          googleBtnRef.current?.classList.add("ring-2", "ring-white", "animate-pulse");

          setTimeout(() => {
            googleBtnRef.current?.classList.remove("animate-pulse");
          }, 2000);
        }, 100);

        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();

        if (msg.includes("invalid login")) {
          setError("Invalid email or password.");
        } else {
          setError(error.message);
        }

        setIsLoading(false);
        return;
      }

      // 🔥 Block unverified users
      if (!data.session || !data.user?.email_confirmed_at) {
        setError("Please verify your email before signing in.");
        setIsLoading(false);
        return;
      }

      const redirect =
        localStorage.getItem("redirectAfterLogin") ||
        location.state?.from?.pathname ||
        "/";

      localStorage.removeItem("redirectAfterLogin");

      navigate(redirect, { replace: true });
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return; // prevent double trigger

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      }

      // ⚠️ DO NOT reset loading here on success
      // OAuth redirects the page, so React state will reset automatically

    } catch (err) {
      setError("Google sign-in failed");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!email) {
      setError("Enter your email first to reset password.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        setError(error.message);
      } else {
        setError("Password reset link sent to your email.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f0f0f] text-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span className="text-sm tracking-wider uppercase">Back to Shop</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-2 tracking-widest uppercase">
          Sign In
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm tracking-wider">
          Welcome back to CLO
        </p>

        {verify && (
          <div className="bg-green-900 text-green-400 text-sm p-3 mb-4 text-center rounded">
            Check your email to verify your account before signing in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-500 tracking-wider"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-500 tracking-wider"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>


          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center tracking-wider bg-red-500/10 border border-red-500/30 py-2 px-3 rounded"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            ref={emailBtnRef}
            className="w-full py-3 rounded-lg font-semibold tracking-widest uppercase text-sm transition bg-gradient-to-r from-white via-gray-200 to-white !text-black shadow-lg hover:from-gray-200 hover:via-white hover:to-gray-200 hover:!text-black focus:ring-2 focus:ring-white/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="text-black">Signing In...</span>
            ) : (
              <span className="text-black">Sign In</span>
            )}
          </button>

          <div className="text-center mt-2">
            <Link
              to="/auth/forgot-password"
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            ref={googleBtnRef}
            className="w-full flex items-center justify-center gap-3 border border-gray-700 py-3 rounded-lg hover:bg-gray-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] tracking-wider uppercase text-sm text-white"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 tracking-wider mb-3">
            Don't have an account?
          </p>
          <Link
            to="/register"
            className="inline-block w-full text-center border border-gray-700 py-3 rounded-lg hover:bg-gray-900 transition tracking-widest uppercase text-sm"
          >
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}