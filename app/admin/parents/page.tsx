// // "use client";

// // import {useState} from "react";
// // import DashboardLayout from "@/app/admin/layout";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import {Button} from "@/components/ui/button";
// // import {Badge} from "@/components/ui/badge";
// // import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// // import {Input} from "@/components/ui/input";
// // import {Plus, Search, Mail, Users, Eye} from "lucide-react";
// // import {ParentDetailsModal} from "@/components/admin/modals/parent-details-modal";

// // export default function ParentsPage() {
// //   const [viewingParent, setViewingParent] = useState<any>(null);

// //   const parents = [
// //     {
// //       id: 1,
// //       name: "Mr. John Doe Sr.",
// //       email: "john.doe.sr@email.com",
// //       phone: "+1 234 567 8900",
// //       children: ["John Doe", "Jane Doe"],
// //       subscription: "Active",
// //     },
// //     {
// //       id: 2,
// //       name: "Mrs. Sarah Smith",
// //       email: "sarah.smith@email.com",
// //       phone: "+1 234 567 8901",
// //       children: ["Mike Smith"],
// //       subscription: "Active",
// //     },
// //     {
// //       id: 3,
// //       name: "Mr. Robert Johnson",
// //       email: "r.johnson@email.com",
// //       phone: "+1 234 567 8902",
// //       children: ["Emily Johnson", "Tom Johnson"],
// //       subscription: "Expired",
// //     },
// //     {
// //       id: 4,
// //       name: "Mrs. Lisa Williams",
// //       email: "l.williams@email.com",
// //       phone: "+1 234 567 8903",
// //       children: ["David Williams"],
// //       subscription: "Active",
// //     },
// //     {
// //       id: 5,
// //       name: "Mr. James Brown",
// //       email: "j.brown@email.com",
// //       phone: "+1 234 567 8904",
// //       children: ["Anna Brown", "Chris Brown"],
// //       subscription: "Active",
// //     },
// //   ];

// //   return (
// //     <>
// //       <div className="space-y-6">
// //         {/* Header */}
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h1 className="text-3xl font-bold tracking-tight text-foreground">
// //               Parents
// //             </h1>
// //             <p className="text-muted-foreground mt-1">
// //               Manage parent accounts and subscriptions
// //             </p>
// //           </div>
// //           <Button>
// //             <Plus className="mr-2 h-4 w-4" />
// //             Add Parent
// //           </Button>
// //         </div>

// //         {/* Search */}
// //         <Card>
// //           <CardContent className="pt-6">
// //             <div className="flex gap-4">
// //               <div className="relative flex-1">
// //                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
// //                 <Input placeholder="Search parents..." className="pl-9" />
// //               </div>
// //               <Button variant="outline">Filter</Button>
// //             </div>
// //           </CardContent>
// //         </Card>

// //         {/* Parents List */}
// //         <Card>
// //           <CardHeader>
// //             <CardTitle>All Parents</CardTitle>
// //             <CardDescription>
// //               Parent accounts and their linked children
// //             </CardDescription>
// //           </CardHeader>
// //           <CardContent>
// //             <div className="space-y-4">
// //               {parents.map((parent) => (
// //                 <div
// //                   key={parent.id}
// //                   className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
// //                   <div className="flex items-center gap-4">
// //                     <Avatar className="h-12 w-12">
// //                       <AvatarImage
// //                         src={`/.jpg?height=48&width=48&query=${parent.name}`}
// //                       />
// //                       <AvatarFallback>
// //                         {parent.name
// //                           .split(" ")
// //                           .map((n) => n[0])
// //                           .join("")
// //                           .slice(0, 2)}
// //                       </AvatarFallback>
// //                     </Avatar>
// //                     <div>
// //                       <h3 className="font-semibold text-foreground">
// //                         {parent.name}
// //                       </h3>
// //                       <div className="flex items-center gap-4 mt-1">
// //                         <div className="flex items-center gap-1 text-sm text-muted-foreground">
// //                           <Mail className="h-3 w-3" />
// //                           {parent.email}
// //                         </div>
// //                         <div className="flex items-center gap-1 text-sm text-muted-foreground">
// //                           {parent.phone}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <div className="flex items-center gap-4">
// //                     <div className="text-right">
// //                       <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
// //                         <Users className="h-3 w-3" />
// //                         <span>{parent.children.length} Children</span>
// //                       </div>
// //                       <Badge
// //                         variant={
// //                           parent.subscription === "Active"
// //                             ? "default"
// //                             : "destructive"
// //                         }>
// //                         {parent.subscription}
// //                       </Badge>
// //                     </div>
// //                     <Button
// //                       variant="outline"
// //                       size="sm"
// //                       onClick={() => setViewingParent(parent)}>
// //                       <Eye className="mr-2 h-4 w-4" />
// //                       View Details
// //                     </Button>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* Parent Details Modal */}
// //       <ParentDetailsModal
// //         open={!!viewingParent}
// //         onOpenChange={(open) => !open && setViewingParent(null)}
// //         parent={viewingParent}
// //       />
// //     </>
// //   );
// // }

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
//       setParents(data.results || []);
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
//                           {parent.subscription_status}
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

export default function ParentsPage() {
  const [parents, setParents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingParent, setViewingParent] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const {toast} = useToast();

  const fetchParents = async () => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/admin/parents?q=${encodeURIComponent(searchQuery)}`
        : "/api/admin/parents";
      console.log("[ParentsPage] Fetching parents from", url);
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch parents");
      }
      const data = await res.json();
      console.log("[ParentsPage] Received data:", data);
      // Handle both plain array and paginated response
      const parentList = Array.isArray(data) ? data : data.results || [];
      setParents(parentList);
    } catch (error: any) {
      console.error("[ParentsPage] Error fetching parents:", error);
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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Parents
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage parent accounts and subscriptions
            </p>
          </div>
          <Button onClick={() => setOpenAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Parent
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search parents..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Parents List */}
        <Card>
          <CardHeader>
            <CardTitle>All Parents</CardTitle>
            <CardDescription>
              Parent accounts and their linked children
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : parents.length === 0 ? (
              <p>No parents found.</p>
            ) : (
              <div className="space-y-4">
                {parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={parent.avatar_url} />
                        <AvatarFallback>
                          {parent.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {parent.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {parent.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {parent.phone || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Users className="h-3 w-3" />
                          <span>{parent.children_count} Children</span>
                        </div>
                        <Badge
                          variant={
                            parent.subscription_status === "active"
                              ? "default"
                              : "destructive"
                          }>
                          {parent.subscription_status || "N/A"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
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
