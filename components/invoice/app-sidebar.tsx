"use client";

import {
  BarChart3,
  CreditCard,
  FileText,
  MessageSquare,
  Home,
  Settings,
  Building2,
  TrendingUp,
  Users,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {Badge} from "@/components/ui/badge";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/invoice",
    icon: Home,
    description: "Overview and analytics",
    badge: null,
  },
  {
    title: "Invoices",
    url: "/invoice/invoices",
    icon: Receipt,
    description: "Create and manage invoices",
    badge: "New",
  },
  {
    title: "Transactions",
    url: "/invoice/transactions",
    icon: FileText,
    description: "Transaction history and details",
    badge: null,
  },
  {
    title: "Payments",
    url: "/invoice/payments",
    icon: CreditCard,
    description: "Payment tracking and status",
    badge: "23",
  },
];

const supportItems = [
  {
    title: "Complaints",
    url: "/invoice/complaints",
    icon: MessageSquare,
    description: "Payment complaints and support",
    badge: "5",
  },
  {
    title: "Settings",
    url: "/invoice/settings",
    icon: Settings,
    description: "Account and system settings",
    badge: null,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" className="border-r-0 shadow-sm">
      <SidebarHeader className="border-b bg-gradient-to-r from-background to-background/50 backdrop-blur">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-bold text-lg">FinanceFlow</span>
            <span className="truncate text-xs text-muted-foreground font-medium">
              Professional Invoice Manager
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.description}
                    className="h-10 px-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 group">
                    <Link
                      href={item.url}
                      className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 transition-colors" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant={
                            item.badge === "New" ? "default" : "secondary"
                          }
                          className="text-xs h-5 px-2 ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Support & Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.description}
                    className="h-10 px-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200">
                    <Link
                      href={item.url}
                      className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="destructive"
                          className="text-xs h-5 px-2 ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-gradient-to-r from-background to-background/50 backdrop-blur">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold text-foreground">
                FinanceFlow Pro
              </div>
              <div className="text-muted-foreground">Version 3.2.1</div>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-success/10 text-success border-success/20">
              Online
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Last sync:</span>
              <span className="font-medium">2 min ago</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
