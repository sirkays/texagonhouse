// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {Badge} from "@/components/ui/badge";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// import {Mail, Phone, Users, CreditCard} from "lucide-react";
// import {Card, CardContent} from "@/components/ui/card";

// interface ParentDetailsModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   parent: any;
// }

// export function ParentDetailsModal({
//   open,
//   onOpenChange,
//   parent,
// }: ParentDetailsModalProps) {
//   if (!parent) return null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <div className="flex items-center gap-4">
//             <Avatar className="h-16 w-16">
//               <AvatarImage
//                 src={`/.jpg?height=64&width=64&query=${parent.name}`}
//               />
//               <AvatarFallback className="text-lg">
//                 {parent.name
//                   .split(" ")
//                   .map((n: string) => n[0])
//                   .join("")}
//               </AvatarFallback>
//             </Avatar>
//             <div>
//               <DialogTitle className="text-2xl">{parent.name}</DialogTitle>
//               <DialogDescription>
//                 <Badge
//                   variant={
//                     parent.subscription === "Active" ? "default" : "destructive"
//                   }>
//                   {parent.subscription}
//                 </Badge>
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="space-y-6 mt-6">
//           {/* Contact Information */}
//           <Card>
//             <CardContent className="pt-6 space-y-3">
//               <h3 className="font-semibold mb-3">Contact Information</h3>
//               <div className="flex items-center gap-3 text-sm">
//                 <Mail className="h-4 w-4 text-muted-foreground" />
//                 <span>{parent.email}</span>
//               </div>
//               <div className="flex items-center gap-3 text-sm">
//                 <Phone className="h-4 w-4 text-muted-foreground" />
//                 <span>{parent.phone}</span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Children */}
//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-center gap-2 mb-3">
//                 <Users className="h-4 w-4 text-muted-foreground" />
//                 <h3 className="font-semibold">
//                   Children ({parent.children.length})
//                 </h3>
//               </div>
//               <div className="space-y-2">
//                 {parent.children.map((child: string, index: number) => (
//                   <div
//                     key={index}
//                     className="flex items-center gap-3 p-2 rounded-lg border">
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage
//                         src={`/.jpg?height=32&width=32&query=${child}`}
//                       />
//                       <AvatarFallback className="text-xs">
//                         {child
//                           .split(" ")
//                           .map((n: string) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="text-sm font-medium">{child}</span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Subscription Details */}
//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-center gap-2 mb-3">
//                 <CreditCard className="h-4 w-4 text-muted-foreground" />
//                 <h3 className="font-semibold">Subscription Details</h3>
//               </div>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Status</span>
//                   <Badge
//                     variant={
//                       parent.subscription === "Active"
//                         ? "default"
//                         : "destructive"
//                     }>
//                     {parent.subscription}
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Plan</span>
//                   <span className="font-medium">Standard Plan</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Next Billing</span>
//                   <span className="font-medium">April 15, 2024</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import {useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {useToast} from "@/components/ui/use-toast";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";
import {Mail, Phone, MapPin, Calendar, Users, DollarSign} from "lucide-react";

interface ParentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent: any;
  onUpdate: () => void;
}

export function ParentDetailsModal({
  open,
  onOpenChange,
  parent: initialParent,
  onUpdate,
}: ParentDetailsModalProps) {
  const [parent, setParent] = useState(initialParent);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [studentId, setStudentId] = useState("");
  const [unlinkStudentId, setUnlinkStudentId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    if (initialParent) {
      setParent(initialParent);
      setName(initialParent.name || "");
      setEmail(initialParent.email || "");
      setPhone(initialParent.phone || "");
      setAddress(initialParent.address || "");
      setStatus(initialParent.status || "");
    }
  }, [initialParent]);

  const fetchParent = async () => {
    if (!parent?.id) return;
    try {
      const res = await fetch(`/api/admin/parents/${parent.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch parent details");
      }
      const data = await res.json();
      setParent(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setStatus(data.status || "");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch parent details",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (name !== parent.name) formData.append("name", name);
    if (phone !== parent.phone) formData.append("phone", phone);
    if (address !== parent.address) formData.append("address", address);
    if (status !== parent.status) formData.append("status", status);
    if (avatar) formData.append("avatar", avatar);

    try {
      const res = await fetch(`/api/admin/parents/${parent.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update parent");
      }

      toast({title: "Success", description: "Parent updated successfully"});
      setEditing(false);
      await fetchParent();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update parent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parents/${parent.id}/link_child`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({student_id: parseInt(studentId)}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to link child");
      }
      toast({title: "Success", description: "Child linked successfully"});
      setStudentId("");
      await fetchParent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to link child",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkChild = async (studentId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parents/${parent.id}/unlink_child`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({student_id: parseInt(studentId)}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to unlink child");
      }
      toast({title: "Success", description: "Child unlinked successfully"});
      setUnlinkStudentId("");
      await fetchParent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink child",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetStatus = async () => {
    if (!newStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parents/${parent.id}/set_status`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status: newStatus}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to set status");
      }
      toast({title: "Success", description: "Status updated successfully"});
      setNewStatus("");
      await fetchParent();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/parents/${parent.id}/generate_invoices`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate invoices");
      }
      const data = await res.json();
      toast({
        title: "Success",
        description: `Generated ${data.created} invoices`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this parent?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parents/${parent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete parent");
      }
      toast({title: "Success", description: "Parent deleted successfully"});
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete parent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!parent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Parent Details</DialogTitle>
          <DialogDescription>
            View and manage parent information.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            {editing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="avatar">Update Profile Picture</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={parent.avatar_url} />
                    <AvatarFallback>
                      {parent.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{parent.name}</h3>
                    <Badge
                      variant={
                        parent.subscription_status === "active"
                          ? "default"
                          : "destructive"
                      }>
                      {parent.subscription_status}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{parent.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{parent.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{parent.address || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{parent.children_count} Children</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Created:{" "}
                      {new Date(parent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Updated:{" "}
                      {new Date(parent.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button onClick={() => setEditing(true)} disabled={loading}>
                  Edit Details
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="children">
            <div className="space-y-4">
              <h4 className="font-semibold">
                Linked Children ({parent.children?.length || 0})
              </h4>
              {parent.children?.map((child: any) => (
                <div
                  key={child.id}
                  className="flex justify-between items-center p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/.jpg?height=32&width=32&query=${child.full_name}`}
                      />
                      <AvatarFallback>
                        {child.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {child.full_name} ({child.admission_no})
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleUnlinkChild(child.id.toString())}
                    disabled={loading}>
                    Unlink
                  </Button>
                </div>
              )) || <p>No children linked.</p>}
              <Separator />
              <div className="flex gap-2">
                <Input
                  placeholder="Student ID to link"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
                <Button
                  onClick={handleLinkChild}
                  disabled={loading || !studentId}>
                  Link Child
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="actions">
            <div className="space-y-4">
              <div>
                <Label>Set Status</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSetStatus}
                    disabled={loading || !newStatus}>
                    Update Status
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleGenerateInvoices}
                disabled={loading}
                className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                Generate Invoices
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="w-full">
                Delete Parent
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
