import {create} from "zustand";

interface NotificationState {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchUnreadCount: () => Promise<void>;
  updateAfterRead: (ids: number[], isRead: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  loading: false,
  error: null,

  fetchUnreadCount: async () => {
    set({loading: true, error: null});
    try {
      const res = await fetch("/api/notifications?unread=true", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : 0;
      set({unreadCount: count, loading: false});
    } catch (err: any) {
      set({
        error: err.message || "Error fetching notifications",
        loading: false,
      });
    }
  },

  updateAfterRead: (ids: number[], isRead: boolean) => {
    set((state) => {
      const change = isRead ? -ids.length : ids.length;
      return {unreadCount: Math.max(0, state.unreadCount + change)};
    });
  },
}));
