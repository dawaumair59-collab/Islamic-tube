import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi, saveTokens, clearTokens } from "@/services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "scholar" | "admin";
  username?: string;
  subscribers?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
});

const USER_KEY = "islamictube_user";

function apiUserToUser(u: any): User {
  return {
    id: String(u.id ?? ""),
    name: u.full_name ?? u.username ?? "User",
    email: u.email ?? "",
    avatar: u.avatar_url ?? "",
    role: u.is_staff ? "admin" : u.is_scholar ? "scholar" : "user",
    username: u.username,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY).then((val) => {
      if (val) {
        try { setUser(JSON.parse(val)); } catch { setUser(null); }
      }
      setIsLoading(false);
    });
  }, []);

  const persist = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      if (!data.success) return false;
      await saveTokens(data.tokens.access, data.tokens.refresh);
      await persist(apiUserToUser(data.user));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    await clearTokens();
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const username =
        email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() +
        Math.floor(Math.random() * 900 + 100);
      const data = await authApi.register(name, username, email, password);
      if (!data.success) return false;
      await saveTokens(data.tokens.access, data.tokens.refresh);
      await persist(apiUserToUser(data.user));
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
