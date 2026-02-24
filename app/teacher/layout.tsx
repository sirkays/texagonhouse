//texagon_academy\texagonui\app\teacher\layout.tsx
"use client";

import {
  Book,
  Upload,
  GraduationCap,
  Home,
  Settings,
  TestTube,
  User,
  Search,
  Bell,
  ChevronDown,
  BarChart3,
  CameraIcon,
  Video,
  Calendar,
  LogOut,
  Laptop,
  Award,
  ClipboardCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { useSession, signOut } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { useNotificationStore } from "../stores/notificationStore";
import { createContext, useContext, useEffect, useState } from "react";

const menuItems = [
  { title: "Dashboard", icon: Home, id: "dashboard", path: "/teacher" },
  {
    title: "Manage CBT",
    icon: TestTube,
    id: "cbt-creator",
    path: "/teacher/create-cbt",
  },
  // {
  //   title: "Video Lessons",
  //   icon: Video,
  //   id: "video-lessons",
  //   path: "/teacher/video-lessons",
  // },
  {
    title: "Live Sessions",
    icon: Calendar,
    id: "live-sessions",
    path: "/main/home",
  },
  // {
  //   title: "Upload Materials",
  //   icon: Upload,
  //   id: "uploader",
  //   path: "/teacher/uploader",
  // },
  // {
  //   title: "Resource Manager",
  //   icon: Book,
  //   id: "resources",
  //   path: "/teacher/resource-manager",
  // },
  {
    title: "Learning Modules",
    icon: GraduationCap,
    id: "modules",
    path: "/teacher/learning-module",
  },
  {
    title: "Tutoring Booking",
    icon: Calendar,
    id: "tutoring-booking",
    path: "/teacher/tutoring",
  },
  {
    title: "Attendance",
    icon: ClipboardCheck,
    id: "attendance",
    path: "/teacher/attendance",
  },
  {
    title: "Student Analytics",
    icon: BarChart3,
    id: "analytics",
    path: "/teacher/student-analytics",
  },
  {
    title: "Code Submission",
    icon: Laptop,
    id: "code-submission",
    path: "/teacher/submissions",
  },

  {
    title: "Student Cert",
    icon: Award,
    id: "certs",
    path: "/teacher/student-certs",
  },
];

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
      <GraduationCap className="h-16 w-16 animate-pulse" strokeWidth={1.8} />
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold tracking-wide">TECHXAGON</span>
        <Spinner size="md" className="text-[#EF7B55]" />
      </div>
      <p className="text-sm text-slate-500">Loading content...</p>
    </div>
  );
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-400" />
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "teacher") {
    window.location.href = "/login";
    return null;
  }
  const handleLogout = async () => {
    try {
      // 1. Call your custom backend logout
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });

      if (!response.ok) {
        console.error("[AdminLayout] Backend logout failed");
      }

      await signOut({redirect: false});

      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);

      // Fallback: Ensure the user is still visually logged out if an error occurs
      await signOut({redirect: false});
      window.location.href = "/login";
    }
  };

  return (
    <SidebarProvider className="bg-white">
      <LoadingContext.Provider value={{ setIsNavigating }}>
        <div className="flex min-h-screen w-full font-sans">
          <Sidebar className="">
            <SidebarHeader className="bg-[#EF7B55] py-5">
              <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
                <GraduationCap className="h-5 w-5 xs:h-6 xs:w-6 text-white text-primary" />
                <span className="font-semibold text-white text-base xs:text-lg">
                  TECHXAGON
                </span>
              </div>
            </SidebarHeader>
            <SidebarMenuContent />
            <SidebarFooter className="border border-t-[#EF7B553a] py-5">
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        <Avatar className="h-5 w-5 xs:h-6 xs:w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback className="xs:text-[0.65rem] sm:text-xs">
                            {session?.user?.name?.[0] || "JD"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="xs:text-xs sm:text-sm">
                          {session?.user?.name || "John Doe"}
                        </span>
                        <ChevronDown className="ml-auto h-3 w-3 xs:h-4 xs:w-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      className="w-[--radix-popper-anchor-width]">
                      <DropdownMenuItem
                        className="text-[0.85rem] xs:text-xs sm:text-sm hover:bg-[#F79771] hover:text-white focus:bg-[#F79771] focus:text-white"
                        onClick={handleLogout}>
                        <LogOut className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-50 py-4">
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
            </header>

            <main className="flex-1 p-3 xs:p-4 sm:p-6">
              {isNavigating ? <PageLoader /> : children}
            </main>
          </div>
        </div>
      </LoadingContext.Provider>
    </SidebarProvider>
  );
}
