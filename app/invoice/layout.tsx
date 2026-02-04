// "use client";

// import {
//   BarChart3,
//   CreditCard,
//   FileText,
//   MessageSquare,
//   Home,
//   Settings,
//   Building2,
//   Receipt,
//   Bell,
//   ArrowLeft,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarProvider,
//   SidebarTrigger,
//   SidebarSeparator,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import Link from "next/link";
// import {usePathname} from "next/navigation";
// import {useMediaQuery} from "react-responsive";
// import {useRouter} from "next/navigation";
// import {useNotificationStore} from "../stores/notificationStore";

// const navigationItems = [
//   // {
//   //   title: "Dashboard",
//   //   url: "/invoice",
//   //   icon: Home,
//   //   description: "Overview and analytics",
//   //   badge: null,
//   // },
//   {
//     title: "Invoices",
//     url: "/invoice/invoices",
//     icon: Receipt,
//     description: "Create and manage invoices",
//     badge: null,
//   },
//   {
//     title: "Transactions",
//     url: "/invoice/transactions",
//     icon: FileText,
//     description: "Transaction history and details",
//     badge: null,
//   },
//   // {
//   //   title: "Payments",
//   //   url: "/invoice/payments",
//   //   icon: CreditCard,
//   //   description: "Payment tracking and status",
//   //   badge: "23",
//   // },
// ];

// const supportItems = [
//   {
//     title: "Complaints",
//     url: "/invoice/complaints",
//     icon: MessageSquare,
//     description: "Payment complaints and support",
//     badge: null,
//   },
//   // {
//   //   title: "Settings",
//   //   url: "/invoice/settings",
//   //   icon: Settings,
//   //   description: "Account and system settings",
//   //   badge: null,
//   // },
// ];

// function SidebarMenuContent() {
//   const pathname = usePathname();
//   const {setOpenMobile, isMobile: isMobileFromSidebar} = useSidebar();
//   const isMobile = useMediaQuery({maxWidth: 639});

//   const handleLinkClick = () => {
//     if (isMobile || isMobileFromSidebar) {
//       setOpenMobile(false);
//     }
//   };

//   const renderMenuItem = (item: (typeof navigationItems)[0]) => (
//     <Button
//       key={item.title}
//       variant="ghost"
//       asChild
//       className={`
//         w-full justify-start py-2 px-3 rounded-md
//         hover:bg-[#F797713a]
//         ${
//           pathname === item.url
//             ? "bg-[#EF7B553a] text-slate-600"
//             : "text-muted-foreground"
//         }
//         transition-colors
//         text-[0.85rem] xs:text-xs sm:text-sm font-medium
//       `}>
//       <Link
//         href={item.url}
//         onClick={handleLinkClick}
//         className="flex items-center justify-between w-full"
//         title={item.description}>
//         <div className="flex items-center gap-2">
//           <item.icon className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
//           <span>{item.title}</span>
//         </div>
//         {item.badge && (
//           <Badge
//             variant={
//               "Navigation".toLowerCase().includes(item.title.toLowerCase())
//                 ? item.badge === ""
//                   ? "default"
//                   : "secondary"
//                 : "destructive"
//             }
//             className="text-xs h-5 px-2 ml-auto">
//             {item.badge}
//           </Badge>
//         )}
//       </Link>
//     </Button>
//   );

//   return (
//     <SidebarContent className="mt-4 bg-transparent px-2">
//       {navigationItems.map(renderMenuItem)}
//       {supportItems.map(renderMenuItem)}
//     </SidebarContent>
//   );
// }

// export default function FinanceLayout({children}: {children: React.ReactNode}) {
//   const router = useRouter();
//   const unreadCount = useNotificationStore((s) => s.unreadCount);

//   return (
//     <SidebarProvider className="bg-white">
//       <div className="flex min-h-screen w-full font-sans">
//         <Sidebar className="border-r-0 shadow-sm">
//           <SidebarHeader className="bg-[#EF7B55] py-5">
//             <div className="flex items-center gap-2 px-3 xs:px-4 py-2">
//               <Building2 className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
//               <div className="grid flex-1 text-left leading-tight">
//                 <span className="truncate font-semibold text-white text-base xs:text-lg">
//                   TECHXAGON
//                 </span>
//               </div>
//             </div>
//           </SidebarHeader>
//           <SidebarMenuContent />
//           <SidebarFooter className="border border-t-[#EF7B553a] py-5">
//             <div className="p-4 space-y-3">
//               <div className="text-xs text-muted-foreground">
//                 <div className="flex items-center justify-between">
//                   <span>Last sync:</span>
//                   <span className="font-medium">2 min ago</span>
//                 </div>
//               </div>
//             </div>
//           </SidebarFooter>
//         </Sidebar>

//         <div className="flex-1 flex flex-col">
//           <header className="sticky top-0 z-50 py-4">
//             <style jsx>{`
//               header {
//                 background: rgba(247, 151, 113, 0.3);
//                 backdrop-filter: blur(8px);
//                 -webkit-backdrop-filter: blur(8px);
//                 position: sticky;
//                 top: 0;
//                 z-index: 50;
//               }
//               header > div {
//                 position: relative;
//                 z-index: 10;
//                 background: transparent;
//               }
//             `}</style>
//             <div className="flex h-12 xs:h-14 items-center justify-between gap-3 xs:gap-4 px-3 xs:px-4 sm:px-6 text-slate-800">
//               <SidebarTrigger className="hover:bg-transparent focus:bg-transparent active:bg-transparent" />
//               <div className="flex-1 max-w-[90vw] xs:max-w-md"></div>

//               <Link href="/notifications">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="relative p-1 xs:p-2 hover:bg-[#F797713a] focus:bg-transparent active:bg-transparent transition-colors"
//                   title="Notifications">
//                   <Bell className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] xs:text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
//                       {unreadCount > 99 ? "99+" : unreadCount}
//                     </span>
//                   )}
//                 </Button>
//               </Link>
//             </div>
//           </header>

//           <main className="flex-1 p-3 xs:p-4 sm:p-6">
//             <div
//               className="flex items-center text-slate-900 mb-5 cursor-pointer"
//               onClick={() => router.push("/parent")}>
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back to Dashboard
//             </div>
//             {children}
//           </main>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }

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
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useMediaQuery} from "react-responsive";
import {useRouter} from "next/navigation";
import {useNotificationStore} from "../stores/notificationStore";
import {createContext, useContext, useEffect, useState} from "react";
import {Spinner} from "@/components/ui/spinner";

const navigationItems = [
  // {
  //   title: "Dashboard",
  //   url: "/invoice",
  //   icon: Home,
  //   description: "Overview and analytics",
  //   badge: null,
  // },
  {
    title: "Invoices",
    url: "/invoice/invoices",
    icon: Receipt,
    description: "Create and manage invoices",
    badge: null,
  },
  {
    title: "Transactions",
    url: "/invoice/transactions",
    icon: FileText,
    description: "Transaction history and details",
    badge: null,
  },
  // {
  //   title: "Payments",
  //   url: "/invoice/payments",
  //   icon: CreditCard,
  //   description: "Payment tracking and status",
  //   badge: "23",
  // },
];

const supportItems = [
  {
    title: "Complaints",
    url: "/invoice/complaints",
    icon: MessageSquare,
    description: "Payment complaints and support",
    badge: null,
  },
  // {
  //   title: "Settings",
  //   url: "/invoice/settings",
  //   icon: Settings,
  //   description: "Account and system settings",
  //   badge: null,
  // },
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

  const renderMenuItem = (item: (typeof navigationItems)[0]) => (
    <Button
      key={item.title}
      variant="ghost"
      asChild
      className={`
        w-full justify-start py-2 px-3 rounded-md
        hover:bg-[#F797713a]
        ${
          pathname === item.url
            ? "bg-[#EF7B553a] text-slate-600"
            : "text-muted-foreground"
        }
        transition-colors
        text-[0.85rem] xs:text-xs sm:text-sm font-medium
      `}>
      <Link
        href={item.url}
        onClick={() => {
          handleLinkClick();
          if (pathname !== item.url) {
            setIsNavigating(true);
          }
        }}
        className="flex items-center justify-between w-full"
        title={item.description}>
        <div className="flex items-center gap-2">
          <item.icon className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
          <span>{item.title}</span>
        </div>
        {item.badge && (
          <Badge
            variant={
              "Navigation".toLowerCase().includes(item.title.toLowerCase())
                ? item.badge === ""
                  ? "default"
                  : "secondary"
                : "destructive"
            }
            className="text-xs h-5 px-2 ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    </Button>
  );

  return (
    <SidebarContent className="mt-4 bg-transparent px-2">
      {navigationItems.map(renderMenuItem)}
      {supportItems.map(renderMenuItem)}
    </SidebarContent>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-[#EF7B55]">
      <Building2 className="h-16 w-16 animate-pulse" strokeWidth={1.8} />
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold tracking-wide">TECHXAGON</span>
        <Spinner size="md" className="text-[#EF7B55]" />
      </div>
      <p className="text-sm text-slate-500">Loading content...</p>
    </div>
  );
}

export default function FinanceLayout({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <SidebarProvider className="bg-white">
      <LoadingContext.Provider value={{setIsNavigating}}>
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

                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative p-1 xs:p-2 hover:bg-[#F797713a] focus:bg-transparent active:bg-transparent transition-colors"
                    title="Notifications">
                    <Bell className="h-3 w-3 xs:h-4 xs:w-4 text-[#EF7B55]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] xs:text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </header>

            <main className="flex-1 p-3 xs:p-4 sm:p-6">
              <div
                className="flex items-center text-slate-900 mb-5 cursor-pointer"
                onClick={() => router.push("/parent")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </div>
              {isNavigating ? <PageLoader /> : children}
            </main>
          </div>
        </div>
      </LoadingContext.Provider>
    </SidebarProvider>
  );
}
