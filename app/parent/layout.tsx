// texagonui\app\parent
"use client";

import Image from "next/image";
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
  LogOut,
  Receipt,
  FileText,
  MessageSquare,
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
import {signOut, useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";
import {useNotificationStore} from "../stores/notificationStore";
import {createContext, useContext, useEffect, useState} from "react";

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
    title: "Payments",
    path: "/invoice/invoices",
    icon: Receipt,
    description: "Create and manage invoices",
    badge: "New",
    id: "payments",
  },
  {
    title: "Reports",
    path: "/parent/reports",
    icon: FileText,
    description: "View your children's reports",
    id: "reports",
  },
  {
    title: "Profile Settings",
    path: "/profile",
    icon: Settings,
    description: "Manage your profile settings",
    id: "profile",
  },
];

const LoadingContext = createContext<{
  setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

function SidebarMenuContent() {
  const pathname = usePathname();
  const {setOpenMobile, isMobile: isMobileFromSidebar} = useSidebar();
  const isMobile = useMediaQuery({maxWidth: 639});
  const {setIsNavigating} = useContext(LoadingContext)!;

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
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={item.path === "/parent/reports" ? pathname.startsWith("/parent/reports") : pathname === item.path}
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
                    onClick={() => {
                      handleLinkClick();
                      if (pathname !== item.path) {
                        setIsNavigating(true);
                      }
                    }}
                    className="flex items-center gap-2">
                    <item.icon className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
                    <span className="text-[0.85rem] xs:text-xs sm:text-sm">
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

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-[#EF7B55]">
      <Image
        src="/texagon-logo.png"
        alt="Techxagon Logo"
        width={64}
        height={64}
        className="animate-pulse object-contain"
      />
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold tracking-wide">Techxagon</span>
        <Spinner size="md" className="text-[#EF7B55]" />
      </div>
      <p className="text-sm text-slate-500">Loading content...</p>
    </div>
  );
}

export default function ParentLayout({children}: {children: React.ReactNode}) {
  const {data: session, status} = useSession();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
        <Spinner size="md" />
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "parent") {
    window.location.href = "/login";
    return null;
  }

  const handleLogout = async () => {
    try {
      // 1. Call your custom backend logout
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });

      if (!response.ok) {
        console.error("[AdminLayout] Backend logout failed");
      }

      await signOut({redirect: false});

      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);

      // Fallback: Ensure the user is still visually logged out if an error occurs
      await signOut({redirect: false});
      window.location.href = "/login";
    }
  };

  return (
    <SidebarProvider className="bg-white">
      <LoadingContext.Provider value={{setIsNavigating}}>
        <div className="flex min-h-screen w-full font-sans">
          <Sidebar className="">
            <SidebarHeader className="bg-[#EF7B55] py-5">
              <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
                <Image
                  src="/texagon-logo.png"
                  alt="Techxagon Logo"
                  width={28}
                  height={28}
                  className="shrink-0 object-contain brightness-0 invert"
                />
                <span className="font-semibold text-white text-base xs:text-lg">
                  Techxagon
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
                        <Avatar className="h-5 w-5 xs:h-6 xs:w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback className="xs:text-[0.65rem] sm:text-xs">
                            {session?.user?.name?.[0] || "JD"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="xs:text-xs sm:text-sm">
                          {session?.user?.name || "John Doe"}
                        </span>
                        <ChevronDown className="ml-auto h-3 w-3 xs:h-4 xs:w-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      className="w-[--radix-popper-anchor-width]">
                      <DropdownMenuItem
                        className="text-[0.85rem] xs:text-xs sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]"
                        onClick={handleLogout}>
                        <LogOut className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
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
                  background: rgba(247, 151, 113, 0.3);
                  backdrop-filter: blur(8px);
                  -webkit-backdrop-filter: blur(8px);
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
              <div className="flex h-12 xs:h-14 items-center justify-between gap-3 xs:gap-4 px-3 xs:px-4 sm:px-6 text-slate-800">
                <SidebarTrigger className="hover:bg-transparent focus:bg-transparent active:bg-transparent" />

                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-[#F797713a] transition-colors"
                    title="Notifications">
                    <Bell className="h-4 w-4 text-[#EF7B55]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 right-2 bg-orange-500 text-white text-[10px] xs:text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </header>

            <main className="flex-1 p-3 xs:p-4 sm:p-6">
              {isNavigating ? <PageLoader /> : children}
            </main>
          </div>
        </div>
      </LoadingContext.Provider>
    </SidebarProvider>
  );
}
