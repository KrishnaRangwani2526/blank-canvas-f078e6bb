import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'candidate' | 'hr' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  signUp: (email: string, password: string, role: 'candidate' | 'hr', data?: { fullName?: string; companyName?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  company: any;
  profile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);
  const [company, setCompany] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const metadataRole = user.user_metadata?.role as UserRole;

      if (metadataRole === 'hr') {
        setRole('hr');
        supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => setCompany(data));
      } else if (metadataRole === 'candidate') {
        setRole('candidate');
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => setProfile(data));
      } else {
        // Fallback for legacy users without metadata
        supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (data && !error) {
              setCompany(data);
              setRole('hr');
            } else {
              // Check for candidate profile
              supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle()
                .then(({ data, error }) => {
                  if (data && !error) {
                    setProfile(data);
                    setRole('candidate');
                  } else {
                    setRole(null);
                  }
                });
            }
          });
      }
    } else {
      setCompany(null);
      setProfile(null);
      setRole(null);
    }
  }, [user]);

  const signUp = async (email: string, password: string, role: 'candidate' | 'hr', data?: { fullName?: string; companyName?: string }) => {
    const metaData: Record<string, any> = { role };
    if (role === 'hr' && data?.companyName) metaData.company_name = data.companyName;
    if (role === 'candidate' && data?.fullName) metaData.full_name = data.fullName;

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData,
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;

    // Explicitly seed the 'companies' table if role is HR since the backend trigger only handles profiles natively
    if (role === 'hr' && authData?.user) {
      const { data: newCompany, error: insertError } = await supabase.from('companies').insert({
        user_id: authData.user.id,
        name: data?.companyName || "Unknown Company",
        email: email
      }).select('*').single();
      
      if (insertError) {
        console.error("Failed to insert company row:", insertError);
        // Throwing here will bubble up to `handleAuth` which has a catch block with `toast.error(err.message)`
        throw new Error("Could not initialize company profile: " + insertError.message);
      } else if (newCompany) {
        setCompany(newCompany);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, signUp, signIn, signOut, company, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
