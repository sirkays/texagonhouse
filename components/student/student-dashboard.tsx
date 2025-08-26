"use client";

import { useState } from "react";
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

import { DashboardOverview } from "./dashboard-overview";
import { CodeEditor } from "./code-editor";
import { CBTTest } from "./cbt-test";
import { ResourceMaterials } from "./resource-materials";
import { LearningModules } from "./learning-modules";
import { MyMaterials } from "./my-materials";
import { Achievements } from "./achievements";
import { Leaderboard } from "./leaderboard";

export function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "ide":
        return <CodeEditor />;
      case "cbt":
        return <CBTTest />;
      case "materials":
        return <MyMaterials />;
      case "resources":
        return <ResourceMaterials />;
      case "modules":
        return <LearningModules />;
      case "achievements":
        return <Achievements />;
      case "leaderboard":
        return <Leaderboard />;
      default:
        return <DashboardOverview />;
    }
  };

  return <DashboardOverview />;
}
