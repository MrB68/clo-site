import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect =
      localStorage.getItem("redirectAfterLogin") || "/dashboard";

    localStorage.removeItem("redirectAfterLogin");

    // small delay to allow AuthContext to update session
    const timer = setTimeout(() => {
      navigate(redirect);
    }, 300);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm tracking-wider animate-pulse">
        Verifying your account...
      </p>
    </div>
  );
}