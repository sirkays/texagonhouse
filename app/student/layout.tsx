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
import { redirect } from "next/navigation";

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
];

function SidebarMenuContent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile: isMobileFromSidebar } = useSidebar();
  const isMobile = useMediaQuery({ maxWidth: 639 });

  const handleLinkClick = () => {
    if (isMobile || isMobileFromSidebar) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-[0.65rem] xs:text-xs sm:text-sm">Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                >
                  <Link href={item.path} onClick={handleLinkClick}>
                    <item.icon className="h-3 w-3 xs:h-4 xs:w-4" />
                    <span className="text-[0.65rem] xs:text-xs sm:text-sm">{item.title}</span>
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

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  console.log("[StudentLayout] Session status:", status);
  console.log("[StudentLayout] Session data:", session);

  if (status === "loading") {
    return <div>Loading...</div>;
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
        headers: { "Content-Type": "application/json" },
      });

      console.log("[StudentLayout] Logout API response status:", response.status);
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full font-sans">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
              <GraduationCap className="h-5 w-5 xs:h-6 xs:w-6 text-primary" />
              <span className="font-semibold text-base xs:text-lg">EduPlatform</span>
            </div>
          </SidebarHeader>
          <SidebarMenuContent />
          <SidebarFooter>
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
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuLabel className="text-[0.65rem] xs:text-xs sm:text-sm">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-[0.65rem] xs:text-xs sm:text-sm">
                      <User className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[0.65rem] xs:text-xs sm:text-sm">
                      <Settings className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-[0.65rem] xs:text-xs sm:text-sm"
                      onClick={handleLogout}
                    >
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
          <header className="sticky top-0 z-50 bg-white shadow-md border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-12 xs:h-14 items-center justify-between gap-3 xs:gap-4 px-3 xs:px-4 sm:px-6">
              <SidebarTrigger />
              <div className="flex-1 max-w-[90vw] xs:max-w-md">
                {/* <div className="relative">
                  <Search className="absolute left-2 xs:left-2.5 top-2 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses, materials..."
                    className="pl-7 xs:pl-8 text-[0.65rem] xs:text-xs sm:text-sm"
                  />
                </div> */}
              </div>
              <Button variant="ghost" size="icon" className="p-1 xs:p-2">
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