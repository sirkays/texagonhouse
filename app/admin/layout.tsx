"use client";

import {
  Users,
  School,
  GraduationCap,
  Home,
  Settings,
  BarChart3,
  User,
  Bell,
  ChevronDown,
  Building2,
  UserCheck,
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
import { useSession } from "next-auth/react";

const menuItems = [
  { title: "Dashboard", icon: Home, id: "dashboard", path: "/admin" },
  {
    title: "School Management",
    icon: Building2,
    id: "schools",
    path: "/admin/schools",
  },
  {
    title: "Teacher Management",
    icon: UserCheck,
    id: "teachers",
    path: "/admin/teachers",
  },
  {
    title: "Student Management",
    icon: Users,
    id: "students",
    path: "/admin/students",
  },
  {
    title: "Subscriptions",
    icon: School,
    id: "subscriptions",
    path: "/admin/subscriptions",
  },
  {
    title: "System Analytics",
    icon: BarChart3,
    id: "analytics",
    path: "/admin/analytics",
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  console.log("[AdminLayout] Session status:", status);
  console.log("[AdminLayout] Session data:", session);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    console.log("[AdminLayout] Unauthorized, redirecting to /login");
    window.location.href = "/login";
    return null;
  }

  const handleLogout = async () => {
    console.log(
      "[AdminLayout] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      console.log("[AdminLayout] Logout API response status:", response.status);
      const data = await response.json();
      console.log("[AdminLayout] Logout API response:", data);

      if (!response.ok) {
        console.error("[AdminLayout] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }

      console.log("[AdminLayout] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);
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
                Admin
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
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-12 xs:h-14 items-center justify-between gap-2 xs:gap-4 px-3 xs:px-4 sm:px-6">
              <SidebarTrigger className="" />
              <Button variant="ghost" size="icon" className="p-1 xs:p-2">
                <Bell className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-3 xs:p-4 sm:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
