import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export type UserType = "visitor" | "company";

export interface User {
  id: string;
  email: string;
  type: UserType;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, type: UserType, companyName?: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<{ error?: string; userType?: UserType }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await api.get('/auth/me');
      setUser({
        id: data.id,
        email: data.email,
        type: data.role,
        companyName: data.companyName
      });
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signup = useCallback(async (email: string, password: string, type: UserType, companyName?: string): Promise<string | null> => {
    try {
      const res = await api.post('/auth/signup', { email, password, role: type, companyName });
      localStorage.setItem('token', res.token);
      setUser({
        id: res.user.id,
        email: res.user.email,
        type: res.user.role,
        companyName: res.user.companyName
      });
      return null;
    } catch (error: any) {
      let msg = "Signup failed";
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.message) msg = parsed.message;
      } catch (e) {
        msg = error.message;
      }
      return msg;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string; userType?: UserType }> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.token);
      const user = {
        id: res.user.id,
        email: res.user.email,
        type: res.user.role,
        companyName: res.user.companyName
      };
      setUser(user);
      return { userType: user.type };
    } catch (error: any) {
      let msg = "Login failed";
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.message) msg = parsed.message;
      } catch (e) {
        msg = error.message;
      }
      return { error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
