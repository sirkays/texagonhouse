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
import { createContext, useContext, useEffect, useState } from "react";

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
  { title: "Live Sessions", icon: Video, id: "live-sessions", path: "/main/home" },
  { title: "Certificates", icon: Award, id: "certificates", path: "/student/certificate" },
  { title: "Reports", icon: FileText, id: "reports", path: "/student/reports" },
  { title: "Profile Settings", path: "/profile", icon: Settings, description: "Manage your profile settings", id: "profile" },
];

// Routes that should fill the entire content area without header/padding
// ⬇️ Added "/student/scratch" so the Scratch iframe fills the viewport (same treatment as Code IDE)
const FULL_BLEED_ROUTES = ["/student/code", "/student/scratch"];

const LoadingContext = createContext<{
  setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

function SidebarMenuContent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile: isMobileFromSidebar } = useSidebar();
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const { setIsNavigating } = useContext(LoadingContext)!;

  const handleLinkClick = () => {
    if (isMobile || isMobileFromSidebar) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarContent className="mt-4 bg-transparent">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
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
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-[#EF7B55]">
      <Image
        src="/texagon-logo.png"
        alt="Techxagon Logo"
        width={64}
        height={64}
        className="animate-pulse object-contain"
      />
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold tracking-wide">Techxagon</span>
        <Spinner size="md" className="text-[#EF7B55]" />
      </div>
      <p className="text-sm text-slate-500">Loading content...</p>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const isFullBleed = FULL_BLEED_ROUTES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

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
    <SidebarProvider className="bg-white">
      <LoadingContext.Provider value={{ setIsNavigating }}>
        {/* Use h-screen + overflow-hidden so the right column can manage its own scrolling
            (critical for the IDE to fill the viewport without page scroll) */}
        <div className="flex h-screen w-full font-sans overflow-hidden">
          <Sidebar collapsible="icon">
            <SidebarHeader className="bg-[#EF7B55] py-5">
              <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
                <Image
                  src="/texagon-logo.png"
                  alt="Techxagon Logo"
                  width={28}
                  height={28}
                  className="shrink-0 object-contain brightness-0 invert"
                />
                <span className="font-semibold text-white text-base xs:text-lg group-data-[collapsible=icon]:hidden">
                  Techxagon
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
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
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
                  background: rgba(247, 151, 113, 0.3);
                  backdrop-filter: blur(8px);
                  -webkit-backdrop-filter: blur(8px);
                  position: sticky;
                  top: 0;
                  z-index: 50;
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
                  <div className="flex-1 max-w-[90vw] xs:max-w-md"></div>
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
                  : "flex-1 p-3 xs:p-4 sm:p-6 overflow-auto"
              }>
              {isNavigating ? <PageLoader /> : children}
            </main>
          </div>
        </div>
      </LoadingContext.Provider>
    </SidebarProvider>
  );
}