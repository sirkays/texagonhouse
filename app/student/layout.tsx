"use client";

import {
  Book,
  Code,
  GraduationCap,
  Home,
  Settings,
  TestTube,
  User,
  BookOpen,
  Search,
  Bell,
  ChevronDown,
  Trophy,
  Medal,
  LogOut,
  Video,
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
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Spinner} from "@/components/ui/spinner";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useMediaQuery} from "react-responsive";
import {useSession} from "next-auth/react";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
    path: "/student",
  },
  {
    title: "Code IDE",
    icon: Code,
    id: "ide",
    path: "/student/code",
  },
  {
    title: "CBT Tests",
    icon: TestTube,
    id: "cbt",
    path: "/student/cbt",
  },
  {
    title: "My Materials",
    icon: BookOpen,
    id: "materials",
    path: "/student/materials",
  },
  {
    title: "Resources",
    icon: Book,
    id: "resources",
    path: "/student/resources",
  },
  {
    title: "Learning Modules",
    icon: GraduationCap,
    id: "modules",
    path: "/student/modules",
  },
  {
    title: "Achievements",
    icon: Trophy,
    id: "achievements",
    path: "/student/achievements",
  },
  {
    title: "Leaderboard",
    icon: Medal,
    id: "leaderboard",
    path: "/student/leaderboard",
  },
  {
    title: "Live Sessions",
    icon: Video,
    id: "live-sessions",
    path: "/main/home",
  },
];

function SidebarMenuContent() {
  const pathname = usePathname();
  const {setOpenMobile, isMobile: isMobileFromSidebar} = useSidebar();
  const isMobile = useMediaQuery({maxWidth: 639});

  const handleLinkClick = () => {
    if (isMobile || isMobileFromSidebar) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarContent className="mt-4 bg-transparent">
      <SidebarGroup>
        {/* <SidebarGroupLabel className="text-[0.85rem] xs:text-xs sm:text-sm">
          Welcome
        </SidebarGroupLabel> */}
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
                    onClick={handleLinkClick}
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

export default function StudentLayout({children}: {children: React.ReactNode}) {
  const {data: session, status} = useSession();

  console.log("[StudentLayout] Session status:", status);
  console.log("[StudentLayout] Session data:", session);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-black" />
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "student") {
    console.log("[StudentLayout] Unauthorized, redirecting to /login");
    window.location.href = "/login";
    return null;
  }

  const handleLogout = async () => {
    console.log(
      "[StudentLayout] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });

      console.log(
        "[StudentLayout] Logout API response status:",
        response.status
      );
      const data = await response.json();
      console.log("[StudentLayout] Logout API response:", data);

      if (!response.ok) {
        console.error("[StudentLayout] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }

      console.log("[StudentLayout] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[StudentLayout] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    }
  };

  return (
    <SidebarProvider className="bg-white">
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
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 py-4">
            <style jsx>{`
              header {
                background: rgba(
                  247,
                  151,
                  113,
                  0.3
                ); /* Semi-transparent #F19212 */
                backdrop-filter: blur(8px); /* Frosted glass effect */
                -webkit-backdrop-filter: blur(8px); /* Safari compatibility */
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
              <Button
                variant="ghost"
                size="icon"
                className="p-1 xs:p-2 hover:bg-transparent focus:bg-transparent active:bg-transparent">
                <Bell className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-3 xs:p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
