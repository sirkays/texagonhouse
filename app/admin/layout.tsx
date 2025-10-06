"use client";

import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  CreditCard,
  ShoppingCart,
  Video,
  Award,
  Bell,
  Settings,
  LogOut,
  FileText,
  BarChart3,
  UserCircle,
  BookMarked,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useMediaQuery} from "react-responsive";

const navigation = [
  {title: "Dashboard", icon: Home, id: "dashboard", path: "/admin"},
  {
    title: "Classrooms",
    icon: Users,
    id: "classrooms",
    path: "/admin/classrooms",
  },
  {
    title: "Students",
    icon: GraduationCap,
    id: "students",
    path: "/admin/students",
  },
  {title: "Teachers", icon: Users, id: "teachers", path: "/admin/teachers"},
  {title: "Parents", icon: UserCircle, id: "parents", path: "/admin/parents"},
  {
    title: "Subjects",
    icon: BookMarked,
    id: "subjects",
    path: "/admin/subjects",
  },
  {title: "Courses", icon: BookOpen, id: "courses", path: "/admin/courses"},
  {title: "Modules", icon: FileText, id: "modules", path: "/admin/modules"},
  {title: "Tests", icon: ClipboardList, id: "tests", path: "/admin/tests"},
  {
    title: "Assignments",
    icon: FileText,
    id: "assignments",
    path: "/admin/assignments",
  },
  {
    title: "Attendance",
    icon: Calendar,
    id: "attendance",
    path: "/admin/attendance",
  },
  {
    title: "Live Sessions",
    icon: Video,
    id: "live-sessions",
    path: "/admin/live-sessions",
  },
  {
    title: "Tutoring",
    icon: GraduationCap,
    id: "tutoring",
    path: "/admin/tutoring",
  },
  {title: "Billing", icon: CreditCard, id: "billing", path: "/admin/billing"},
  {title: "Store", icon: ShoppingCart, id: "store", path: "/admin/store"},
  {
    title: "Gamification",
    icon: Award,
    id: "gamification",
    path: "/admin/gamification",
  },
  {title: "Reports", icon: BarChart3, id: "reports", path: "/admin/reports"},
];

function SidebarMenuContent() {
  const pathname = usePathname();
  const {setOpenMobile, isMobile: isMobileFromSidebar} = useSidebar();
  const isMobile = useMediaQuery({maxWidth: 639});

  const handleLinkClick = () => {
    if (isMobile || isMobileFromSidebar) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarContent className="mt-4 bg-transparent">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                  className={`
                    py-5
                    hover:bg-[#F797713a]
                    data-[active=true]:bg-[#EF7B553a]
                    data-[active=true]:text-slate-600
                    transition-colors
                    rounded-md
                  `}>
                  <Link
                    href={item.path}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2">
                    <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-[#EF7B55]" />
                    <span className="text-[0.85rem] sm:text-sm">
                      {item.title}
                    </span>
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-white">
      <div className="flex min-h-screen w-full font-sans">
        <Sidebar className="">
          <SidebarHeader className="bg-[#EF7B55] py-5">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              <span className="font-semibold text-white text-base sm:text-lg">
                EduManage
              </span>
            </div>
          </SidebarHeader>
          <SidebarMenuContent />
          <SidebarFooter className="border border-t-[#EF7B553a] py-5">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src="/placeholder.svg?height=24&width=24" />
                        <AvatarFallback className="text-[0.65rem] sm:text-xs">
                          AD
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm">Admin User</span>
                      <Settings className="ml-auto h-3 w-3 sm:h-4 sm:w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-[0.85rem] sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]">
                      <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[0.85rem] sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]">
                      <Bell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-[0.85rem] sm:text-sm text-destructive hover:bg-[#F797713a] focus:bg-[#F797713a]">
                      <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 py-4">
            <style jsx>{`
              header {
                background: rgba(
                  247,
                  151,
                  113,
                  0.3
                ); /* Semi-transparent #F19212 */
                backdrop-filter: blur(8px); /* Frosted glass effect */
                -webkit-backdrop-filter: blur(8px); /* Safari compatibility */
                position: sticky;
                top: 0;
                z-index: 50;
              }
              header > div {
                position: relative;
                z-index: 10;
                background: transparent;
              }
            `}</style>
            <div className="flex h-12 sm:h-14 items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 text-slate-800">
              <SidebarTrigger className="hover:bg-transparent focus:bg-transparent active:bg-transparent" />
              <div className="flex-1 max-w-[90vw] sm:max-w-md"></div>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 sm:p-2 hover:bg-transparent focus:bg-transparent active:bg-transparent">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
