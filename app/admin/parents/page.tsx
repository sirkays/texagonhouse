// "use client";

// import {useState, useEffect} from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// import {Input} from "@/components/ui/input";
// import {Plus, Search, Mail, Users, Eye} from "lucide-react";
// import {ParentDetailsModal} from "@/components/admin/modals/parent-details-modal";
// import {AddParentDialog} from "@/components/admin/modals/add-parent-dialog";
// import {useToast} from "@/components/ui/use-toast";

// export default function ParentsPage() {
//   const [parents, setParents] = useState<any[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewingParent, setViewingParent] = useState<any>(null);
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const {toast} = useToast();

//   const fetchParents = async () => {
//     setLoading(true);
//     try {
//       const url = searchQuery
//         ? `/api/admin/parents?q=${encodeURIComponent(searchQuery)}`
//         : "/api/admin/parents";
//       const res = await fetch(url);
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.error || "Failed to fetch parents");
//       }
//       const data = await res.json();
//       // Handle both plain array and paginated response
//       const parentList = Array.isArray(data) ? data : data.results || [];
//       setParents(parentList);
//     } catch (error: any) {
//       console.error("[ParentsPage] Error fetching parents:", error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to load parents",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchParents();
//   }, [searchQuery]);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     fetchParents();
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Parents
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage parent accounts and subscriptions
//             </p>
//           </div>
//           <Button onClick={() => setOpenAddDialog(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Parent
//           </Button>
//         </div>

//         {/* Search */}
//         <Card>
//           <CardContent className="pt-6">
//             <form onSubmit={handleSearch} className="flex gap-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search parents..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" disabled={loading}>
//                 Search
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Parents List */}
//         <Card>
//           <CardHeader>
//             <CardTitle>All Parents</CardTitle>
//             <CardDescription>
//               Parent accounts and their linked children
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <p>Loading...</p>
//             ) : parents.length === 0 ? (
//               <p>No parents found.</p>
//             ) : (
//               <div className="space-y-4">
//                 {parents.map((parent) => (
//                   <div
//                     key={parent.id}
//                     className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
//                     <div className="flex items-center gap-4">
//                       <Avatar className="h-12 w-12">
//                         <AvatarImage src={parent.avatar_url} />
//                         <AvatarFallback>
//                           {parent.name
//                             .split(" ")
//                             .map((n: string) => n[0])
//                             .join("")
//                             .slice(0, 2)}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <h3 className="font-semibold text-foreground">
//                           {parent.name}
//                         </h3>
//                         <div className="flex items-center gap-4 mt-1">
//                           <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                             <Mail className="h-3 w-3" />
//                             {parent.email}
//                           </div>
//                           <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                             {parent.phone || "N/A"}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <div className="text-right">
//                         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
//                           <Users className="h-3 w-3" />
//                           <span>{parent.children_count} Children</span>
//                         </div>
//                         <Badge
//                           variant={
//                             parent.subscription_status === "active"
//                               ? "default"
//                               : "destructive"
//                           }>
//                           {parent.subscription_status || "N/A"}
//                         </Badge>
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setViewingParent(parent)}>
//                         <Eye className="mr-2 h-4 w-4" />
//                         View Details
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Add Parent Dialog */}
//       <AddParentDialog
//         open={openAddDialog}
//         onOpenChange={setOpenAddDialog}
//         onSuccess={fetchParents}
//       />

//       {/* Parent Details Modal */}
//       <ParentDetailsModal
//         open={!!viewingParent}
//         onOpenChange={(open) => !open && setViewingParent(null)}
//         parent={viewingParent}
//         onUpdate={fetchParents}
//       />
//     </>
//   );
// }

// "use client";

// import {useState, useEffect} from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// import {Input} from "@/components/ui/input";
// import {Plus, Search, Mail, Users, Eye} from "lucide-react";
// import {ParentDetailsModal} from "@/components/admin/modals/parent-details-modal";
// import {AddParentDialog} from "@/components/admin/modals/add-parent-dialog";
// import {useToast} from "@/components/ui/use-toast";

// export default function ParentsPage() {
//   const [parents, setParents] = useState<any[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewingParent, setViewingParent] = useState<any>(null);
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const {toast} = useToast();

//   /* -------------------- Data -------------------- */
//   const fetchParents = async () => {
//     setLoading(true);
//     try {
//       const url = searchQuery
//         ? `/api/admin/parents?q=${encodeURIComponent(searchQuery)}`
//         : "/api/admin/parents";

//       const res = await fetch(url);
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.error || "Failed to fetch parents");
//       }

//       const data = await res.json();
//       const parentList = Array.isArray(data) ? data : data.results || [];
//       setParents(parentList);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to load parents",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchParents();
//   }, [searchQuery]);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     fetchParents();
//   };

//   /* -------------------- UI -------------------- */
//   return (
//     <>
//       <div className="space-y-6 px-2 sm:px-0">
//         {/* Header */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
//               Parents
//             </h1>
//             <p className="text-muted-foreground mt-1 text-sm sm:text-base">
//               Manage parent accounts and subscriptions
//             </p>
//           </div>

//           <Button
//             className="w-full sm:w-auto"
//             onClick={() => setOpenAddDialog(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Parent
//           </Button>
//         </div>

//         {/* Search */}
//         <Card>
//           <CardContent className="pt-6">
//             <form
//               onSubmit={handleSearch}
//               className="flex flex-col gap-3 sm:flex-row sm:items-center">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search parents..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full sm:w-auto">
//                 Search
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Parents List */}
//         <Card>
//           <CardHeader>
//             <CardTitle>All Parents</CardTitle>
//             <CardDescription>
//               Parent accounts and their linked children
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             {loading ? (
//               <p className="text-sm text-muted-foreground">Loading...</p>
//             ) : parents.length === 0 ? (
//               <p className="text-sm text-muted-foreground">No parents found.</p>
//             ) : (
//               <div className="space-y-4">
//                 {parents.map((parent) => (
//                   <div
//                     key={parent.id}
//                     className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
//                     {/* Left */}
//                     <div className="flex gap-4 items-center">
//                       <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
//                         <AvatarImage src={parent.avatar_url} />
//                         <AvatarFallback>
//                           {parent.name
//                             .split(" ")
//                             .map((n: string) => n[0])
//                             .join("")
//                             .slice(0, 2)}
//                         </AvatarFallback>
//                       </Avatar>

//                       <div className="min-w-0">
//                         <h3 className="font-semibold truncate">
//                           {parent.name}
//                         </h3>

//                         <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1">
//                           <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground truncate">
//                             <Mail className="h-3 w-3 shrink-0" />
//                             <span className="truncate">{parent.email}</span>
//                           </div>
//                           <div className="text-xs sm:text-sm text-muted-foreground">
//                             {parent.phone || "N/A"}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Right */}
//                     <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
//                       <div className="text-left sm:text-right">
//                         <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
//                           <Users className="h-3 w-3" />
//                           <span>{parent.children_count} Children</span>
//                         </div>
//                         <Badge
//                           variant={
//                             parent.subscription_status === "active"
//                               ? "default"
//                               : "destructive"
//                           }
//                           className="w-fit">
//                           {parent.subscription_status || "N/A"}
//                         </Badge>
//                       </div>

//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="w-full sm:w-auto"
//                         onClick={() => setViewingParent(parent)}>
//                         <Eye className="mr-2 h-4 w-4" />
//                         View Details
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Add Parent Dialog */}
//       <AddParentDialog
//         open={openAddDialog}
//         onOpenChange={setOpenAddDialog}
//         onSuccess={fetchParents}
//       />

//       {/* Parent Details Modal */}
//       <ParentDetailsModal
//         open={!!viewingParent}
//         onOpenChange={(open) => !open && setViewingParent(null)}
//         parent={viewingParent}
//         onUpdate={fetchParents}
//       />
//     </>
//   );
// }

"use client";

import {useState, useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Plus, Search, Mail, Users, Eye} from "lucide-react";
import {ParentDetailsModal} from "@/components/admin/modals/parent-details-modal";
import {AddParentDialog} from "@/components/admin/modals/add-parent-dialog";
import {useToast} from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

export default function ParentsPage() {
  const [parents, setParents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingParent, setViewingParent] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const {toast} = useToast();

  /* -------------------- Data -------------------- */
  const fetchParents = async () => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/admin/parents?q=${encodeURIComponent(searchQuery)}`
        : "/api/admin/parents";

      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch parents");
      }

      const data = await res.json();
      setParents(Array.isArray(data) ? data : data.results || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load parents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParents();
  };

  /* -------------------- UI -------------------- */
  return (
    <>
      <div className="space-y-5 px-2 sm:px-0">
        {/* Header */}
        <div className="space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-xl font-bold sm:text-3xl">Parents</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage parent accounts and subscriptions
            </p>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={() => setOpenAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Parent
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search parents..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

           <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Parents List */}
        <Card className=" border border-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">All Parents</CardTitle>
            <CardDescription className="hidden sm:block">
              Parent accounts and their linked children
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : parents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No parents found.</p>
            ) : (
              <div className="space-y-3">
                {parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="rounded-lg border p-4 space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0 hover:bg-muted/50 transition">
                    {/* Left */}
                    <div className="flex gap-3 items-center min-w-0">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src={parent.avatar_url} />
                        <AvatarFallback>
                          {parent.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="font-semibold truncate">{parent.name}</p>

                        <div className="mt-1 space-y-1 sm:flex sm:space-y-0 sm:gap-4">
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{parent.email}</span>
                          </div>

                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {parent.phone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{parent.children_count} Children</span>
                      </div>

                      <Badge
                        variant={
                          parent.subscription_status === "active"
                            ? "default"
                            : "destructive"
                        }
                        className="w-fit">
                        {parent.subscription_status || "N/A"}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setViewingParent(parent)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Parent Dialog */}
      <AddParentDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onSuccess={fetchParents}
      />

      {/* Parent Details Modal */}
      <ParentDetailsModal
        open={!!viewingParent}
        onOpenChange={(open) => !open && setViewingParent(null)}
        parent={viewingParent}
        onUpdate={fetchParents}
      />
    </>
  );
}
