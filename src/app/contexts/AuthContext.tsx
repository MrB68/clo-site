import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
        });
      }

      setIsLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const currentUser = {
          id: session.user.id,
          email: session.user.email || '',
        };

        setUser(currentUser);

        // 🔥 Log admin login (only once on sign-in)
        (async () => {
          const { error } = await supabase.from("admin_logs").insert([
            {
              admin_id: currentUser.id,
              admin_name: currentUser.email || "Admin",
              admin_email: currentUser.email,
              branch: "Admin Panel",
              action: "login",
              entity_type: "auth",
              entity_name: "admin login",
              details: "Admin logged into dashboard",
              created_at: new Date().toISOString(),
            },
          ]);
          if (error) {
            console.error("Failed to log admin login:", error);
          }
        })();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}