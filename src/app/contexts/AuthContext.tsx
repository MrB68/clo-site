import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // 🔒 prevent duplicate concurrent profile requests
  const profileCache = useRef<Record<string, Promise<any> | undefined>>({});

  const getOrCreateProfile = async (authUser: any) => {
    const key = authUser.id;

    if (profileCache.current[key] !== undefined) {
      return profileCache.current[key];
    }

    const promise = (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", key)
        .maybeSingle();

      if (profile) return profile;

      const { data: newProfile } = await supabase
        .from("profiles")
        .upsert({
          id: key,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || "",
          role: "user",
        })
        .select()
        .single();

      return newProfile;
    })();

    profileCache.current[key] = promise;

    try {
      return await promise;
    } finally {
      delete profileCache.current[key];
    }
  };

  useEffect(() => {
    let mounted = true;

    // ⚡ Fast initial session (instant auth feel without blocking)
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;

      if (data.session?.user) {
        const authUser = data.session.user;

        // ⚡ instant user (no waiting)
        if (mounted) {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
          });
        }

        // 🔄 load profile in background (non-blocking)
        getOrCreateProfile(authUser).then((finalProfile) => {
          if (!mounted) return;
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            full_name: finalProfile?.full_name,
            role: finalProfile?.role,
          });
        });
      }

      if (!mounted) return;
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Ignore only the initial automatic event
        if (event === "INITIAL_SESSION") return;

        // Handle logout explicitly
        if (event === "SIGNED_OUT") {
          if (!mounted) return;
          setUser(null);
          return;
        }
        if (session?.user) {
          const authUser = session.user;

          // ⚡ instant update
          if (mounted) {
            setUser({
              id: authUser.id,
              email: authUser.email || "",
            });
          }

          // 🔄 background profile fetch
          getOrCreateProfile(authUser).then((finalProfile) => {
            if (!mounted) return;
            setUser({
              id: authUser.id,
              email: authUser.email || "",
              full_name: finalProfile?.full_name,
              role: finalProfile?.role,
            });
          });
        } else {
          if (!mounted) return;
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}