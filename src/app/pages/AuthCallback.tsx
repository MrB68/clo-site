import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        navigate("/signin");
        return;
      }

      if (data.session) {
        // ✅ user is logged in automatically
        navigate("/dashboard");
      } else {
        navigate("/signin");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm tracking-wider">Verifying your account...</p>
    </div>
  );
}