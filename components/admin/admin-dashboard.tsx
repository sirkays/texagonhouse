"use client";

import { useState, useEffect } from "react";
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
import { AdminOverview } from "./admin-overview";
import { SchoolManagement } from "./school-management";
import { TeacherManagement } from "./teacher-management";
import { StudentManagement } from "./student-management";
import { SubscriptionManagement } from "./subscription-management";
import { SystemAnalytics } from "./system-analytics";
import { useSession, signOut } from "next-auth/react";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "School Management",
    icon: Building2,
    id: "schools",
  },
  {
    title: "Teacher Management",
    icon: UserCheck,
    id: "teachers",
  },
  {
    title: "Student Management",
    icon: Users,
    id: "students",
  },
  {
    title: "Subscriptions",
    icon: School,
    id: "subscriptions",
  },
  {
    title: "System Analytics",
    icon: BarChart3,
    id: "analytics",
  },
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { data: session, status } = useSession();

  console.log("[AdminDashboard] Session status:", status);
  console.log("[AdminDashboard] Session data:", session);

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("[AdminDashboard] Redirecting to /login due to unauthenticated status");
      window.location.href = "/login";
    }
  }, [status]);

  const handleLogout = async () => {
    console.log("[AdminDashboard] Initiating logout, sessionToken:", session?.user?.sessionToken);
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      console.log("[AdminDashboard] Logout API response status:", response.status);
      const data = await response.json();
      console.log("[AdminDashboard] Logout API response:", data);

      if (!response.ok) {
        console.error("[AdminDashboard] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }

      console.log("[AdminDashboard] Logout successful, redirecting to /login");
      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminDashboard] Logout error:", error);
      window.location.href = "/login"; // Redirect even on error
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    console.log("[AdminDashboard] Unauthorized, redirecting to /login");
    return null; // Redirect handled by useEffect
  }

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
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Content Creation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
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
                  <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
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
                    <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
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
          <main className="flex-1 p-3 xs:p-4 sm:p-6 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  );

  function renderContent() {
    switch (activeSection) {
      case "dashboard":
        return <AdminOverview />;
      case "schools":
        return <SchoolManagement />;
      case "teachers":
        return <TeacherManagement />;
      case "students":
        return <StudentManagement />;
      case "subscriptions":
        return <SubscriptionManagement />;
      case "analytics":
        return <SystemAnalytics />;
      default:
        return <AdminOverview />;
    }
  }
}