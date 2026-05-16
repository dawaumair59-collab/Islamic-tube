import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { notificationsApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface NotificationContextValue {
  unreadCount: number;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  refresh: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

const POLL_INTERVAL_MS = 30_000;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationsApi.unreadCount();
      setUnreadCount(count);
    } catch {
      // network error — keep last known count
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    fetchCount();
    timerRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, fetchCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh: fetchCount }}>
      {children}
    </NotificationContext.Provider>
  );
}
