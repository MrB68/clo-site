import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
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
      try {
        setIsLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            created_at: session.user.created_at,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          created_at: session.user.created_at,
        };

        setUser(currentUser);

        // Optional: Only log admin if matches your admin email
        const isAdmin = currentUser.email === 'youradmin@email.com';
        if (isAdmin) {
          (async () => {
            const { error } = await supabase.from('admin_logs').insert([
              {
                admin_id: currentUser.id,
                admin_name: currentUser.email,
                admin_email: currentUser.email,
                branch: 'Admin Panel',
                action: 'login',
                entity_type: 'auth',
                entity_name: 'admin login',
                details: 'Admin logged into dashboard',
                created_at: new Date().toISOString(),
              },
            ]);
            if (error) {
              console.error('Failed to log admin login:', error);
            }
          })();
        }
      } else if (event === 'SIGNED_OUT') {
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