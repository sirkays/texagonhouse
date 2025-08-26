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
  Video,
  Calendar,
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

const menuItems = [
  { title: "Dashboard", icon: Home, id: "dashboard", path: "/teacher" },
  {
    title: "Create CBT",
    icon: TestTube,
    id: "cbt-creator",
    path: "/teacher/create-cbt",
  },
  {
    title: "Video Lessons",
    icon: Video,
    id: "video-lessons",
    path: "/teacher/video-lessons",
  },
  {
    title: "Live Sessions",
    icon: Calendar,
    id: "live-sessions",
    path: "/teacher/live-session-manager",
  },
  {
    title: "Upload Materials",
    icon: Upload,
    id: "uploader",
    path: "/teacher/uploader",
  },
  {
    title: "Resource Manager",
    icon: Book,
    id: "resources",
    path: "/teacher/resource-manager",
  },
  {
    title: "Learning Modules",
    icon: GraduationCap,
    id: "modules",
    path: "/teacher/learning-module",
  },
  {
    title: "Student Analytics",
    icon: BarChart3,
    id: "analytics",
    path: "/teacher/student-analytics",
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
        <SidebarGroupLabel>Content Creation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild isActive={pathname === item.path}>
                  <Link href={item.path} onClick={handleLinkClick}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    const { data: session, status } = useSession();
  
    console.log("[TeacherLayout] Session status:", status);
    console.log("[TeacherLayout] Session data:", session);
  
    if (status === "loading") {
      return <div>Loading...</div>;
    }
  
    if (status !== "authenticated" || session?.user?.role !== "teacher") {
      console.log("[TeacherLayout] Unauthorized, redirecting to /login");
      window.location.href = "/login";
      return null;
    }
  
    const handleLogout = async () => {
      console.log(
        "[TeacherLayout] Initiating logout, sessionToken:",
        session?.user?.sessionToken
      );
      try {
        const response = await fetch("/api/auth/logout-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
  
        console.log("[TeacherLayout] Logout API response status:", response.status);
        const data = await response.json();
        console.log("[TeacherLayout] Logout API response:", data);
  
        if (!response.ok) {
          console.error("[TeacherLayout] Logout failed:", data);
          throw new Error(data.error || "Logout failed");
        }
  
        console.log("[TeacherLayout] Logout successful, redirecting to /login");
        document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
        document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
        window.location.href = "/login";
      } catch (error) {
        console.error("[TeacherLayout] Logout error:", error);
        document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
        document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
        window.location.href = "/login";
      }
    };
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">EduPlatform</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Teacher
              </span>
            </div>
          </SidebarHeader>
          <SidebarMenuContent />
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg?height=24&width=24" />
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                      <span>Dr. Sarah Wilson</span>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1"></div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
