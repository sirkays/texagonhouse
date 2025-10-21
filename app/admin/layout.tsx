// // "use client";

// // import {useState} from "react";
// // import {
// //   Home,
// //   Users,
// //   GraduationCap,
// //   BookOpen,
// //   ClipboardList,
// //   Calendar,
// //   CreditCard,
// //   ShoppingCart,
// //   Video,
// //   Award,
// //   Bell,
// //   Settings,
// //   LogOut,
// //   FileText,
// //   BarChart3,
// //   UserCircle,
// //   BookMarked,
// // } from "lucide-react";
// // import {
// //   Sidebar,
// //   SidebarContent,
// //   SidebarFooter,
// //   SidebarGroup,
// //   SidebarGroupContent,
// //   SidebarHeader,
// //   SidebarMenu,
// //   SidebarMenuButton,
// //   SidebarMenuItem,
// //   SidebarProvider,
// //   SidebarTrigger,
// //   useSidebar,
// // } from "@/components/ui/sidebar";
// // import {Button} from "@/components/ui/button";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuLabel,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import Link from "next/link";
// // import {usePathname} from "next/navigation";
// // import {useMediaQuery} from "react-responsive";

// // interface Organization {
// //   id: string;
// //   name: string;
// //   adminRole: string; // Assuming admin role or type for switching context
// // }

// // const availableOrganizations: Organization[] = [
// //   {id: "1", name: "Acme Corp", adminRole: "Primary Admin"},
// //   {id: "2", name: "Beta Inc", adminRole: "Secondary Admin"},
// //   {id: "3", name: "Gamma LLC", adminRole: "Full Admin"},
// // ];

// // const navigation = [
// //   {title: "Dashboard", icon: Home, id: "dashboard", path: "/admin"},
// //   {
// //     title: "Classrooms",
// //     icon: Users,
// //     id: "classrooms",
// //     path: "/admin/classrooms",
// //   },
// //   {
// //     title: "Students",
// //     icon: GraduationCap,
// //     id: "students",
// //     path: "/admin/students",
// //   },
// //   {title: "Teachers", icon: Users, id: "teachers", path: "/admin/teachers"},
// //   {title: "Parents", icon: UserCircle, id: "parents", path: "/admin/parents"},
// //   {
// //     title: "Subjects",
// //     icon: BookMarked,
// //     id: "subjects",
// //     path: "/admin/subjects",
// //   },
// //   {title: "Courses", icon: BookOpen, id: "courses", path: "/admin/courses"},
// //   {title: "Modules", icon: FileText, id: "modules", path: "/admin/modules"},
// //   {title: "Billing", icon: CreditCard, id: "billing", path: "/admin/billing"},
// //   {title: "Store", icon: ShoppingCart, id: "store", path: "/admin/store"},
// //   {
// //     title: "Gamification",
// //     icon: Award,
// //     id: "gamification",
// //     path: "/admin/gamification",
// //   },
// //   {title: "Reports", icon: BarChart3, id: "reports", path: "/admin/reports"},
// // ];

// // function SidebarMenuContent() {
// //   const pathname = usePathname();
// //   const {setOpenMobile, isMobile: isMobileFromSidebar} = useSidebar();
// //   const isMobile = useMediaQuery({maxWidth: 639});

// //   const handleLinkClick = () => {
// //     if (isMobile || isMobileFromSidebar) {
// //       setOpenMobile(false);
// //     }
// //   };

// //   return (
// //     <SidebarContent className="mt-4 bg-transparent">
// //       <SidebarGroup>
// //         <SidebarGroupContent>
// //           <SidebarMenu>
// //             {navigation.map((item) => (
// //               <SidebarMenuItem key={item.id}>
// //                 <SidebarMenuButton
// //                   asChild
// //                   isActive={pathname === item.path}
// //                   className={`
// //                     py-5
// //                     hover:bg-[#F797713a]
// //                     data-[active=true]:bg-[#EF7B553a]
// //                     data-[active=true]:text-slate-600
// //                     transition-colors
// //                     rounded-md
// //                   `}>
// //                   <Link
// //                     href={item.path}
// //                     onClick={handleLinkClick}
// //                     className="flex items-center gap-2">
// //                     <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-[#EF7B55]" />
// //                     <span className="text-[0.85rem] sm:text-sm">
// //                       {item.title}
// //                     </span>
// //                   </Link>
// //                 </SidebarMenuButton>
// //               </SidebarMenuItem>
// //             ))}
// //           </SidebarMenu>
// //         </SidebarGroupContent>
// //       </SidebarGroup>
// //     </SidebarContent>
// //   );
// // }

// // export default function DashboardLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const [currentOrg, setCurrentOrg] = useState<Organization>(
// //     availableOrganizations[0]
// //   );
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);

// //   const handleSwitchOrg = (org: Organization) => {
// //     setCurrentOrg(org);
// //     setIsDialogOpen(false);
// //     // Here you can add logic to persist the switch, e.g., API call or context update
// //     console.log(`Switched to organization: ${org.name} as ${org.adminRole}`);
// //   };

// //   return (
// //     <SidebarProvider className="bg-white">
// //       <div className="flex min-h-screen w-full font-sans">
// //         <Sidebar className="">
// //           <SidebarHeader className="bg-[#EF7B55] py-5">
// //             <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
// //               <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
// //               <span className="font-semibold text-white text-base sm:text-lg">
// //                 EduManage
// //               </span>
// //             </div>
// //           </SidebarHeader>
// //           <SidebarMenuContent />
// //           <SidebarFooter className="border border-t-[#EF7B553a] py-5">
// //             <SidebarMenu>
// //               <SidebarMenuItem>
// //                 <DropdownMenu>
// //                   <DropdownMenuTrigger asChild>
// //                     <SidebarMenuButton>
// //                       <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
// //                         <AvatarImage src="/placeholder.svg?height=24&width=24" />
// //                         <AvatarFallback className="text-[0.65rem] sm:text-xs">
// //                           AD
// //                         </AvatarFallback>
// //                       </Avatar>
// //                       <span className="text-xs sm:text-sm">
// //                         {currentOrg.name}
// //                       </span>
// //                       <Settings className="ml-auto h-3 w-3 sm:h-4 sm:w-4" />
// //                     </SidebarMenuButton>
// //                   </DropdownMenuTrigger>
// //                   <DropdownMenuContent
// //                     side="top"
// //                     className="w-[--radix-popper-anchor-width]">
// //                     <DropdownMenuItem className="text-[0.85rem] sm:text-sm text-destructive hover:bg-[#F797713a] focus:bg-[#F797713a]">
// //                       <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
// //                       Log out
// //                     </DropdownMenuItem>

// //                     <DropdownMenuItem
// //                       className="text-[0.85rem] sm:text-sm text-destructive hover:bg-[#F797713a] focus:bg-[#F797713a]"
// //                       onClick={() => setIsDialogOpen(true)}>
// //                       <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
// //                       Change Organisation
// //                     </DropdownMenuItem>
// //                   </DropdownMenuContent>
// //                 </DropdownMenu>
// //               </SidebarMenuItem>
// //             </SidebarMenu>
// //           </SidebarFooter>
// //         </Sidebar>

// //         <div className="flex-1 flex flex-col">
// //           <header className="sticky top-0 z-50 py-4">
// //             <style jsx>{`
// //               header {
// //                 background: rgba(
// //                   247,
// //                   151,
// //                   113,
// //                   0.3
// //                 ); /* Semi-transparent #F19212 */
// //                 backdrop-filter: blur(8px); /* Frosted glass effect */
// //                 -webkit-backdrop-filter: blur(8px); /* Safari compatibility */
// //                 position: sticky;
// //                 top: 0;
// //                 z-index: 50;
// //               }
// //               header > div {
// //                 position: relative;
// //                 z-index: 10;
// //                 background: transparent;
// //               }
// //             `}</style>
// //             <div className="flex h-12 sm:h-14 items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 text-slate-800">
// //               <SidebarTrigger className="hover:bg-transparent focus:bg-transparent active:bg-transparent" />
// //               <div className="flex-1 max-w-[90vw] sm:max-w-md"></div>
// //               <Button
// //                 variant="ghost"
// //                 size="icon"
// //                 className="p-1 sm:p-2 hover:bg-transparent focus:bg-transparent active:bg-transparent">
// //                 <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
// //               </Button>
// //             </div>
// //           </header>

// //           <main className="flex-1 p-3 sm:p-6">{children}</main>
// //         </div>
// //       </div>

// //       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
// //         <DialogContent className="sm:max-w-md">
// //           <DialogHeader>
// //             <DialogTitle>Switch Organisation</DialogTitle>
// //             <DialogDescription>
// //               Select an organisation to switch to. Your current admin role will
// //               be updated accordingly.
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="space-y-4 py-4">
// //             <div className="space-y-2">
// //               <label className="text-sm font-medium">
// //                 Current Organisation
// //               </label>
// //               <p className="text-sm text-muted-foreground">
// //                 {currentOrg.name} ({currentOrg.adminRole})
// //               </p>
// //             </div>
// //             <Select
// //               onValueChange={(value) => {
// //                 const selectedOrg = availableOrganizations.find(
// //                   (org) => org.id === value
// //                 );
// //                 if (selectedOrg) handleSwitchOrg(selectedOrg);
// //               }}>
// //               <SelectTrigger>
// //                 <SelectValue placeholder="Select organisation" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {availableOrganizations.map((org) => (
// //                   <SelectItem key={org.id} value={org.id}>
// //                     {org.name} ({org.adminRole})
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>
// //         </DialogContent>
// //       </Dialog>
// //     </SidebarProvider>
// //   );
// // }

// "use client";

// import {useState, useEffect} from "react";
// import {
//   Home,
//   Users,
//   GraduationCap,
//   BookOpen,
//   ClipboardList,
//   Calendar,
//   CreditCard,
//   ShoppingCart,
//   Video,
//   Award,
//   Bell,
//   Settings,
//   LogOut,
//   FileText,
//   BarChart3,
//   UserCircle,
//   BookMarked,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarTrigger,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import {Button} from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import Link from "next/link";
// import {usePathname} from "next/navigation";
// import {useMediaQuery} from "react-responsive";

// interface Organization {
//   id: number;
//   name: string;
//   slug: string;
// }

// const navigation = [
//   {title: "Dashboard", icon: Home, id: "dashboard", path: "/admin"},
//   {
//     title: "Classrooms",
//     icon: Users,
//     id: "classrooms",
//     path: "/admin/classrooms",
//   },
//   {
//     title: "Students",
//     icon: GraduationCap,
//     id: "students",
//     path: "/admin/students",
//   },
//   {title: "Teachers", icon: Users, id: "teachers", path: "/admin/teachers"},
//   {title: "Parents", icon: UserCircle, id: "parents", path: "/admin/parents"},
//   {
//     title: "Subjects",
//     icon: BookMarked,
//     id: "subjects",
//     path: "/admin/subjects",
//   },
//   {title: "Courses", icon: BookOpen, id: "courses", path: "/admin/courses"},
//   {title: "Modules", icon: FileText, id: "modules", path: "/admin/modules"},
//   {title: "Billing", icon: CreditCard, id: "billing", path: "/admin/billing"},
//   {
//     title: "Gamification",
//     icon: Award,
//     id: "gamification",
//     path: "/admin/gamification",
//   },
//   {title: "Store", icon: ShoppingCart, id: "store", path: "/admin/store"},
//   {title: "Reports", icon: BarChart3, id: "reports", path: "/admin/reports"},
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

//   return (
//     <SidebarContent className="mt-4 bg-transparent">
//       <SidebarGroup>
//         <SidebarGroupContent>
//           <SidebarMenu>
//             {navigation.map((item) => (
//               <SidebarMenuItem key={item.id}>
//                 <SidebarMenuButton
//                   asChild
//                   isActive={pathname === item.path}
//                   className={`
//                     py-5
//                     hover:bg-[#F797713a]
//                     data-[active=true]:bg-[#EF7B553a]
//                     data-[active=true]:text-slate-600
//                     transition-colors
//                     rounded-md
//                   `}>
//                   <Link
//                     href={item.path}
//                     onClick={handleLinkClick}
//                     className="flex items-center gap-2">
//                     <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-[#EF7B55]" />
//                     <span className="text-[0.85rem] sm:text-sm">
//                       {item.title}
//                     </span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             ))}
//           </SidebarMenu>
//         </SidebarGroupContent>
//       </SidebarGroup>
//     </SidebarContent>
//   );
// }

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [availableOrganizations, setAvailableOrganizations] = useState<
//     Organization[]
//   >([]);
//   const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchOrgs = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch("/api/admin/access-orgs");
//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to fetch organizations");
//       }

//       setAvailableOrganizations(data.organizations || []);
//       setCurrentOrg(data.selected_organization || null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//       console.error("Error fetching organizations:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrgs();
//   }, []);

//   const handleSwitchOrg = async (orgId: number) => {
//     if (!orgId) return;

//     try {
//       const res = await fetch("/api/admin/access-orgs", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({orgs_id: orgId}),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to switch organization");
//       }

//       // Refetch to update state
//       await fetchOrgs();
//       setIsDialogOpen(false);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//       console.error("Error switching organization:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Loading...
//       </div>
//     );
//   }

//   if (error || !currentOrg) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-red-500">
//         Error: {error || "No organizations available"}
//       </div>
//     );
//   }

//   return (
//     <SidebarProvider className="bg-white">
//       <div className="flex min-h-screen w-full font-sans">
//         <Sidebar className="">
//           <SidebarHeader className="bg-[#EF7B55] py-5">
//             <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
//               <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//               <span className="font-semibold text-white text-base sm:text-lg">
//                 EduManage
//               </span>
//             </div>
//           </SidebarHeader>
//           <SidebarMenuContent />
//           <SidebarFooter className="border border-t-[#EF7B553a] py-5">
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <SidebarMenuButton>
//                       <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
//                         <AvatarImage src="/placeholder.svg?height=24&width=24" />
//                         <AvatarFallback className="text-[0.65rem] sm:text-xs">
//                           AD
//                         </AvatarFallback>
//                       </Avatar>
//                       <span className="text-xs sm:text-sm">
//                         {currentOrg.name}
//                       </span>
//                       <Settings className="ml-auto h-3 w-3 sm:h-4 sm:w-4" />
//                     </SidebarMenuButton>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     side="top"
//                     className="w-[--radix-popper-anchor-width]">
//                     <DropdownMenuItem className="text-[0.85rem] sm:text-sm text-destructive hover:bg-[#F797713a] focus:bg-[#F797713a]">
//                       <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
//                       Log out
//                     </DropdownMenuItem>

//                     <DropdownMenuItem
//                       className="text-[0.85rem] sm:text-sm text-destructive hover:bg-[#F797713a] focus:bg-[#F797713a]"
//                       onClick={() => setIsDialogOpen(true)}>
//                       <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
//                       Change Organisation
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarFooter>
//         </Sidebar>

//         <div className="flex-1 flex flex-col">
//           <header className="sticky top-0 z-50 py-4">
//             <style jsx>{`
//               header {
//                 background: rgba(
//                   247,
//                   151,
//                   113,
//                   0.3
//                 ); /* Semi-transparent #F19212 */
//                 backdrop-filter: blur(8px); /* Frosted glass effect */
//                 -webkit-backdrop-filter: blur(8px); /* Safari compatibility */
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
//             <div className="flex h-12 sm:h-14 items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 text-slate-800">
//               <SidebarTrigger className="hover:bg-transparent focus:bg-transparent active:bg-transparent" />
//               <div className="flex-1 max-w-[90vw] sm:max-w-md"></div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="p-1 sm:p-2 hover:bg-transparent focus:bg-transparent active:bg-transparent">
//                 <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </header>

//           <main className="flex-1 p-3 sm:p-6">{children}</main>
//         </div>
//       </div>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Switch Organisation</DialogTitle>
//             <DialogDescription>
//               Select an organisation to switch to.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">
//                 Current Organisation
//               </label>
//               <p className="text-sm text-muted-foreground">{currentOrg.name}</p>
//             </div>
//             <Select
//               value={currentOrg.id.toString()}
//               onValueChange={(value) => handleSwitchOrg(parseInt(value))}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select organisation" />
//               </SelectTrigger>
//               <SelectContent>
//                 {availableOrganizations.map((org) => (
//                   <SelectItem key={org.id} value={org.id.toString()}>
//                     {org.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </SidebarProvider>
//   );
// }

// "use client";

// import {useState, useEffect} from "react";
// import {
//   Home,
//   Users,
//   GraduationCap,
//   BookOpen,
//   ClipboardList,
//   Calendar,
//   CreditCard,
//   ShoppingCart,
//   Video,
//   Award,
//   Bell,
//   Settings,
//   LogOut,
//   FileText,
//   BarChart3,
//   UserCircle,
//   BookMarked,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarTrigger,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import {Button} from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// import {Spinner} from "@/components/ui/spinner";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import Link from "next/link";
// import {usePathname} from "next/navigation";
// import {useMediaQuery} from "react-responsive";
// import {useSession} from "next-auth/react";

// interface Organization {
//   id: number;
//   name: string;
//   slug: string;
// }

// const navigation = [
//   {title: "Dashboard", icon: Home, id: "dashboard", path: "/admin"},
//   {
//     title: "Classrooms",
//     icon: Users,
//     id: "classrooms",
//     path: "/admin/classrooms",
//   },
//   {
//     title: "Students",
//     icon: GraduationCap,
//     id: "students",
//     path: "/admin/students",
//   },
//   {title: "Teachers", icon: Users, id: "teachers", path: "/admin/teachers"},
//   {title: "Parents", icon: UserCircle, id: "parents", path: "/admin/parents"},
//   {
//     title: "Subjects",
//     icon: BookMarked,
//     id: "subjects",
//     path: "/admin/subjects",
//   },
//   {title: "Courses", icon: BookOpen, id: "courses", path: "/admin/courses"},
//   {title: "Modules", icon: FileText, id: "modules", path: "/admin/modules"},
//   {title: "Billing", icon: CreditCard, id: "billing", path: "/admin/billing"},
//   {
//     title: "Gamification",
//     icon: Award,
//     id: "gamification",
//     path: "/admin/gamification",
//   },
//   {title: "Store", icon: ShoppingCart, id: "store", path: "/admin/store"},
//   {title: "Reports", icon: BarChart3, id: "reports", path: "/admin/reports"},
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

//   return (
//     <SidebarContent className="mt-4 bg-transparent">
//       <SidebarGroup>
//         <SidebarGroupContent>
//           <SidebarMenu>
//             {navigation.map((item) => (
//               <SidebarMenuItem key={item.id}>
//                 <SidebarMenuButton
//                   asChild
//                   isActive={pathname === item.path}
//                   className={`
//                     py-5
//                     hover:bg-[#F797713a]
//                     data-[active=true]:bg-[#EF7B553a]
//                     data-[active=true]:text-slate-600
//                     transition-colors
//                     rounded-md
//                   `}>
//                   <Link
//                     href={item.path}
//                     onClick={handleLinkClick}
//                     className="flex items-center gap-2">
//                     <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-[#EF7B55]" />
//                     <span className="text-[0.85rem] sm:text-sm">
//                       {item.title}
//                     </span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             ))}
//           </SidebarMenu>
//         </SidebarGroupContent>
//       </SidebarGroup>
//     </SidebarContent>
//   );
// }

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const {data: session, status} = useSession();
//   const [availableOrganizations, setAvailableOrganizations] = useState<
//     Organization[]
//   >([]);
//   const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   console.log("[AdminLayout] Session status:", status);
//   console.log("[AdminLayout] Session data:", session);

//   if (status === "loading") {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-background">
//         <Spinner size="md" className="text-black" />
//       </div>
//     );
//   }

//   if (status !== "authenticated" || session?.user?.role !== "admin") {
//     console.log("[AdminLayout] Unauthorized, redirecting to /login");
//     window.location.href = "/login";
//     return null;
//   }

//   const fetchOrgs = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch("/api/admin/access-orgs");
//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to fetch organizations");
//       }

//       setAvailableOrganizations(data.organizations || []);
//       setCurrentOrg(data.selected_organization || null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//       console.error("Error fetching organizations:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrgs();
//   }, []);

//   const handleLogout = async () => {
//     console.log(
//       "[AdminLayout] Initiating logout, sessionToken:",
//       session?.user?.sessionToken
//     );
//     try {
//       const response = await fetch("/api/auth/logout-route", {
//         method: "POST",
//         headers: {"Content-Type": "application/json"},
//       });

//       console.log("[AdminLayout] Logout API response status:", response.status);
//       const data = await response.json();
//       console.log("[AdminLayout] Logout API response:", data);

//       if (!response.ok) {
//         console.error("[AdminLayout] Logout failed:", data);
//         throw new Error(data.error || "Logout failed");
//       }

//       console.log("[AdminLayout] Logout successful, redirecting to /login");
//       document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
//       document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("[AdminLayout] Logout error:", error);
//       document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
//       document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
//       window.location.href = "/login";
//     }
//   };

//   const handleSwitchOrg = async (orgId: number) => {
//     if (!orgId) return;

//     try {
//       const res = await fetch("/api/admin/access-orgs", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({orgs_id: orgId}),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to switch organization");
//       }

//       // Refetch to update state
//       await fetchOrgs();
//       setIsDialogOpen(false);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//       console.error("Error switching organization:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Loading...
//       </div>
//     );
//   }

//   if (error || !currentOrg) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-red-500">
//         Error: {error || "No organizations available"}
//       </div>
//     );
//   }

//   return (
//     <SidebarProvider className="bg-white">
//       <div className="flex min-h-screen w-full font-sans">
//         <Sidebar className="">
//           <SidebarHeader className="bg-[#EF7B55] py-5">
//             <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
//               <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//               <span className="font-semibold text-white text-base sm:text-lg">
//                 EduManage
//               </span>
//             </div>
//           </SidebarHeader>
//           <SidebarMenuContent />
//           <SidebarFooter className="border border-t-[#EF7B553a] py-5">
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <SidebarMenuButton>
//                       <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
//                         <AvatarImage src="/placeholder.svg?height=24&width=24" />
//                         <AvatarFallback className="text-[0.65rem] sm:text-xs">
//                           {session?.user?.name?.[0] || "AD"}
//                         </AvatarFallback>
//                       </Avatar>
//                       <span className="text-xs sm:text-sm">
//                         {session?.user?.name || currentOrg.name}
//                       </span>
//                       <Settings className="ml-auto h-3 w-3 sm:h-4 sm:w-4" />
//                     </SidebarMenuButton>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     side="top"
//                     className="w-[--radix-popper-anchor-width]">
//                     <DropdownMenuItem
//                       className="text-[0.85rem] sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]"
//                       onClick={handleLogout}>
//                       <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
//                       Log out
//                     </DropdownMenuItem>

//                     <DropdownMenuItem
//                       className="text-[0.85rem] sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]"
//                       onClick={() => setIsDialogOpen(true)}>
//                       <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
//                       Change Organisation
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarFooter>
//         </Sidebar>

//         <div className="flex-1 flex flex-col">
//           <header className="sticky top-0 z-50 py-4">
//             <style jsx>{`
//               header {
//                 background: rgba(
//                   247,
//                   151,
//                   113,
//                   0.3
//                 ); /* Semi-transparent #F19212 */
//                 backdrop-filter: blur(8px); /* Frosted glass effect */
//                 -webkit-backdrop-filter: blur(8px); /* Safari compatibility */
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
//             <div className="flex h-12 sm:h-14 items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 text-slate-800">
//               <SidebarTrigger className="hover:bg-transparent focus:bg-transparent active:bg-transparent" />
//               <div className="flex-1 max-w-[90vw] sm:max-w-md"></div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="p-1 sm:p-2 hover:bg-transparent focus:bg-transparent active:bg-transparent">
//                 <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </header>

//           <main className="flex-1 p-3 sm:p-6">{children}</main>
//         </div>
//       </div>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Switch Organisation</DialogTitle>
//             <DialogDescription>
//               Select an organisation to switch to.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">
//                 Current Organisation
//               </label>
//               <p className="text-sm text-muted-foreground">{currentOrg.name}</p>
//             </div>
//             <Select
//               value={currentOrg.id.toString()}
//               onValueChange={(value) => handleSwitchOrg(parseInt(value))}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select organisation" />
//               </SelectTrigger>
//               <SelectContent>
//                 {availableOrganizations.map((org) => (
//                   <SelectItem key={org.id} value={org.id.toString()}>
//                     {org.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </SidebarProvider>
//   );
// }

"use client";

import {useState, useEffect} from "react";
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
import {Spinner} from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useMediaQuery} from "react-responsive";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

interface Organization {
  id: number;
  name: string;
  slug: string;
}

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
  {title: "Billing", icon: CreditCard, id: "billing", path: "/admin/billing"},
  {
    title: "Gamification",
    icon: Award,
    id: "gamification",
    path: "/admin/gamification",
  },
  {title: "Store", icon: ShoppingCart, id: "store", path: "/admin/store"},
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
  // All hooks at the top, unconditionally
  const {data: session, status} = useSession();
  const router = useRouter();
  const [availableOrganizations, setAvailableOrganizations] = useState<
    Organization[]
  >([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("[AdminLayout] Session status:", status);
  console.log("[AdminLayout] Session data:", session);

  // Handle auth redirect in useEffect (after all hooks)
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    ) {
      console.log("[AdminLayout] Unauthorized, redirecting to /login");
      router.push("/login");
    }
  }, [status, session, router]);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/access-orgs");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch organizations");
      }

      setAvailableOrganizations(data.organizations || []);
      setCurrentOrg(data.selected_organization || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orgs only when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchOrgs();
    }
  }, [status]);

  const handleLogout = async () => {
    console.log(
      "[AdminLayout] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });

      console.log("[AdminLayout] Logout API response status:", response.status);
      const data = await response.json();
      console.log("[AdminLayout] Logout API response:", data);

      if (!response.ok) {
        console.error("[AdminLayout] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }

      console.log("[AdminLayout] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      router.push("/login");
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      router.push("/login");
    }
  };

  const handleSwitchOrg = async (orgId: number) => {
    if (!orgId) return;

    try {
      const res = await fetch("/api/admin/access-orgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({orgs_id: orgId}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to switch organization");
      }

      // Refetch to update state
      await fetchOrgs();
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error switching organization:", err);
    }
  };

  // Conditionals after all hooks
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-black" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error || !currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error || "No organizations available"}
      </div>
    );
  }

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
                          {session?.user?.name?.[0] || "AD"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm">
                        {session?.user?.name || currentOrg.name}
                      </span>
                      <Settings className="ml-auto h-3 w-3 sm:h-4 sm:w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]">
                    <DropdownMenuItem
                      className="text-[0.85rem] sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]"
                      onClick={handleLogout}>
                      <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Log out
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-[0.85rem] sm:text-sm hover:bg-[#F797713a] focus:bg-[#F797713a]"
                      onClick={() => setIsDialogOpen(true)}>
                      <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Change Organisation
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch Organisation</DialogTitle>
            <DialogDescription>
              Select an organisation to switch to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Current Organisation
              </label>
              <p className="text-sm text-muted-foreground">{currentOrg.name}</p>
            </div>
            <Select
              value={currentOrg.id.toString()}
              onValueChange={(value) => handleSwitchOrg(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select organisation" />
              </SelectTrigger>
              <SelectContent>
                {availableOrganizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
