import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "scholar" | "admin";
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

const AUTH_KEY = "islamictube_user";

const MOCK_USER: User = {
  id: "u1",
  name: "Ahmed Al-Farsi",
  email: "ahmed@islamictube.com",
  avatar: require("../assets/images/placeholder-scholar.png"),
  role: "user",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((val) => {
      if (val) {
        try {
          setUser(JSON.parse(val));
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    const u = { ...MOCK_USER, email };
    setUser(u);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  const register = useCallback(
    async (name: string, email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 1200));
      const u = { ...MOCK_USER, name, email };
      setUser(u);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
      return true;
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
