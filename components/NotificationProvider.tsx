"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotificationStore } from "@/app/stores/notificationStore";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUnreadCount(); // Initial fetch only for logged-in users
    }
  }, [status, fetchUnreadCount]);

  return <>{children}</>;
}

