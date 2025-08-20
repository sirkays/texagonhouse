"use client"

import { useState } from "react"
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
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { TeacherOverview } from "./teacher-overview"
import { TeacherCBTCreator } from "./teacher-cbt-creator"
import { TeacherResourceManager } from "./teacher-resource-manager"
import { TeacherLearningModules } from "./teacher-learning-modules"
import { MaterialUploader } from "../student/material-uploader"
import { StudentAnalytics } from "../admin/student-analytics"
import { VideoLessonCreator } from "./video-lesson-creator"
import { LiveSessionManager } from "./live-session-manager"

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
]

export function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <TeacherOverview />
      case "cbt-creator":
        return <TeacherCBTCreator />
      case "video-lessons":
        return <VideoLessonCreator />
      case "live-sessions":
        return <LiveSessionManager />
      case "uploader":
        return <MaterialUploader />
      case "resources":
        return <TeacherResourceManager />
      case "modules":
        return <TeacherLearningModules />
      case "analytics":
        return <StudentAnalytics />
      default:
        return <TeacherOverview />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">EduPlatform</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Teacher</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Content Creation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton isActive={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
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
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search content, students..." className="pl-8" />
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
