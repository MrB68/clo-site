import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { FcGoogle } from "react-icons/fc";

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

  const navigate = useNavigate();

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
    if (isLoading) return;
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Step 1: Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes("rate limit")) {
          setError("Too many attempts. Please wait a minute and try again.");
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Step 2: Insert into profiles table (upsert, robust, use full_name)
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.name.trim(),
            role: "user",
          });

        if (profileError) {
          console.error("Profile insert error:", profileError);
        }
      }

      // After signup, show message instead of redirecting immediately
      setError("Check your email to verify your account.");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
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
        className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span className="text-sm tracking-wider uppercase">Back to Shop</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-2 tracking-widest uppercase">
          Create Account
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm tracking-wider">
          Join CLO and discover your style
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
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
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
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
            <p className="text-xs text-gray-500 mt-1 tracking-wider">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 tracking-wider uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
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
                className="w-4 h-4 border border-gray-300 focus:outline-none focus:border-black"
              />
              {agreedToTerms && (
                <Check size={12} className="absolute top-0.5 left-0.5 text-black" />
              )}
            </div>
            <label htmlFor="terms" className="text-sm text-gray-600 tracking-wider">
              I agree to the{" "}
              <Link to="/terms" className="text-black hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-black hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center tracking-wider">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 hover:bg-gray-100 transition-colors tracking-wider uppercase text-sm"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 tracking-wider">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-black hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}