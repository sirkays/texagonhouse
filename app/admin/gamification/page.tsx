"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type MetaResp = {
  supported_metrics: string[];
  available_event_types: string[];
};

type Achievement = {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  is_active: boolean;
  rule: any;
};

type Badge = {
  id: number;
  name: string;
  icon_name: string;
  color: string;
  points: number;
  criteria: string;
  rules: any;
  is_active: boolean;
};

export default function GamificationAdminPage() {
  const [tab, setTab] = useState<"achievements" | "badges">("achievements");
  const [meta, setMeta] = useState<MetaResp | null>(null);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | Badge | null>(null);

  // form state (simple)
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/gamification/meta");
      const json = await res.json();
      if (res.ok) setMeta(json);
    })();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      if (tab === "achievements") {
        const res = await fetch(`/api/admin/gamification/achievements?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || "Failed to load achievements");
        setAchievements(json);
      } else {
        const res = await fetch(`/api/admin/gamification/badges?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || "Failed to load badges");
        setBadges(json);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function openCreate() {
    setEditing(null);
    setForm(tab === "achievements"
      ? { code: "", title: "", description: "", icon: "star", category: "General", points: 0, is_active: true, rule: { metric: "count", event_type: "", target: 1, window_days: null } }
      : { name: "", icon_name: "medal", color: "bg-gray-400", points: 0, criteria: "", rules: {}, is_active: true }
    );
    setOpen(true);
  }

  function openEdit(item: any) {
    setEditing(item);
    setForm({ ...item });
    setOpen(true);
  }

  async function save() {
    try {
      setError(null);

      // rule must be JSON-safe; allow typing as string too
      const payload = { ...form };

      if (tab === "achievements" && typeof payload.rule === "string") {
        payload.rule = JSON.parse(payload.rule);
      }
      if (tab === "badges" && typeof payload.rules === "string") {
        payload.rules = JSON.parse(payload.rules);
      }

      let res: Response;
      if (tab === "achievements") {
        if (editing) {
          res = await fetch(`/api/admin/gamification/achievements/${(editing as Achievement).id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch(`/api/admin/gamification/achievements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } else {
        if (editing) {
          res = await fetch(`/api/admin/gamification/badges/${(editing as Badge).id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch(`/api/admin/gamification/badges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || "Save failed");

      setOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function deactivate(id: number) {
    const ok = window.confirm("Deactivate this item?");
    if (!ok) return;

    const url =
      tab === "achievements"
        ? `/api/admin/gamification/achievements/${id}/deactivate`
        : `/api/admin/gamification/badges/${id}/deactivate`;

    const res = await fetch(url, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json?.detail || "Deactivate failed");
      return;
    }
    await load();
  }

  const list = tab === "achievements" ? achievements : badges;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gamification Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage AchievementDefinitions & Badges (no LeaderboardSeason).
          </p>
        </div>
        <Button onClick={openCreate}>Create</Button>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "achievements" ? "default" : "outline"} onClick={() => setTab("achievements")}>
          Achievements
        </Button>
        <Button variant={tab === "badges" ? "default" : "outline"} onClick={() => setTab("badges")}>
          Badges
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>{tab === "achievements" ? "Achievement Definitions" : "Badges"}</CardTitle>
          <div className="flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
            <Button variant="outline" onClick={load} disabled={loading}>Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-red-600 mb-3">Error: {error}</div>}
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size="md" className="text-black" /></div>
          ) : (
            <div className="space-y-2">
              {list.map((item: any) => (
                <div key={item.id} className="border rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {tab === "achievements" ? `${item.code} — ${item.title}` : `${item.name} — ${item.points} pts`}
                      {!item.is_active ? <span className="ml-2 text-xs text-muted-foreground">(inactive)</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tab === "achievements"
                        ? `metric: ${item.rule?.metric || "?"}, event: ${item.rule?.event_type || "?"}, target: ${item.rule?.target ?? "?"}`
                        : `icon: ${item.icon_name}, color: ${item.color}`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                    {item.is_active ? (
                      <Button variant="destructive" onClick={() => deactivate(item.id)}>Deactivate</Button>
                    ) : null}
                  </div>
                </div>
              ))}
              {list.length === 0 && <div className="text-sm text-muted-foreground">No items.</div>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Create"} {tab === "achievements" ? "Achievement" : "Badge"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {tab === "achievements" ? (
              <>
                <Input value={form.code || ""} onChange={(e) => setForm((p: any) => ({ ...p, code: e.target.value }))} placeholder="code (unique in org)" />
                <Input value={form.title || ""} onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))} placeholder="title" />
                <Input value={form.category || ""} onChange={(e) => setForm((p: any) => ({ ...p, category: e.target.value }))} placeholder="category" />
                <Input value={String(form.points ?? 0)} onChange={(e) => setForm((p: any) => ({ ...p, points: Number(e.target.value || 0) }))} placeholder="points" />

                {/* Rule: keep as JSON textarea (simple + flexible) */}
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-[140px]"
                  value={typeof form.rule === "string" ? form.rule : JSON.stringify(form.rule ?? {}, null, 2)}
                  onChange={(e) => setForm((p: any) => ({ ...p, rule: e.target.value }))}
                  placeholder={`rule JSON. supported metrics: ${meta?.supported_metrics?.join(", ") || ""}`}
                />
                <div className="text-xs text-muted-foreground">
                  Available event types (from your org ActivityEvent): {meta?.available_event_types?.slice(0, 10).join(", ")}
                  {meta && meta.available_event_types.length > 10 ? "…" : ""}
                </div>
              </>
            ) : (
              <>
                <Input value={form.name || ""} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="name" />
                <Input value={String(form.points ?? 0)} onChange={(e) => setForm((p: any) => ({ ...p, points: Number(e.target.value || 0) }))} placeholder="points threshold" />
                <Input value={form.icon_name || ""} onChange={(e) => setForm((p: any) => ({ ...p, icon_name: e.target.value }))} placeholder="icon_name" />
                <Input value={form.color || ""} onChange={(e) => setForm((p: any) => ({ ...p, color: e.target.value }))} placeholder="color class (e.g. bg-gray-400)" />
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-[120px]"
                  value={typeof form.rules === "string" ? form.rules : JSON.stringify(form.rules ?? {}, null, 2)}
                  onChange={(e) => setForm((p: any) => ({ ...p, rules: e.target.value }))}
                  placeholder="rules JSON (optional)"
                />
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
