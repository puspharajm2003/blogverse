import { createContext, useContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  logout?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage or API
    const savedUser = localStorage.getItem("stack_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("stack_user");
    localStorage.removeItem("stack_token");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, logout: signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
