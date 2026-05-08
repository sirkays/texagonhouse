"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface OrgUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

const ROLE_COLORS: Record<string, string> = {
  student:  "bg-blue-100 text-blue-700",
  teacher:  "bg-emerald-100 text-emerald-700",
  parent:   "bg-purple-100 text-purple-700",
  admin:    "bg-orange-100 text-orange-700",
};

function roleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export default function ChangePasswordPage() {
  const { status } = useSession();
  const { toast } = useToast();

  // User list state
  const [search, setSearch]       = useState("");
  const [users, setUsers]         = useState<OrgUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError]     = useState<string | null>(null);

  // Selected user + password form
  const [selected, setSelected]   = useState<OrgUser | null>(null);
  const [newPass, setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [isSaving, setIsSaving]   = useState(false);

  const fetchUsers = useCallback(async (q = "") => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/change-password${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load users.");
      setUsers(data.results ?? []);
    } catch (err: any) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchUsers();
  }, [status, fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleSelectUser = (u: OrgUser) => {
    setSelected(u);
    setNewPass("");
    setConfirmPass("");
    setShowPass(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selected) return;
    if (newPass.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPass !== confirmPass) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: selected.id, new_password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to change password.");

      toast({ title: "✅ Password Updated", description: data.detail });
      setNewPass("");
      setConfirmPass("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-orange-100">
          <ShieldCheck className="h-6 w-6 text-[#EF7B55]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Change Password</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reset passwords for any user in your organisation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── User list ──────────────────────────────── */}
        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Organisation Members</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                className="pl-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto max-h-[520px] pr-2 space-y-1 pb-4">
            {usersLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              ))
            ) : usersError ? (
              <div className="flex items-center gap-2 text-sm text-destructive p-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {usersError}
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-orange-50 ${
                    selected?.id === u.id ? "bg-orange-50 ring-1 ring-[#EF7B55]/40" : ""
                  }`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={u.avatar_url} />
                    <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                      {initials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name || u.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge
                    className={`text-[10px] shrink-0 border-0 ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {roleLabel(u.role)}
                  </Badge>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* ── Password form ──────────────────────────── */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#EF7B55]" />
              {selected ? `Reset password for ${selected.name || selected.email}` : "Select a user"}
            </CardTitle>
            <CardDescription>
              {selected
                ? `Enter and confirm a new password for this account.`
                : "Choose a user from the list on the left to change their password."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-52 gap-4 opacity-40">
                <User className="h-14 w-14 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No user selected</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                {/* Selected user summary */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selected.avatar_url} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                      {initials(selected.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{selected.name || selected.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{selected.email}</p>
                  </div>
                  <Badge
                    className={`ml-auto text-[10px] border-0 ${ROLE_COLORS[selected.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {roleLabel(selected.role)}
                  </Badge>
                </div>

                <Separator />

                {/* New password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="new-password">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                      minLength={6}
                      disabled={isSaving}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPass((v) => !v)}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPass.length > 0 && newPass.length < 6 && (
                    <p className="text-xs text-destructive">Password is too short.</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPass ? "text" : "password"}
                      placeholder="Repeat the password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                      disabled={isSaving}
                      className="pr-10"
                    />
                    {confirmPass.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {newPass === confirmPass ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </span>
                    )}
                  </div>
                  {confirmPass.length > 0 && newPass !== confirmPass && (
                    <p className="text-xs text-destructive">Passwords do not match.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSaving || newPass.length < 6 || newPass !== confirmPass}
                  className="w-full bg-[#EF7B55] hover:bg-[#e0673f] text-white"
                >
                  {isSaving ? "Updating…" : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
