"use client";

import {useState} from "react";
import {
  CreditCard,
  GraduationCap,
  Home,
  Settings,
  BarChart3,
  User,
  Search,
  Bell,
  ChevronDown,
  Baby,
  Calendar,
  Trophy,
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

import {ParentOverview} from "./parent-overview";
import {ChildrenProgress} from "./children-progress";
import {PaymentHistory} from "./payment-history";
import {TutoringBooking} from "./tutoring-booking";
import {RewardsTracking} from "./rewards-tracking";
import {ChildAccountManager} from "./child-account-manager";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "Children Progress",
    icon: BarChart3,
    id: "progress",
  },
  {
    title: "Manage Children",
    icon: Baby,
    id: "children",
  },
  {
    title: "Tutoring Sessions",
    icon: Calendar,
    id: "tutoring",
  },
  {
    title: "Rewards & Achievements",
    icon: Trophy,
    id: "rewards",
  },
  {
    title: "Payment History",
    icon: CreditCard,
    id: "payments",
  },
];

export function ParentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <ParentOverview />;
      case "progress":
        return <ChildrenProgress />;
      case "children":
        return <ChildAccountManager />;
      case "tutoring":
        return <TutoringBooking />;
      case "rewards":
        return <RewardsTracking />;
      case "payments":
        return <PaymentHistory />;
      default:
        return <ParentOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">TECHXAGON</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Parent
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Parent Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="w-full">
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
                        <AvatarFallback>PT</AvatarFallback>
                      </Avatar>
                      <span>Parent User</span>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]">
                    <DropdownMenuLabel>Parent Account</DropdownMenuLabel>
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
          <header className="sticky top-0 z-50 bg-white shadow-md border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between gap-4 px-6">
              <SidebarTrigger />
              {/* <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search children, progress, payments..."
                    className="pl-8"
                  />
                </div>
              </div> */}
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
