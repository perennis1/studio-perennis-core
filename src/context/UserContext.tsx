

//C:\Users\studi\my-next-app\src\context\UserContext.tsx

"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, UserWithToken } from '@studio-perennis/contracts';

// Use UserWithToken for context (since we need token)
type ContextUser = UserWithToken;

interface UserContextProps {
  user: ContextUser | null;
  setUser: (user: ContextUser | null) => void;
  updateUser: (fields: Partial<ContextUser>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  updateUser: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ContextUser | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const userData = JSON.parse(raw) as ContextUser;
        if (userData.token) setUser(userData);
      }
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }

    // Sync user state across tabs
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const userData = JSON.parse(raw) as ContextUser;
          if (userData.token) setUser(userData);
          else setUser(null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateUser = (fields: Partial<ContextUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...fields } as ContextUser;
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
