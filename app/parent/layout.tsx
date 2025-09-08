"use client";

import {
  CreditCard,
  GraduationCap,
  Home,
  Settings,
  BarChart3,
  User,
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
import {useSession} from "next-auth/react";

const menuItems = [
  {title: "Dashboard", icon: Home, id: "dashboard", path: "/parent"},
  {
    title: "Children Progress",
    icon: BarChart3,
    id: "progress",
    path: "/parent/progress",
  },
  {
    title: "Manage Children",
    icon: Baby,
    id: "children",
    path: "/parent/children",
  },
  {
    title: "Tutoring Sessions",
    icon: Calendar,
    id: "tutoring",
    path: "/parent/tutoring",
  },
  {
    title: "Rewards & Achievements",
    icon: Trophy,
    id: "rewards",
    path: "/parent/rewards",
  },
  {
    title: "Payment History",
    icon: CreditCard,
    id: "payments",
    path: "/parent/payments",
  },
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
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Parent Portal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                  className="w-full">
                  <Link href={item.path} onClick={handleLinkClick}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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

export default function ParentLayout({children}: {children: React.ReactNode}) {
  const {data: session, status} = useSession();

  console.log("[ParentLayout] Session status:", status);
  console.log("[ParentLayout] Session data:", session);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status !== "authenticated" || session?.user?.role !== "parent") {
    console.log("[ParentLayout] Unauthorized, redirecting to /login");
    window.location.href = "/login";
    return null;
  }

  const handleLogout = async () => {
    console.log(
      "[ParentLayout] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });

      console.log(
        "[ParentLayout] Logout API response status:",
        response.status
      );
      const data = await response.json();
      console.log("[ParentLayout] Logout API response:", data);

      if (!response.ok) {
        console.error("[ParentLayout] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }

      console.log("[ParentLayout] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[ParentLayout] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
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
          <SidebarMenuContent />
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
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 py-2 shadow-md border-b">
            <style jsx>{`
              header {
                background: rgba(
                  221,
                  38,
                  1,
                  0.3
                ); /* Semi-transparent white for glassy effect */
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
            <div className="flex h-14 items-center justify-between gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1"></div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
