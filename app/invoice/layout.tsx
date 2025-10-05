"use client";

import {
  BarChart3,
  CreditCard,
  FileText,
  MessageSquare,
  Home,
  Settings,
  Building2,
  Receipt,
  Bell,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useMediaQuery} from "react-responsive";
import {useState} from "react";

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

function SidebarMenuContent() {
  const pathname = usePathname();
  const {setOpenMobile, isMobile: isMobileFromSidebar} = useSidebar();
  const isMobile = useMediaQuery({maxWidth: 639});
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleLinkClick = () => {
    if (isMobile || isMobileFromSidebar) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarContent className="mt-4 bg-transparent px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between py-5 h-10 px-3 rounded-md hover:bg-[#F797713a] text-[0.85rem] xs:text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider"
            onClick={() => setIsNavOpen(!isNavOpen)}>
            Navigation
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isNavOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-56 bg-white rounded-md shadow-lg p-2">
          {navigationItems.map((item) => (
            <DropdownMenuItem
              key={item.title}
              asChild
              className={`
                py-2 px-3 rounded-md
                hover:bg-[#F797713a]
                ${pathname === item.url ? "bg-[#EF7B553a] text-slate-600" : ""}
                transition-colors
              `}>
              <Link
                href={item.url}
                onClick={handleLinkClick}
                className="flex items-center justify-between w-full"
                title={item.description}>
                <div className="flex items-center gap-2">
                  <item.icon className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
                  <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                    {item.title}
                  </span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badge === "New" ? "default" : "secondary"}
                    className="text-xs h-5 px-2 ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <SidebarSeparator className="my-2" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between py-5 h-10 px-3 rounded-md hover:bg-[#F797713a] text-[0.85rem] xs:text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider"
            onClick={() => setIsSupportOpen(!isSupportOpen)}>
            Support & Settings
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isSupportOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-56 bg-white rounded-md shadow-lg p-2">
          {supportItems.map((item) => (
            <DropdownMenuItem
              key={item.title}
              asChild
              className={`
                py-2 px-3 rounded-md
                hover:bg-[#F797713a]
                ${pathname === item.url ? "bg-[#EF7B553a] text-slate-600" : ""}
                transition-colors
              `}>
              <Link
                href={item.url}
                onClick={handleLinkClick}
                className="flex items-center justify-between w-full"
                title={item.description}>
                <div className="flex items-center gap-2">
                  <item.icon className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
                  <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                    {item.title}
                  </span>
                </div>
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="text-xs h-5 px-2 ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarContent>
  );
}

export default function FinanceLayout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider className="bg-white">
      <div className="flex min-h-screen w-full font-sans">
        <Sidebar className="border-r-0 shadow-sm">
          <SidebarHeader className="bg-[#EF7B55] py-5">
            <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
              <Building2 className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold text-white text-base xs:text-lg">
                  TECHXAGON
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarMenuContent />
          <SidebarFooter className="border border-t-[#EF7B553a] py-5">
            <div className="p-4 space-y-3">
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Last sync:</span>
                  <span className="font-medium">2 min ago</span>
                </div>
              </div>
            </div>
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
              <div className="flex-1 max-w-[90vw] xs:max-w-md"></div>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 xs:p-2 hover:bg-transparent focus:bg-transparent active:bg-transparent">
                <Bell className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-3 xs:p-4 sm:p-6">
            <div className="flex items-center text-slate-900 mb-5 cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
