"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Users, Eye } from "lucide-react";
import { ParentDetailsModal } from "@/components/admin/modals/parent-details-modal";
import { AddParentDialog } from "@/components/admin/modals/add-parent-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

export default function ParentsPage() {
  const [parents, setParents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingParent, setViewingParent] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

      toast({
        title: "Success",
        description: "Parents loaded successfully",
      });
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
            onClick={() => setOpenAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Parent
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative w-full sm:flex-1">
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
                className="w-full sm:w-auto"
              >
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
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 p-4 border rounded-lg bg-card text-card-foreground hover:bg-muted/50 transition-colors"
                  >
                    {/* LEFT SIDE: Avatar + Info */}
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border bg-background">
                        <AvatarImage src={parent.avatar_url} />
                        <AvatarFallback>
                          {parent.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      {/* min-w-0 is CRITICAL here to allow truncation */}
                      <div className="flex flex-col min-w-0 w-full space-y-1">
                        <p className="font-semibold truncate text-base">
                          {parent.name}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{parent.email}</span>
                          </div>

                          {/* Only show separator on desktop */}
                          {parent.phone && (
                            <span className="hidden sm:inline text-muted-foreground/40">
                              •
                            </span>
                          )}

                          {parent.phone && (
                            <div className="text-xs sm:text-sm">
                              {parent.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE: Stats & Actions */}
                    {/* On mobile, this moves to a new row with a top border for clean separation */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-y-3 gap-x-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border">

                      {/* Stats Group: Children Count + Badge */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-md whitespace-nowrap">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-medium">{parent.children_count}</span>
                          {/* Hide text 'Children' on extremely small screens to save space */}
                          <span className="hidden xs:inline opacity-70">Child{parent.children_count !== 1 && 'ren'}</span>
                        </div>

                        <Badge
                          variant={parent.subscription_status === "active" ? "default" : "destructive"}
                          className="capitalize shadow-none px-2 h-7 whitespace-nowrap"
                        >
                          {parent.subscription_status || "N/A"}
                        </Badge>
                      </div>

                      {/* Action Button */}
                      {/* 'flex-1' ensures that if it wraps to a new line on tiny screens, it fills the width */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingParent(parent);
                          toast({
                            title: "Opened",
                            description: `Viewing ${parent.name}'s details`,
                          });
                        }}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View
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
        onSuccess={() => {
          fetchParents();
          toast({
            title: "Parent added",
            description: "The parent account was created successfully.",
          });
        }}
      />

      {/* Parent Details Modal */}
      <ParentDetailsModal
        open={!!viewingParent}
        onOpenChange={(open) => !open && setViewingParent(null)}
        parent={viewingParent}
        onUpdate={() => {
          fetchParents();
          toast({
            title: "Updated",
            description: "Parent details updated successfully.",
          });
        }}
      />

    </>
  );
}
