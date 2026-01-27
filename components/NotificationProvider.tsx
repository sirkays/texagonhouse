"use client";

import {useEffect} from "react";
import {useNotificationStore} from "@/app/stores/notificationStore";

export function NotificationProvider({children}: {children: React.ReactNode}) {
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  useEffect(() => {
    fetchUnreadCount(); // Initial fetch on app load

    const interval = setInterval(fetchUnreadCount, 45000); // Poll every 45 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return <>{children}</>;
}
