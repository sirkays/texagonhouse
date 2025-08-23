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
  Video,
  Calendar,
  Upload,
  BarChart3,
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

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
    path: "/student",
  },
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
    path: "/student/video-lessons",
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
    path: 'teacher/material-uploader'
  },
  {
    title: "Resources",
    icon: Book,
    id: "resources",
    path: "/teacher/resources",
  },
  {
    title: "Learning Modules",
    icon: GraduationCap,
    id: "modules",
    path: "/teacher/modules",
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
  const isMobile = useMediaQuery({ maxWidth: 639 }); // Matches Tailwind's `sm` breakpoint (640px)

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

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
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
                   <SidebarMenuButton>
                      <Avatar className="h-5 w-5 xs:h-6 xs:w-6">
                        <AvatarImage src="/placeholder.svg?height=24&width=24" />
                        <AvatarFallback className=" xs:text-[0.65rem] sm:text-xs">JD</AvatarFallback>
                      </Avatar>
                      <span className=" xs:text-xs sm:text-sm">John Doe</span>
                      <ChevronDown className="ml-auto h-3 w-3 xs:h-4 xs:w-4" />
                    </SidebarMenuButton>
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
    
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
}