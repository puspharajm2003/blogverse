import { createContext, useContext, ReactNode, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  displayName: string;
  plan: "free" | "pro" | "enterprise";
  isAdmin: boolean;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const loadUser = () => {
      const savedUser = localStorage.getItem("stack_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };

    loadUser();
    setIsLoading(false);

    // Listen for storage changes from other tabs/windows or localStorage updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stack_user") {
        loadUser();
      }
    };

    // Also listen for custom events when localStorage is updated in the same tab
    const handleLocalStorageUpdate = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdated", handleLocalStorageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageUpdated", handleLocalStorageUpdate);
    };
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
