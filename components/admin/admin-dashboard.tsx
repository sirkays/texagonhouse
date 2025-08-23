"use client";

import {useState} from "react";
import {
  Users,
  School,
  GraduationCap,
  Home,
  Settings,
  BarChart3,
  User,
  Search,
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

import {AdminOverview} from "./admin-overview";
import {SchoolManagement} from "./school-management";
import {TeacherManagement} from "./teacher-management";
import {StudentManagement} from "./student-management";
import {SystemAnalytics} from "./system-analytics";
import {SubscriptionManagement} from "./subscription-management";

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

  const renderContent = () => {
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
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r w-[200px] xs:w-[220px] sm:w-[250px] lg:w-[280px] hidden sm:flex">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
              <GraduationCap className="h-5 w-5 xs:h-6 xs:w-6 text-primary" />
              <span className="font-semibold text-base xs:text-lg">
                TECHXAGON
              </span>
              <span className="text-[0.65rem] xs:text-xs bg-red-100 text-red-800 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full">
                Admin
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs xs:text-sm">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="w-full text-xs xs:text-sm">
                        <item.icon className="h-3 w-3 xs:h-4 xs:w-4" />
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
                    <SidebarMenuButton className="text-xs xs:text-sm">
                      <Avatar className="h-5 w-5 xs:h-6 xs:w-6">
                        <AvatarImage src="/placeholder.svg?height=24&width=24" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <span>Admin User</span>
                      <ChevronDown className="ml-auto h-3 w-3 xs:h-4 xs:w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width] text-xs xs:text-sm">
                    <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                      System Settings
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
            <div className="flex h-12 xs:h-14 items-center justify-between gap-2 xs:gap-4 px-3 xs:px-4 sm:px-6">
              <SidebarTrigger className="sm:hidden" />
              {/* <div className="flex-1 max-w-[90vw] xs:max-w-md">
                <div className="relative">
                  <Search className="absolute left-2 top-1.5 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schools, users, analytics..."
                    className="pl-7 xs:pl-8 text-xs xs:text-sm"
                  />
                </div>
              </div> */}
              <Button variant="ghost" size="icon" className="p-1 xs:p-2">
                <Bell className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-3 xs:p-4 sm:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
