// texagonui/app/student/layout.tsx
"use client";

import Image from "next/image";
import {
  Book,
  Code,
  GraduationCap,
  Home,
  Settings,
  TestTube,
  BookOpen,
  Bell,
  ChevronDown,
  Trophy,
  Medal,
  LogOut,
  Video,
  Award,
  FileText,
  Puzzle, // ⬅️ NEW: icon for Scratch Studio (block-puzzle feel)
  User, // For nickname modal
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { signOut, useSession } from "next-auth/react";
import { useNotificationStore } from "../stores/notificationStore";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { StudentThemeProvider, useStudentTheme } from "@/components/student/useStudentTheme";
import { CourseAccessProvider } from "@/providers/CourseAccessProvider";
import { useBrand } from "@/hooks/use-brand";

const menuItems = [
  { title: "Dashboard", icon: Home, id: "dashboard", path: "/student" },
  { title: "Code IDE", icon: Code, id: "ide", path: "/student/code" },
  // ⬇️ NEW: Scratch Studio entry, placed right after Code IDE so coding tools sit together.
  { title: "Scratch Studio", icon: Puzzle, id: "scratch", path: "/student/scratch" },
  { title: "Assignments", icon: FileText, id: "assignments", path: "/student/assignments" },
  { title: "CBT Tests", icon: TestTube, id: "cbt", path: "/student/cbt" },
  { title: "My Materials", icon: BookOpen, id: "materials", path: "/student/materials" },
  { title: "Resources", icon: Book, id: "resources", path: "/student/resources" },
  { title: "Learning Modules", icon: GraduationCap, id: "modules", path: "/student/modules" },
  { title: "Achievements", icon: Trophy, id: "achievements", path: "/student/achievements" },
  { title: "Leaderboard", icon: Medal, id: "leaderboard", path: "/student/leaderboard" },
  { title: "Live Sessions", icon: Video, id: "live-sessions", path: "/student/live-sessions" },
  { title: "Certificates", icon: Award, id: "certificates", path: "/student/certificate" },
  { title: "Reports", icon: FileText, id: "reports", path: "/student/reports" },
  { title: "Profile Settings", path: "/profile", icon: Settings, description: "Manage your profile settings", id: "profile" },
];

// Routes that should fill the entire content area without header/padding
// ⬇️ Added "/student/scratch" so the Scratch iframe fills the viewport (same treatment as Code IDE)
const FULL_BLEED_ROUTES = ["/student/code", "/student/scratch"];

/** Returns the correct live-sessions path based on the org's video_conferencing setting. */
function useLiveSessionPath(role: "teacher" | "student") {
  const [path, setPath] = useState<string>(
    role === "teacher" ? "/teacher/live-sessions" : "/student/live-sessions"
  );

  useEffect(() => {
    fetch("/api/org/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.video_conferencing === "live") {
          setPath("/main/home");
        } else {
          setPath(role === "teacher" ? "/teacher/live-sessions" : "/student/live-sessions");
        }
      })
      .catch(() => {}); // keep default on error
  }, [role]);

  return path;
}

const LoadingContext = createContext<{
  setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

function SidebarMenuContent() {
  const brand = useBrand();
  const pathname = usePathname();
  const { setOpenMobile, isMobile: isMobileFromSidebar } = useSidebar();
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const { setIsNavigating } = useContext(LoadingContext)!;
  const liveSessionPath = useLiveSessionPath("student");

  const handleLinkClick = () => {
    if (isMobile || isMobileFromSidebar) {
      setOpenMobile(false);
    }
  };

  // Resolve the live-sessions path dynamically and filter by brand
  const resolvedItems = menuItems
    .map((item) =>
      item.id === "live-sessions" ? { ...item, path: liveSessionPath } : item
    )
    .filter((item) => {
      if (brand.id === "nimet" || brand.isNiMet) {
        if (
          item.id === "ide" ||
          item.id === "scratch" ||
          item.id === "leaderboard"
        ) {
          return false;
        }
      }
      return true;
    });

  return (
    <SidebarContent className="mt-4 bg-transparent">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {resolvedItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                  tooltip={item.title}
                  className={`
                    py-5
                    hover:bg-[#F797713a]
                    data-[active=true]:bg-[#EF7B553a]
                    data-[active=true]:text-slate-600
                    transition-colors
                    rounded-md
                  `}>
                  <Link
                    href={item.path}
                    onClick={() => {
                      handleLinkClick();
                      if (pathname !== item.path) {
                        setIsNavigating(true);
                      }
                    }}
                    className="flex items-center gap-2">
                    <item.icon className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
                    <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function PageLoader() {
  const brand = useBrand();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-[#EF7B55]">
      <Image
        src={brand.logo}
        alt={brand.logoAlt}
        width={brand.id === "nimet" ? 100 : 64}
        height={64}
        className="animate-pulse object-contain"
      />
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold tracking-wide">{brand.name}</span>
        <Spinner size="md" className="text-[#EF7B55]" />
      </div>
      <p className="text-sm text-slate-500">Loading content...</p>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentThemeProvider>
      <CourseAccessProvider>
        <StudentLayoutContent>{children}</StudentLayoutContent>
      </CourseAccessProvider>
    </StudentThemeProvider>
  );
}

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
  const brand = useBrand();
  const { data: session, status } = useSession();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const { theme } = useStudentTheme();
  const isAero = theme === "aero-premium";
  const { update } = useSession();

  // Nickname Modal State
  // dismissedRef tracks whether the user has skipped the modal in this session.
  // Using a ref (not state) so setting it never triggers a re-render / effect loop.
  const dismissedRef = useRef(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameLoading, setNicknameLoading] = useState(false);

  const isFullBleed = FULL_BLEED_ROUTES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Single effect that decides whether to show the nickname modal.
  // We only depend on `status` and `session` — NOT on `showNicknameModal`,
  // so clicking Skip (which sets showNicknameModal=false) never re-triggers this.
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "student") return;
    const hasNickname = (session.user as any).hasNickname;
    if (hasNickname) return; // already has a nickname — never show

    // Check sessionStorage once (synchronous, no race condition)
    if (!dismissedRef.current && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("nicknameModalDismissed");
      if (stored === "true") {
        dismissedRef.current = true;
      }
    }

    if (!dismissedRef.current) {
      setShowNicknameModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) return;

    setNicknameLoading(true);
    setNicknameError("");

    try {
      const response = await fetch("/api/set-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: newNickname }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to set nickname");
      }

      setShowNicknameModal(false);
      await update({ nickname: newNickname, hasNickname: true });
    } catch (err: any) {
      setNicknameError(err.message || "An error occurred");
    } finally {
      setNicknameLoading(false);
    }
  };

  const handleSkipNickname = () => {
    // Mark as dismissed synchronously BEFORE hiding the modal,
    // so any subsequent effect run sees dismissedRef.current = true.
    dismissedRef.current = true;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nicknameModalDismissed", "true");
    }
    setShowNicknameModal(false);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-black" />
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "student") {
    window.location.href = "/login";
    return null;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) console.error("[AdminLayout] Backend logout failed");
      await signOut({ redirect: false });
      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);
      await signOut({ redirect: false });
      window.location.href = "/login";
    }
  };

  return (
    <SidebarProvider className={isAero ? "bg-slate-50/50" : "bg-white"}>
      <LoadingContext.Provider value={{ setIsNavigating }}>
        {/* Use h-screen + overflow-hidden so the right column can manage its own scrolling
            (critical for the IDE to fill the viewport without page scroll) */}
        <div className="flex h-screen w-full font-sans overflow-hidden">
          <Sidebar collapsible="icon" className={isAero ? "border-r border-slate-200/50" : ""}>
            <SidebarHeader className="bg-[#EF7B55] py-5">
              <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
                <Image
                  src={brand.logo}
                  alt={brand.logoAlt}
                  width={brand.id === "nimet" ? 40 : 28}
                  height={28}
                  className={`shrink-0 object-contain ${brand.id === "techxagon" ? "brightness-0 invert" : ""}`}
                />
                <span className="font-semibold text-white text-base xs:text-lg group-data-[collapsible=icon]:hidden">
                  {brand.name}
                </span>
              </div>
            </SidebarHeader>
            <SidebarMenuContent />
            <SidebarFooter className="border border-t-[#EF7B553a] py-5">
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton tooltip={session?.user?.name || "Account"}>
                        <Avatar className="h-5 w-5 xs:h-6 xs:w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback className="xs:text-[0.65rem] sm:text-xs">
                            {session?.user?.name?.[0] || "JD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start overflow-hidden">
                          <span className="truncate xs:text-xs sm:text-sm">
                            {session?.user?.name || "John Doe"}
                          </span>
                          <span className="truncate text-[10px] text-slate-400 font-normal italic">
                            @{(session?.user as any)?.username || (session?.user as any)?.nickname || session?.user?.name}
                          </span>
                        </div>
                        <ChevronDown className="ml-auto h-3 w-3 xs:h-4 xs:w-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      className="w-[--radix-popper-anchor-width]">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground italic">
                            @{(session?.user as any)?.username || (session?.user as any)?.nickname || session?.user?.name}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-[0.85rem] xs:text-xs sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]"
                        onClick={handleLogout}>
                        <LogOut className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            {/* Click-anywhere-on-the-rail to expand when collapsed.
                Always present, works on every page. */}
            <SidebarRail />
          </Sidebar>

          {/* Right column. min-w-0 prevents flex children from overflowing horizontally. */}
          <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${isAero ? "bg-gradient-to-br from-slate-50 via-orange-50/5 to-slate-100/50" : ""}`}>
            {/* Orange top header — rendered on every page so the SidebarTrigger is always available.
                On full-bleed routes (the IDE), it shrinks to a slim bar containing just the trigger. */}
            <header
              id="student-layout-header"
              className={
                isFullBleed
                  ? "sticky top-0 z-50 flex-shrink-0"
                  : "sticky top-0 z-50 py-4 flex-shrink-0"
              }>
              <style jsx>{`
                header {
                  background: ${isAero ? "rgba(255, 255, 255, 0.45)" : brand.isNiMet ? "rgba(0, 107, 62, 0.12)" : "rgba(247, 151, 113, 0.3)"};
                  backdrop-filter: blur(12px);
                  -webkit-backdrop-filter: blur(12px);
                  position: sticky;
                  top: 0;
                  z-index: 50;
                  border-bottom: ${isAero ? "1px solid rgba(226, 232, 240, 0.5)" : brand.isNiMet ? "1px solid rgba(0, 107, 62, 0.2)" : "none"};
                }
                header > div {
                  position: relative;
                  z-index: 10;
                  background: transparent;
                }
              `}</style>
              {isFullBleed ? (
                <div className="flex h-9 items-center px-2 text-slate-800">
                  <SidebarTrigger className="hover:bg-[#F797713a] focus:bg-transparent active:bg-transparent" />
                </div>
              ) : (
                <div className="flex h-12 xs:h-14 items-center justify-between gap-3 xs:gap-4 px-3 xs:px-4 sm:px-6 text-slate-800">
                  <SidebarTrigger className="hover:bg-transparent focus:bg-transparent active:bg-transparent" />
                  <div className="flex-1" />
                  <Link href="/notifications">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative p-1 xs:p-2 hover:bg-[#F797713a] focus:bg-transparent active:bg-transparent transition-colors"
                      title="Notifications">
                      <Bell className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 right-2 bg-orange-500 text-white text-[10px] xs:text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
              )}
            </header>

            {/* On full-bleed routes: no padding, no overflow, lets the IDE manage its own size.
                On normal routes: keep padding and allow scroll. */}
            <main
              className={
                isFullBleed
                  ? "flex-1 min-h-0 overflow-hidden"
                  : isAero
                    ? "flex-1 p-3 xs:p-4 sm:p-6 overflow-auto bg-gradient-to-br from-slate-50/60 via-orange-50/10 to-slate-100/40"
                    : "flex-1 p-3 xs:p-4 sm:p-6 overflow-auto"
              }>
              {isNavigating ? <PageLoader /> : children}
            </main>
          </div>
        </div>

        {showNicknameModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <User className="text-orange-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Choose a Nickname</h2>
                <p className="text-gray-500 mt-2">
                  You haven't set up a unique nickname yet. Setting one up allows you to log in easily without typing your full email!
                </p>
              </div>

              <form onSubmit={handleNicknameSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Unique Nickname
                  </label>
                  <Input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value.replace(/\s/g, ""))}
                    placeholder="e.g. techwiz_24"
                    className="h-12 border-gray-300 focus:ring-orange-500 focus:border-orange-500 rounded-xl"
                    required
                    disabled={nicknameLoading}
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                    No spaces allowed • Min 3 characters
                  </p>
                </div>

                {nicknameError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                    {nicknameError}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="gradient"
                    className="h-12 text-lg font-bold shadow-lg shadow-orange-200"
                    disabled={nicknameLoading || newNickname.length < 3}>
                    {nicknameLoading ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      "Save & Continue"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={handleSkipNickname}
                    className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors py-2"
                    disabled={nicknameLoading}>
                    I'll do it later
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </LoadingContext.Provider>
    </SidebarProvider>
  );
}