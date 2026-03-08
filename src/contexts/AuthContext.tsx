import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  teamNumber: string;
  username: string;
  displayName: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (teamNumber: string, username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bobcats_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("bobcats_user");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (teamNumber: string, username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from("team_users" as any)
        .select("*")
        .eq("team_number", teamNumber)
        .eq("username", username)
        .eq("password", password)
        .maybeSingle();

      if (error) return { error: "Failed to authenticate" };
      if (!data) return { error: "Invalid team number, username, or password" };

      const found = data as any;
      const profile: UserProfile = {
        teamNumber: found.team_number,
        username: found.username,
        displayName: found.display_name || found.username,
        role: found.role,
      };
      setUser(profile);
      localStorage.setItem("bobcats_user", JSON.stringify(profile));
      return { error: null };
    } catch {
      return { error: "Failed to load user data" };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("bobcats_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
