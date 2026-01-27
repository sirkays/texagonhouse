// // Motioned code file: app/notifications/page.tsx
// "use client";

// import {useState, useEffect} from "react";
// import {useRouter} from "next/navigation";
// import {CheckCircle2, ArrowLeft} from "lucide-react";

// interface Notification {
//   id: number;
//   kind: string;
//   title: string;
//   body: string;
//   is_read: boolean;
//   read_at: string | null;
//   data: any;
//   created_at: string;
//   updated_at: string;
// }

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [tab, setTab] = useState<"all" | "unread" | "read">("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterKind, setFilterKind] = useState("all");
//   const [selectedIds, setSelectedIds] = useState<number[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const router = useRouter();

//   const unreadCount = notifications.filter((n) => !n.is_read).length;
//   const uniqueKinds = [...new Set(notifications.map((n) => n.kind))].sort();

//   const fetchNotifications = async (unreadOnly = false) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const url = unreadOnly
//         ? "/api/notifications?unread=true"
//         : "/api/notifications";
//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to load notifications");
//       const data = await res.json();
//       setNotifications(data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications(tab === "unread");
//   }, [tab]);

//   const markRead = async (id: number, isRead: boolean) => {
//     // optimistic
//     setNotifications((prev) =>
//       prev.map((n) =>
//         n.id === id
//           ? {
//               ...n,
//               is_read: isRead,
//               read_at: isRead ? new Date().toISOString() : null,
//             }
//           : n,
//       ),
//     );

//     try {
//       const res = await fetch(`/api/notifications/${id}`, {
//         method: "PATCH",
//         headers: {"Content-Type": "application/json"},
//         body: JSON.stringify({is_read: isRead}),
//       });
//       if (!res.ok) throw new Error();
//     } catch {
//       fetchNotifications(); // rollback
//     }
//   };

//   const markBulk = async (isRead: boolean) => {
//     if (!selectedIds.length) return;

//     // optimistic
//     setNotifications((prev) =>
//       prev.map((n) =>
//         selectedIds.includes(n.id)
//           ? {
//               ...n,
//               is_read: isRead,
//               read_at: isRead ? new Date().toISOString() : null,
//             }
//           : n,
//       ),
//     );

//     try {
//       const res = await fetch("/api/notifications/read-bulk", {
//         method: "PATCH",
//         headers: {"Content-Type": "application/json"},
//         body: JSON.stringify({ids: selectedIds, is_read: isRead}),
//       });
//       if (!res.ok) throw new Error();
//       setSelectedIds([]);
//     } catch {
//       fetchNotifications();
//       setSelectedIds([]);
//     }
//   };

//   const markAllRead = async () => {
//     const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
//     if (!unreadIds.length) return;
//     await markBulk(true);
//   };

//   const filtered = notifications
//     .filter((n) => {
//       if (tab === "all") return true;
//       if (tab === "unread") return !n.is_read;
//       return n.is_read;
//     })
//     .filter((n) => filterKind === "all" || n.kind === filterKind)
//     .filter(
//       (n) =>
//         n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         n.body.toLowerCase().includes(searchQuery.toLowerCase()),
//     );

//   const relativeTime = (date: string) => {
//     const d = new Date(date);
//     const diff = Date.now() - d.getTime();
//     const mins = Math.floor(diff / 60000);
//     if (mins < 1) return "just now";
//     if (mins < 60) return `${mins}m ago`;
//     const hrs = Math.floor(mins / 60);
//     if (hrs < 24) return `${hrs}h ago`;
//     return d.toLocaleDateString("en-US", {month: "short", day: "numeric"});
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="sticky top-0 z-10 bg-white border-b px-4 py-4 md:px-8">
//         <div className="flex items-center justify-between max-w-5xl mx-auto">
//           <div className="flex items-center gap-3">
//             <button onClick={() => router.back()} className="md:hidden">
//               <ArrowLeft className="h-6 w-6" />
//             </button>
//             <h1 className="text-2xl font-bold">Notifications</h1>
//             {unreadCount > 0 && (
//               <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
//                 {unreadCount}
//               </span>
//             )}
//           </div>

//           {/* {unreadCount > 0 && (
//             <button
//               onClick={markAllRead}
//               className="text-sm text-orange-600 hover:underline">
//               Mark all read
//             </button>
//           )} */}
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-8 mt-4 border-b max-w-5xl mx-auto">
//           {(["all", "unread", "read"] as const).map((t) => (
//             <button
//               key={t}
//               onClick={() => setTab(t)}
//               className={`pb-3 px-1 font-medium ${
//                 tab === t
//                   ? "border-b-2 border-orange-500 text-orange-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}>
//               {t === "all"
//                 ? "All"
//                 : t === "unread"
//                   ? `Unread (${unreadCount})`
//                   : "Read"}
//             </button>
//           ))}
//         </div>

//         {/* Search + filter */}
//         <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-5xl mx-auto">
//           <input
//             placeholder="Search notifications..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
//           />
//           <select
//             value={filterKind}
//             onChange={(e) => setFilterKind(e.target.value)}
//             className="px-4 py-2 border rounded-lg">
//             <option value="all">All types</option>
//             {uniqueKinds.map((k) => (
//               <option key={k} value={k}>
//                 {k.charAt(0).toUpperCase() + k.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedIds.length > 0 && (
//           <div className="mt-3 max-w-5xl mx-auto flex gap-3">
//             <button
//               onClick={() => markBulk(true)}
//               className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5">
//               <CheckCircle2 size={16} /> Mark read
//             </button>
//             <button
//               onClick={() => markBulk(false)}
//               className="bg-gray-200 px-4 py-1.5 rounded-full text-sm">
//               Mark unread
//             </button>
//           </div>
//         )}
//       </header>

//       {/* List */}
//       <main className="max-w-5xl mx-auto divide-y">
//         {loading && <p className="p-8 text-center text-gray-500">Loading...</p>}

//         {error && <p className="p-8 text-center text-red-600">{error}</p>}

//         {!loading && !error && filtered.length === 0 && (
//           <p className="p-12 text-center text-gray-500">
//             No notifications to show
//           </p>
//         )}

//         {!loading &&
//           !error &&
//           filtered.map((notif) => (
//             <div
//               key={notif.id}
//               className={`p-5 flex gap-4 hover:bg-gray-50 transition ${
//                 !notif.is_read ? "bg-orange-50/40" : ""
//               }`}>
//               <input
//                 type="checkbox"
//                 checked={selectedIds.includes(notif.id)}
//                 onChange={() =>
//                   setSelectedIds((prev) =>
//                     prev.includes(notif.id)
//                       ? prev.filter((i) => i !== notif.id)
//                       : [...prev, notif.id],
//                   )
//                 }
//                 className="mt-1.5 h-4 w-4 rounded border-gray-300 text-orange-500"
//               />

//               <div className="flex-1">
//                 <h3
//                   className={`font-medium ${
//                     !notif.is_read ? "font-semibold" : ""
//                   }`}>
//                   {notif.title}
//                 </h3>
//                 <p className="text-sm text-gray-600 mt-1 line-clamp-2">
//                   {notif.body}
//                 </p>

//                 <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
//                   <span>{relativeTime(notif.created_at)}</span>
//                   <button
//                     onClick={() => markRead(notif.id, !notif.is_read)}
//                     className="text-orange-600 hover:underline">
//                     {notif.is_read ? "Mark unread" : "Mark read"}
//                   </button>
//                 </div>

//                 {notif.data?.cta?.url && (
//                   <button
//                     onClick={() => router.push(notif.data.cta.url)}
//                     className="mt-3 text-xs bg-[#EF7B55]/70 text-white px-4 py-1.5 rounded-sm hover:bg-[#EF7B55]/90">
//                     {notif.data.cta.label || "Take action"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//       </main>
//     </div>
//   );
// }

"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {CheckCircle2, ArrowLeft} from "lucide-react";
import {useNotificationStore} from "../stores/notificationStore";

interface Notification {
  id: number;
  kind: string;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  data: any;
  created_at: string;
  updated_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKind, setFilterKind] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const updateAfterRead = useNotificationStore((s) => s.updateAfterRead);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const uniqueKinds = [...new Set(notifications.map((n) => n.kind))].sort();

  const fetchNotifications = async (unreadOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = unreadOnly
        ? "/api/notifications?unread=true"
        : "/api/notifications";
      const res = await fetch(url, {cache: "no-store"});
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(tab === "unread");
  }, [tab]);

  const markRead = async (id: number, isRead: boolean) => {
    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              is_read: isRead,
              read_at: isRead ? new Date().toISOString() : null,
            }
          : n,
      ),
    );

    // Global count update
    updateAfterRead([id], isRead);

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({is_read: isRead}),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback on error
      fetchNotifications();
    }
  };

  const markBulk = async (isRead: boolean) => {
    if (!selectedIds.length) return;

    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) =>
        selectedIds.includes(n.id)
          ? {
              ...n,
              is_read: isRead,
              read_at: isRead ? new Date().toISOString() : null,
            }
          : n,
      ),
    );

    // Global count update
    updateAfterRead(selectedIds, isRead);

    try {
      const res = await fetch("/api/notifications/read-bulk", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ids: selectedIds, is_read: isRead}),
      });
      if (!res.ok) throw new Error();
      setSelectedIds([]);
    } catch {
      fetchNotifications();
      setSelectedIds([]);
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;
    await markBulk(true);
  };

  const filtered = notifications
    .filter((n) => {
      if (tab === "all") return true;
      if (tab === "unread") return !n.is_read;
      return n.is_read;
    })
    .filter((n) => filterKind === "all" || n.kind === filterKind)
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.body.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const relativeTime = (date: string) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString("en-US", {month: "short", day: "numeric"});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-4 md:px-8">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="md:hidden">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-8 mt-4 border-b max-w-5xl mx-auto">
          {(["all", "unread", "read"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 px-1 font-medium ${
                tab === t
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              {t === "all"
                ? "All"
                : t === "unread"
                  ? `Unread (${unreadCount})`
                  : "Read"}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-5xl mx-auto">
          <input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-3 max-w-5xl mx-auto flex gap-3">
            <button
              onClick={() => markBulk(true)}
              className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Mark read
            </button>
            <button
              onClick={() => markBulk(false)}
              className="bg-gray-200 px-4 py-1.5 rounded-full text-sm">
              Mark unread
            </button>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto divide-y">
        {loading && <p className="p-8 text-center text-gray-500">Loading...</p>}

        {error && <p className="p-8 text-center text-red-600">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="p-12 text-center text-gray-500">
            No notifications to show
          </p>
        )}

        {!loading &&
          !error &&
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex gap-4 hover:bg-gray-50 transition ${
                !notif.is_read ? "bg-orange-50/40" : ""
              }`}>
              <input
                type="checkbox"
                checked={selectedIds.includes(notif.id)}
                onChange={() =>
                  setSelectedIds((prev) =>
                    prev.includes(notif.id)
                      ? prev.filter((i) => i !== notif.id)
                      : [...prev, notif.id],
                  )
                }
                className="mt-1.5 h-4 w-4 rounded border-gray-300 text-orange-500"
              />

              <div className="flex-1">
                <h3
                  className={`font-medium ${!notif.is_read ? "font-semibold" : ""}`}>
                  {notif.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notif.body}
                </p>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{relativeTime(notif.created_at)}</span>
                  <button
                    onClick={() => markRead(notif.id, !notif.is_read)}
                    className="text-orange-600 hover:underline">
                    {notif.is_read ? "Mark unread" : "Mark read"}
                  </button>
                </div>

                {notif.data?.cta?.url && (
                  <button
                    onClick={() => router.push(notif.data.cta.url)}
                    className="mt-3 text-xs bg-[#EF7B55]/70 text-white px-4 py-1.5 rounded-sm hover:bg-[#EF7B55]/90">
                    {notif.data.cta.label || "Take action"}
                  </button>
                )}
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
