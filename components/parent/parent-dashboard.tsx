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

// const menuItems = [
//   {
//     title: "Dashboard",
//     icon: Home,
//     id: "dashboard",
//   },
//   {
//     title: "Children Progress",
//     icon: BarChart3,
//     id: "progress",
//   },
//   {
//     title: "Manage Children",
//     icon: Baby,
//     id: "children",
//   },
//   {
//     title: "Tutoring Sessions",
//     icon: Calendar,
//     id: "tutoring",
//   },
//   {
//     title: "Rewards & Achievements",
//     icon: Trophy,
//     id: "rewards",
//   },
//   {
//     title: "Payment History",
//     icon: CreditCard,
//     id: "payments",
//   },
// ];

export function ParentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  // const renderContent = () => {
  //   switch (activeSection) {
  //     case "dashboard":
  //       return <ParentOverview />;
  //     case "progress":
  //       return <ChildrenProgress />;
  //     case "children":
  //       return <ChildAccountManager />;
  //     case "tutoring":
  //       return <TutoringBooking />;
  //     case "rewards":
  //       return <RewardsTracking />;
  //     case "payments":
  //       return <PaymentHistory />;
  //     default:
  //       return <ParentOverview />;
  //   }
  // };

  return <ParentOverview />; // Change to renderContent() when other components are ready
}
