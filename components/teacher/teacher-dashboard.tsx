"use client";

import {useState} from "react";
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

import {TeacherOverview} from "./teacher-overview";
import {TeacherCBTCreator} from "./teacher-cbt-creator";
import {TeacherResourceManager} from "./teacher-resource-manager";
import {TeacherLearningModules} from "./teacher-learning-modules";
import {MaterialUploader} from "../student/material-uploader";
import {StudentAnalytics} from "../admin/student-analytics";
import {VideoLessonCreator} from "./video-lesson-creator";
import {LiveSessionManager} from "./live-session-manager";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "Create CBT",
    icon: TestTube,
    id: "cbt-creator",
  },
  {
    title: "Video Lessons",
    icon: Video,
    id: "video-lessons",
  },
  {
    title: "Live Sessions",
    icon: Calendar,
    id: "live-sessions",
  },
  {
    title: "Upload Materials",
    icon: Upload,
    id: "uploader",
  },
  {
    title: "Resource Manager",
    icon: Book,
    id: "resources",
  },
  {
    title: "Learning Modules",
    icon: GraduationCap,
    id: "modules",
  },
  {
    title: "Student Analytics",
    icon: BarChart3,
    id: "analytics",
  },
];

export function TeacherDashboard() {
  return <TeacherOverview />
}
