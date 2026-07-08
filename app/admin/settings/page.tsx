// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Spinner } from "@/components/ui/spinner";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "@/components/ui/use-toast"; // if you have this; otherwise swap with alert()
// import { Trash2, Pencil, CheckCircle2, Plus } from "lucide-react";

// type LeaderboardSeason = {
//   id: number;
//   name: string;
//   slug: string;
//   start_at: string; // ISO
//   end_at: string;   // ISO
//   is_active: boolean;
//   created_at: string;
// };

// type FormState = {
//   id?: number;
//   name: string;
//   slug: string;
//   start_at: string; // datetime-local string
//   end_at: string;   // datetime-local string
//   is_active: boolean;
// };

// function isoToLocalInput(iso: string) {
//   // Converts "2026-01-01T00:00:00Z" -> "2026-01-01T00:00"
//   // Works in local timezone (browser). Good enough for admin UI.
//   if (!iso) return "";
//   const d = new Date(iso);
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
//     d.getHours()
//   )}:${pad(d.getMinutes())}`;
// }

// function localInputToIso(value: string) {
//   // "2026-01-01T00:00" (local) -> ISO string with timezone
//   if (!value) return "";
//   const d = new Date(value);
//   return d.toISOString();
// }

// export default function AdminSettingsPage() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [seasons, setSeasons] = useState<LeaderboardSeason[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [form, setForm] = useState<FormState>({
//     name: "",
//     slug: "",
//     start_at: "",
//     end_at: "",
//     is_active: false,
//   });

//   const activeSeason = useMemo(
//     () => seasons.find((s) => s.is_active),
//     [seasons]
//   );

//   const resetForm = () => {
//     setForm({
//       name: "",
//       slug: "",
//       start_at: "",
//       end_at: "",
//       is_active: false,
//     });
//   };

//   const openCreate = () => {
//     resetForm();
//     setDialogOpen(true);
//   };

//   const openEdit = (s: LeaderboardSeason) => {
//     setForm({
//       id: s.id,
//       name: s.name,
//       slug: s.slug,
//       start_at: isoToLocalInput(s.start_at),
//       end_at: isoToLocalInput(s.end_at),
//       is_active: s.is_active,
//     });
//     setDialogOpen(true);
//   };

//   const fetchSeasons = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await fetch("/api/admin/settings/leaderboard-seasons", {
//         method: "GET",
//       });
//       const data = await res.json().catch(() => null);

//       if (!res.ok) {
//         throw new Error(data?.detail || data?.error || "Failed to load seasons");
//       }

//       setSeasons(Array.isArray(data) ? data : []);
//     } catch (e: any) {
//       setError(e?.message || "Unexpected error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSeasons();
//   }, []);

//   const saveSeason = async () => {
//     // basic validation
//     if (!form.name.trim()) {
//       toast?.({ title: "Name is required" });
//       return;
//     }
//     if (!form.start_at || !form.end_at) {
//       toast?.({ title: "Start/End dates are required" });
//       return;
//     }

//     setSaving(true);
//     try {
//       const payload = {
//         name: form.name.trim(),
//         slug: form.slug.trim(), // optional; backend can slugify if empty
//         start_at: localInputToIso(form.start_at),
//         end_at: localInputToIso(form.end_at),
//         is_active: form.is_active,
//       };

//       // CREATE
//       if (!form.id) {
//         const res = await fetch("/api/admin/settings/leaderboard-seasons", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//         const data = await res.json().catch(() => null);

//         if (!res.ok) {
//           throw new Error(data?.detail || data?.error || "Failed to create season");
//         }

//         toast?.({ title: "Season created" });
//         setDialogOpen(false);
//         await fetchSeasons();
//         return;
//       }

//       // UPDATE
//       const res = await fetch(
//         `/api/admin/settings/leaderboard-seasons/${form.id}`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );
//       const data = await res.json().catch(() => null);

//       if (!res.ok) {
//         throw new Error(data?.detail || data?.error || "Failed to update season");
//       }

//       toast?.({ title: "Season updated" });
//       setDialogOpen(false);
//       await fetchSeasons();
//     } catch (e: any) {
//       toast?.({ title: "Error", description: e?.message || "Unexpected error" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const setActive = async (id: number) => {
//     setSaving(true);
//     try {
//       const res = await fetch(
//         `/api/admin/settings/leaderboard-seasons/${id}/set-active`,
//         { method: "POST" }
//       );
//       const data = await res.json().catch(() => null);

//       if (!res.ok) {
//         throw new Error(data?.detail || data?.error || "Failed to set active");
//       }

//       toast?.({ title: "Active season updated" });
//       await fetchSeasons();
//     } catch (e: any) {
//       toast?.({ title: "Error", description: e?.message || "Unexpected error" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const deleteSeason = async (id: number) => {
//     const ok = confirm("Delete this season? This cannot be undone.");
//     if (!ok) return;

//     setSaving(true);
//     try {
//       const res = await fetch(`/api/admin/settings/leaderboard-seasons/${id}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => null);
//         throw new Error(data?.detail || data?.error || "Failed to delete");
//       }

//       toast?.({ title: "Season deleted" });
//       await fetchSeasons();
//     } catch (e: any) {
//       toast?.({ title: "Error", description: e?.message || "Unexpected error" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <Spinner size="md" className="text-black" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-red-500">
//         <div className="font-semibold">Settings</div>
//         <div className="mt-2">Error: {error}</div>
//         <Button className="mt-4" onClick={fetchSeasons}>
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
//             Settings
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Manage leaderboard seasons (more settings coming later).
//           </p>
//         </div>

//         <Button onClick={openCreate} className="gap-2">
//           <Plus className="h-4 w-4" />
//           Create Season
//         </Button>
//       </div>

//       <Card className="p-4 sm:p-6">
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//           <div className="text-sm">
//             <span className="font-medium">Active season:</span>{" "}
//             {activeSeason ? (
//               <span className="ml-2 inline-flex items-center gap-2">
//                 <Badge variant="secondary">{activeSeason.name}</Badge>
//                 <span className="text-muted-foreground">({activeSeason.slug})</span>
//               </span>
//             ) : (
//               <span className="text-muted-foreground ml-2">None</span>
//             )}
//           </div>
//           <Button variant="outline" onClick={fetchSeasons} disabled={saving}>
//             Refresh
//           </Button>
//         </div>

//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="min-w-[180px]">Name</TableHead>
//                 <TableHead className="min-w-[140px]">Slug</TableHead>
//                 <TableHead className="min-w-[220px]">Start</TableHead>
//                 <TableHead className="min-w-[220px]">End</TableHead>
//                 <TableHead className="w-[120px]">Status</TableHead>
//                 <TableHead className="w-[220px] text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {seasons.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center text-muted-foreground">
//                     No seasons yet. Create one to begin.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 seasons.map((s) => (
//                   <TableRow key={s.id}>
//                     <TableCell className="font-medium">{s.name}</TableCell>
//                     <TableCell className="text-muted-foreground">{s.slug}</TableCell>
//                     <TableCell>{new Date(s.start_at).toLocaleString()}</TableCell>
//                     <TableCell>{new Date(s.end_at).toLocaleString()}</TableCell>
//                     <TableCell>
//                       {s.is_active ? (
//                         <Badge className="gap-1" variant="secondary">
//                           <CheckCircle2 className="h-3 w-3" />
//                           Active
//                         </Badge>
//                       ) : (
//                         <Badge variant="outline">Inactive</Badge>
//                       )}
//                     </TableCell>

//                     <TableCell className="text-right">
//                       <div className="inline-flex flex-wrap justify-end gap-2">
//                         {!s.is_active && (
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             disabled={saving}
//                             onClick={() => setActive(s.id)}
//                           >
//                             Set Active
//                           </Button>
//                         )}

//                         <Button
//                           size="sm"
//                           variant="outline"
//                           disabled={saving}
//                           onClick={() => openEdit(s)}
//                           className="gap-1"
//                         >
//                           <Pencil className="h-3 w-3" />
//                           Edit
//                         </Button>

//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           disabled={saving}
//                           onClick={() => deleteSeason(s.id)}
//                           className="gap-1"
//                         >
//                           <Trash2 className="h-3 w-3" />
//                           Delete
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </Card>

//       {/* Create/Edit Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               {form.id ? "Edit Leaderboard Season" : "Create Leaderboard Season"}
//             </DialogTitle>
//             <DialogDescription>
//               Define the time range used for leaderboard calculations.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Name</Label>
//               <Input
//                 value={form.name}
//                 onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//                 placeholder="e.g. 2026 Academic Year"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Slug (optional)</Label>
//               <Input
//                 value={form.slug}
//                 onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
//                 placeholder="e.g. 2026-academic-year"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Leave blank to auto-generate from name.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label>Start</Label>
//                 <Input
//                   type="datetime-local"
//                   value={form.start_at}
//                   onChange={(e) => setForm((p) => ({ ...p, start_at: e.target.value }))}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>End</Label>
//                 <Input
//                   type="datetime-local"
//                   value={form.end_at}
//                   onChange={(e) => setForm((p) => ({ ...p, end_at: e.target.value }))}
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-between rounded-md border p-3">
//               <div>
//                 <div className="text-sm font-medium">Set as active</div>
//                 <div className="text-xs text-muted-foreground">
//                   If enabled, all other seasons will be deactivated.
//                 </div>
//               </div>
//               <Switch
//                 checked={form.is_active}
//                 onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
//                 Cancel
//               </Button>
//               <Button onClick={saveSeason} disabled={saving}>
//                 {saving ? "Saving..." : form.id ? "Save Changes" : "Create"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Spinner} from "@/components/ui/spinner";
import {useSession} from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Switch} from "@/components/ui/switch";
import {Badge} from "@/components/ui/badge";
import {toast} from "@/components/ui/use-toast";
import {Trash2, Pencil, CheckCircle2, Plus} from "lucide-react";

type LeaderboardSeason = {
  id: number;
  name: string;
  slug: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_at: string;
};

type FormState = {
  id?: number;
  name: string;
  slug: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

function isoToLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

export default function AdminSettingsPage() {
  const {data: session} = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seasons, setSeasons] = useState<LeaderboardSeason[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [org, setOrg] = useState<any>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgSaving, setOrgSaving] = useState(false);

  const fetchOrgSettings = async () => {
    try {
      setOrgLoading(true);
      const orgsRes = await fetch("/api/admin/access-orgs");
      if (!orgsRes.ok) throw new Error("Failed to get current organization");
      const orgsData = await orgsRes.json();
      const currentOrgId = orgsData?.selected_organization?.id;
      if (!currentOrgId) return;

      const settingsRes = await fetch(`/api/admin/settings/organization?org_id=${currentOrgId}`);
      if (!settingsRes.ok) throw new Error("Failed to load organization settings");
      const settingsData = await settingsRes.json();
      setOrg(settingsData);
    } catch (e: any) {
      console.error(e);
      toast?.({title: "Error", description: e?.message || "Failed to load organization settings"});
    } finally {
      setOrgLoading(false);
    }
  };

  const handleToggleAllowUnsubscribed = async (checked: boolean) => {
    if (!org) return;
    setOrgSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/organization?org_id=${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allow_unsubscribed_users: checked }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      const updatedOrg = await res.json();
      setOrg(updatedOrg);
      toast?.({title: "Settings updated successfully"});
    } catch (e: any) {
      toast?.({title: "Error", description: e?.message || "Failed to update settings"});
    } finally {
      setOrgSaving(false);
    }
  };

  const handleTogglePublicCertRequest = async (checked: boolean) => {
    if (!org) return;
    setOrgSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/organization?org_id=${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allow_public_cert_request: checked }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      const updatedOrg = await res.json();
      setOrg(updatedOrg);
      toast?.({title: "Settings updated successfully"});
    } catch (e: any) {
      toast?.({title: "Error", description: e?.message || "Failed to update settings"});
    } finally {
      setOrgSaving(false);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    start_at: "",
    end_at: "",
    is_active: false,
  });

  const activeSeason = useMemo(
    () => seasons.find((s) => s.is_active),
    [seasons]
  );

  const resetForm = () =>
    setForm({
      name: "",
      slug: "",
      start_at: "",
      end_at: "",
      is_active: false,
    });

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (s: LeaderboardSeason) => {
    setForm({
      id: s.id,
      name: s.name,
      slug: s.slug,
      start_at: isoToLocalInput(s.start_at),
      end_at: isoToLocalInput(s.end_at),
      is_active: s.is_active,
    });
    setDialogOpen(true);
  };

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/settings/leaderboard-seasons");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || "Failed to load seasons");
      setSeasons(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
    fetchOrgSettings();
  }, []);

  const saveSeason = async () => {
    if (!form.name.trim() || !form.start_at || !form.end_at) {
      toast?.({title: "All required fields must be filled"});
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        start_at: localInputToIso(form.start_at),
        end_at: localInputToIso(form.end_at),
        is_active: form.is_active,
      };

      const res = await fetch(
        form.id
          ? `/api/admin/settings/leaderboard-seasons/${form.id}`
          : "/api/admin/settings/leaderboard-seasons",
        {
          method: form.id ? "PATCH" : "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Save failed");

      toast?.({title: form.id ? "Season updated" : "Season created"});
      setDialogOpen(false);
      await fetchSeasons();
    } catch (e: any) {
      toast?.({title: "Error", description: e?.message});
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (id: number) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/settings/leaderboard-seasons/${id}/set-active`, {
        method: "POST",
      });
      toast?.({title: "Active season updated"});
      await fetchSeasons();
    } finally {
      setSaving(false);
    }
  };

  const deleteSeason = async (id: number) => {
    if (!confirm("Delete this season?")) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/settings/leaderboard-seasons/${id}`, {
        method: "DELETE",
      });
      toast?.({title: "Season deleted"});
      await fetchSeasons();
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchSeasons} className="mt-4">
          Retry
        </Button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage leaderboard seasons
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Season
        </Button>
      </div>

      <Card className="p-4 sm:p-6 space-y-6">
        {/* Active Season */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">Active season:</span>
            {activeSeason ? (
              <>
                <Badge variant="secondary">{activeSeason.name}</Badge>
                <span className="text-muted-foreground">
                  ({activeSeason.slug})
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
          <Button variant="outline" onClick={fetchSeasons} disabled={saving}>
            Refresh
          </Button>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.slug}</TableCell>
                  <TableCell>{new Date(s.start_at).toLocaleString()}</TableCell>
                  <TableCell>{new Date(s.end_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {s.is_active ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      {!s.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActive(s.id)}>
                          Set Active
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(s)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSeason(s.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE + TABLET CARDS */}
        <div className="lg:hidden space-y-3">
          {seasons.map((s) => (
            <Card key={s.id} className="p-4 space-y-3">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.slug}</div>
              </div>

              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Start: </span>
                  {new Date(s.start_at).toLocaleString()}
                </div>
                <div>
                  <span className="text-muted-foreground">End: </span>
                  {new Date(s.end_at).toLocaleString()}
                </div>
              </div>

              {s.is_active ? (
                <Badge variant="secondary">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t">
                {!s.is_active && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActive(s.id)}>
                    Set Active
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteSeason(s.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-slate-900 mb-2">Organization Settings</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage global settings for your organization.
          </p>
        </div>
        
        {orgLoading ? (
          <div className="flex justify-center p-4">
            <Spinner size="sm" />
          </div>
        ) : org ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between border rounded-xl p-4 bg-slate-50/50">
              <div>
                <div className="text-sm font-medium text-slate-800">Allow Expired/Unsubscribed Student Logins</div>
                <div className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                  If enabled, students whose subscriptions have expired or who have no active subscription will still be allowed to log in. Their access will be restricted to courses with General Activation active.
                </div>
              </div>
              <Switch
                disabled={orgSaving}
                checked={!!org.allow_unsubscribed_users}
                onCheckedChange={handleToggleAllowUnsubscribed}
              />
            </div>
            <div className="flex items-center justify-between border rounded-xl p-4 bg-slate-50/50">
              <div>
                <div className="text-sm font-medium text-slate-800">Allow Public Certificate Requests</div>
                <div className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                  When enabled, your organisation will appear in the public certificate request portal. Students who participated in your courses outside the LMS can request their certificate without an account.
                </div>
              </div>
              <Switch
                disabled={orgSaving}
                checked={!!org.allow_public_cert_request}
                onCheckedChange={handleTogglePublicCertRequest}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Failed to load organization settings.</p>
        )}
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Season" : "Create Season"}
            </DialogTitle>
            <DialogDescription>Define leaderboard date range</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({...p, name: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({...p, slug: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={form.start_at}
                onChange={(e) =>
                  setForm((p) => ({...p, start_at: e.target.value}))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={form.end_at}
                onChange={(e) =>
                  setForm((p) => ({...p, end_at: e.target.value}))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-md p-3 mt-4">
            <div>
              <div className="text-sm font-medium">Set as active</div>
              <div className="text-xs text-muted-foreground">
                Deactivates other seasons
              </div>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({...p, is_active: v}))}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSeason} disabled={saving}>
              {saving ? "Saving..." : form.id ? "Save Changes" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
