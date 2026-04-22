import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../contexts/AuthContext";
export function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const googleBtnRef = useRef<HTMLButtonElement | null>(null);
  const emailBtnRef = useRef<HTMLButtonElement | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // 🔥 prevent multiple requests

    setError("");

    if (!validateForm()) return;

    const email = formData.email.toLowerCase().trim();

    setIsLoading(true);

    // 🔍 Check if user already exists in profiles table
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("email, providers")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("User check error:", checkError);
    }

    if (existingUser) {
      let providers: string[] = [];

      if (Array.isArray(existingUser?.providers)) {
        providers = existingUser.providers;
      } else if (typeof existingUser?.providers === "string") {
        // handle case where DB returns string instead of array
        try {
          providers = JSON.parse(existingUser.providers);
        } catch {
          providers = [existingUser.providers];
        }
      }

      console.log("DEBUG providers:", providers, "email:", email);

      const hasGoogle = providers.includes("google");
      const hasEmail = providers.includes("email");

      // 🔥 fallback detection if providers missing
      // 🔥 fallback detection ONLY if truly unknown (DO NOT override valid cases)
      if (!providers.length) {
        setError("Account already exists. Please sign in.");
        setIsLoading(false);
        return;
      }

      if (hasGoogle && !hasEmail) {
        setError("This email is already registered with Google. Please sign in using Google.");

        setTimeout(() => {
          googleBtnRef.current?.focus();
          googleBtnRef.current?.classList.add("ring-2", "ring-white", "animate-pulse");

          setTimeout(() => {
            googleBtnRef.current?.classList.remove("animate-pulse");
          }, 2000);
        }, 100);

        setTimeout(() => {
          navigate(`/signin?email=${encodeURIComponent(email)}&provider=google`);
        }, 1200);

      } else if (hasEmail && !hasGoogle) {
        setError("This email is already registered. Please sign in with your email and password.");

        setTimeout(() => {
          emailBtnRef.current?.focus();
          emailBtnRef.current?.classList.add("ring-2", "ring-white", "animate-pulse");

          setTimeout(() => {
            emailBtnRef.current?.classList.remove("animate-pulse");
          }, 2000);
        }, 100);

        setTimeout(() => {
          navigate(`/signin?email=${encodeURIComponent(email)}&provider=email`);
        }, 1200);
      } else if (hasGoogle && hasEmail) {
        setError("This account supports both Google and Email login. Please sign in.");

      } else {
        setError("Account already exists. Please sign in.");
      }

      setIsLoading(false);
      return;
    }

    // 🔥 Auth-level check to prevent duplicate signup emails
    const randomPassword = "__random_invalid_password__";

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: randomPassword,
    });

    // If session exists → user logged in → immediately logout and block
    if (signInData?.session) {
      await supabase.auth.signOut();
      setError("Account already exists. Please sign in.");
      setIsLoading(false);
      return;
    }

    // If invalid login → user likely exists (wrong password)
    if (signInError && signInError.message.toLowerCase().includes("invalid login")) {
      setError("Account already exists. Please sign in.");
      setIsLoading(false);
      return;
    }

    // Step 1: Create user in Supabase Auth
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name.trim(),
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();

        if (
          msg.includes("user already registered") ||
          msg.includes("already exists") ||
          msg.includes("duplicate")
        ) {
          setError("Account already exists. Redirecting to sign in...");
          setTimeout(() => {
            navigate(`/signin?email=${encodeURIComponent(email)}`);
          }, 1500);
        } else if (msg.includes("rate limit")) {
          setError("Too many attempts. Please wait a minute and try again.");
        } else {
          setError(error.message);
        }

        setIsLoading(false);
        return;
      }

      // 🔥 Ensure profile exists with providers=["email"]
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          full_name: formData.name.trim(),
          providers: ["email"],
        });
      }

      // 🔥 Require email verification before login
      if (!data.session) {
        setError("Account created! Please check your email to verify your account before signing in.");
        navigate("/signin?verify=true");
        return;
      }

      // Fallback (should not normally happen if confirmation is enabled)
      navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isLoading) return;

    const email = formData.email.toLowerCase().trim();

    try {
      setIsLoading(true);

      // 🔥 Check DB FIRST to prevent unwanted login
      if (email) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("email, providers")
          .eq("email", email)
          .maybeSingle();

        if (existingUser) {
          let providers: string[] = [];

          if (Array.isArray(existingUser?.providers)) {
            providers = existingUser.providers;
          } else if (typeof existingUser?.providers === "string") {
            try {
              providers = JSON.parse(existingUser.providers);
            } catch {
              providers = [existingUser.providers];
            }
          }

          const hasGoogle = providers.includes("google");
          const hasEmail = providers.includes("email");

          if (hasGoogle && !hasEmail) {
            setError("This email is already registered with Google. Please sign in using Google.");

            setTimeout(() => {
              googleBtnRef.current?.focus();
              googleBtnRef.current?.classList.add("ring-2", "ring-white", "animate-pulse");

              setTimeout(() => {
                googleBtnRef.current?.classList.remove("animate-pulse");
              }, 2000);
            }, 100);

            setTimeout(() => {
              navigate(`/signin?email=${encodeURIComponent(email)}&provider=google`);
            }, 1200);

          } else if (hasEmail && !hasGoogle) {
            setError("This email is already registered. Please sign in with your email and password.");

            setTimeout(() => {
              emailBtnRef.current?.focus();
              emailBtnRef.current?.classList.add("ring-2", "ring-white", "animate-pulse");

              setTimeout(() => {
                emailBtnRef.current?.classList.remove("animate-pulse");
              }, 2000);
            }, 100);

            setTimeout(() => {
              navigate(`/signin?email=${encodeURIComponent(email)}&provider=email`);
            }, 1200);

          } else if (hasGoogle && hasEmail) {
            setError("This account supports both Google and Email login. Please sign in.");

          } else {
            setError("Account already exists. Please sign in.");
          }

          setIsLoading(false);
          return; // 🔥 STOP OAuth completely
        }
      }

      // 🔥 Only allow OAuth if NO existing account
      await supabase.auth.signOut();

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
      }
    } catch (err) {
      setError("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 text-white p-8 rounded-lg shadow-lg max-w-md w-full border border-zinc-800"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span className="text-sm tracking-wider uppercase">Back to Shop</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-2 tracking-widest uppercase text-white">
          Create Account
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm tracking-wider">
          Join CLO and discover your style
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-white">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white tracking-wider placeholder-gray-500 focus:ring-2 focus:ring-white/20 transition-all duration-200"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-white">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white tracking-wider placeholder-gray-500 focus:ring-2 focus:ring-white/20 transition-all duration-200"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white tracking-wider placeholder-gray-500 focus:ring-2 focus:ring-white/20 transition-all duration-200"
                placeholder="Create a password"
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
            <p className="text-xs text-gray-400 mt-1 tracking-wider">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-white">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white tracking-wider placeholder-gray-500 focus:ring-2 focus:ring-white/20 transition-all duration-200"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 border border-zinc-700 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-200"
              />
              {agreedToTerms && (
                <Check size={12} className="absolute top-0.5 left-0.5 text-white" />
              )}
            </div>
            <label htmlFor="terms" className="text-sm text-gray-400 tracking-wider">
              I agree to the{" "}
              <Link to="/terms" className="text-white hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-white hover:underline">
                Privacy Policy
              </Link>
            </label>
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
            className="w-full bg-white text-black py-3 hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-zinc-700"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            ref={googleBtnRef}
            className="w-full flex items-center justify-center gap-3 border border-zinc-700 py-3 hover:bg-zinc-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] tracking-wider uppercase text-sm text-white"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Please wait...
              </span>
            ) : (
              <>
                <FcGoogle size={20} />
                Continue with Google
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 tracking-wider">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-white hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}