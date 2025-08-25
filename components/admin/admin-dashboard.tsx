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
import { useSession } from "next-auth/react";

// const menuItems = [
//   {
//     title: "Dashboard",
//     icon: Home,
//     id: "dashboard",
//   },
//   {
//     title: "School Management",
//     icon: Building2,
//     id: "schools",
//   },
//   {
//     title: "Teacher Management",
//     icon: UserCheck,
//     id: "teachers",
//   },
//   {
//     title: "Student Management",
//     icon: Users,
//     id: "students",
//   },
//   {
//     title: "Subscriptions",
//     icon: School,
//     id: "subscriptions",
//   },
//   {
//     title: "System Analytics",
//     icon: BarChart3,
//     id: "analytics",
//   },
// ];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  // const { data: session, status } = useSession();

  // console.log("[AdminDashboard] Session status:", status);
  // console.log("[AdminDashboard] Session data:", session);

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     console.log("[AdminDashboard] Redirecting to /login due to unauthenticated status");
  //     window.location.href = "/login";
  //   }
  // }, [status]);

  // const handleLogout = async () => {
  //   console.log("[AdminDashboard] Initiating logout, sessionToken:", session?.user?.sessionToken);
  //   try {
  //     const response = await fetch("/api/auth/logout-route", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     console.log("[AdminDashboard] Logout API response status:", response.status);
  //     const data = await response.json();
  //     console.log("[AdminDashboard] Logout API response:", data);

  //     if (!response.ok) {
  //       console.error("[AdminDashboard] Logout failed:", data);
  //       throw new Error(data.error || "Logout failed");
  //     }

  //     console.log("[AdminDashboard] Logout successful, redirecting to /login");
  //     document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
  //     document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
  //     window.location.href = "/login";
  //   } catch (error) {
  //     console.error("[AdminDashboard] Logout error:", error);
  //     document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
  //     document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
  //     window.location.href = "/login";
  //   }
  // };

  // if (status === "loading") {
  //   return <div>Loading...</div>;
  // }

  // if (status !== "authenticated" || session?.user?.role !== "admin") {
  //   console.log("[AdminDashboard] Unauthorized, redirecting to /login");
  //   return null; // Redirect handled by useEffect
  // }

  return <AdminOverview />


}