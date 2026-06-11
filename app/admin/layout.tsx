// texagon_academy\texagonui\app\admin\layout.tsx
"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
  UserCheck,
  Trophy,
  KeyRound,
  ArrowLeftRight,
  Eye,
  EyeOff,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
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
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "../stores/notificationStore";
import { createContext, useContext } from "react";

interface Organization {
  id: number;
  name: string;
  slug: string;
}

const navigation = [
  { title: "Dashboard", icon: Home, id: "dashboard", path: "/admin" },
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
  { title: "Teachers", icon: Users, id: "teachers", path: "/admin/teachers" },
  { title: "Parents", icon: UserCircle, id: "parents", path: "/admin/parents" },
  {
    title: "Subjects",
    icon: BookMarked,
    id: "subjects",
    path: "/admin/subjects",
  },
  { title: "Courses", icon: BookOpen, id: "courses", path: "/admin/courses" },
  { title: "Modules", icon: FileText, id: "modules", path: "/admin/modules" },
  {
    title: "Verify User",
    icon: UserCheck,
    id: "verify-user",
    path: "/admin/verify-user",
  },
  {
    title: "Login Generation",
    icon: Users,
    id: "login-generation",
    path: "/admin/login-generation",
  },
  {
    title: "Change Password",
    icon: KeyRound,
    id: "change-password",
    path: "/admin/change-password",
  },
  { title: "Billing", icon: CreditCard, id: "billing", path: "/admin/billing" },
  {
    title: "Gamification",
    icon: Award,
    id: "gamification",
    path: "/admin/gamification",
  },
  { title: "Certificate", icon: Award, id: "cert", path: "/admin/certificate" },
  { title: "Settings", icon: Settings, id: "settings", path: "/admin/settings" },
  { title: "Store", icon: ShoppingCart, id: "store", path: "/admin/store" },
  { title: "Reports", icon: BarChart3, id: "reports", path: "/admin/reports" },
  {
    title: "Leaderboard",
    icon: Trophy,
    id: "leaderboard",
    path: "/admin/reports/leaderboard",
  },
  {
    title: "Student Devices",
    icon: UserCheck,
    id: "student-devices",
    path: "/admin/student-devices",
  },
];

const LoadingContext = createContext<{
  setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

function SidebarMenuContent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile: isMobileFromSidebar } = useSidebar();
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const { setIsNavigating } = useContext(LoadingContext)!;

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
                    onClick={() => {
                      handleLinkClick();
                      if (pathname !== item.path) {
                        setIsNavigating(true);
                      }
                    }}
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // All hooks at the top, unconditionally
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availableOrganizations, setAvailableOrganizations] = useState<
    Organization[]
  >([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // ── Dashboard-switch password gate ──
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [switchPassword, setSwitchPassword] = useState("");
  const [switchPasswordVisible, setSwitchPasswordVisible] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const switchPasswordRef = useRef<HTMLInputElement>(null);

  // Only teachers who also have admin access can switch back to teacher
  const isTeacherWithAdminAccess =
    (session?.user as any)?.role === "teacher" &&
    (session?.user as any)?.hasAdminAccess === true;

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Handle auth redirect in useEffect (after all hooks)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      const hasAdminAccess = (session?.user as any)?.hasAdminAccess;
      // Allow admin role OR teacher with admin access
      if (role !== "admin" && !(role === "teacher" && hasAdminAccess)) {
        router.push("/login");
      }
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
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        console.error("[AdminLayout] Backend logout failed");
      }
      await signOut({ redirect: false });
      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);
      await signOut({ redirect: false });
      window.location.href = "/login";
    }
  };

  const openSwitchModal = () => {
    setSwitchPassword("");
    setSwitchError(null);
    setSwitchPasswordVisible(false);
    setIsSwitchModalOpen(true);
    // auto-focus the input after modal opens
    setTimeout(() => switchPasswordRef.current?.focus(), 100);
  };

  const handleSwitchToDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchPassword.trim()) {
      setSwitchError("Please enter your password.");
      return;
    }
    setSwitchLoading(true);
    setSwitchError(null);
    try {
      const res = await fetch("/api/accounts/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: switchPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setSwitchError(data.detail || "Incorrect password. Please try again.");
        return;
      }
      // Password verified — switch to teacher dashboard
      setIsSwitchModalOpen(false);
      window.location.href = "/teacher";
    } catch {
      setSwitchError("Something went wrong. Please try again.");
    } finally {
      setSwitchLoading(false);
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
        body: JSON.stringify({ orgs_id: orgId }),
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
        <Spinner size="md" className="text-black" />
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
      <LoadingContext.Provider value={{ setIsNavigating }}>
        <div className="flex min-h-screen w-full font-sans">
          <Sidebar className="">
            <SidebarHeader className="bg-[#EF7B55] py-5">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
                <Image
                  src="/texagon-logo.png"
                  alt="Techxagon Logo"
                  width={28}
                  height={28}
                  className="shrink-0 object-contain brightness-0 invert"
                />
                <span className="font-semibold text-white text-base sm:text-lg">
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

                      {isTeacherWithAdminAccess && (
                        <DropdownMenuItem
                          className="text-[0.85rem] sm:text-sm hover:bg-blue-50 focus:bg-blue-50 text-blue-600"
                          onClick={openSwitchModal}>
                          <ArrowLeftRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Switch to Instructor
                        </DropdownMenuItem>
                      )}
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

                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative p-1 sm:p-2 hover:bg-[#F797713a] focus:bg-transparent active:bg-transparent transition-colors"
                    title="Notifications">
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-[#EF7B55]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 right-2 bg-orange-500 text-white text-[10px] xs:text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </header>

            <main className="flex-1 p-3 sm:p-6">
              {isNavigating ? <PageLoader /> : children}
            </main>
          </div>
        </div>
      </LoadingContext.Provider>

      {/* ── Switch Dashboard Password Modal ── */}
      <Dialog open={isSwitchModalOpen} onOpenChange={setIsSwitchModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-blue-500" />
              Switch to Instructor Dashboard
            </DialogTitle>
            <DialogDescription>
              For your security, please confirm your password before switching dashboards.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSwitchToDashboard} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="switch-password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="switch-password"
                  ref={switchPasswordRef}
                  type={switchPasswordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={switchPassword}
                  onChange={(e) => {
                    setSwitchPassword(e.target.value);
                    setSwitchError(null);
                  }}
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setSwitchPasswordVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {switchPasswordVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {switchError && (
                <p className="text-xs text-red-500">{switchError}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(false)}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                disabled={switchLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={switchLoading || !switchPassword.trim()}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {switchLoading && <Spinner size="sm" className="text-white" />}
                Confirm & Switch
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
