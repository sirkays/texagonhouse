"use client"

import { useState } from "react"
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

import { DashboardOverview } from "./dashboard-overview"
import { CodeEditor } from "./code-editor"
import { CBTTest } from "./cbt-test"
import { ResourceMaterials } from "./resource-materials"
import { LearningModules } from "./learning-modules"
import { MyMaterials } from "./my-materials"
import { Achievements } from "./achievements"
import { Leaderboard } from "./leaderboard"

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "Code IDE",
    icon: Code,
    id: "ide",
  },
  {
    title: "CBT Tests",
    icon: TestTube,
    id: "cbt",
  },
  {
    title: "My Materials",
    icon: BookOpen,
    id: "materials",
  },
  {
    title: "Resources",
    icon: Book,
    id: "resources",
  },
  {
    title: "Learning Modules",
    icon: GraduationCap,
    id: "modules",
  },
  {
    title: "Achievements",
    icon: Trophy,
    id: "achievements",
  },
  {
    title: "Leaderboard",
    icon: Medal,
    id: "leaderboard",
  },
]

export function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />
      case "ide":
        return <CodeEditor />
      case "cbt":
        return <CBTTest />
      case "materials":
        return <MyMaterials />
      case "resources":
        return <ResourceMaterials />
      case "modules":
        return <LearningModules />
      case "achievements":
        return <Achievements />
      case "leaderboard":
        return <Leaderboard />
      default:
        return <DashboardOverview />
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
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span>John Doe</span>
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
                  <Input placeholder="Search courses, materials..." className="pl-8" />
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
