// src/hooks/useAuth.ts

"use client";

import { useState, useEffect } from "react";
import { UserWithToken } from '@studio-perennis/contracts';

export default function useAuth() {
  const [user, setUser] = useState<UserWithToken | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        // Validate that parsed user has required fields
        if (parsedUser && parsedUser.id && parsedUser.token) {
          setUser(parsedUser);
        } else {
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, logout };
}
