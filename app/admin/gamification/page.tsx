

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Badge as UIBadge} from "@/components/ui/badge";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Award, Trophy, Star, Zap, Pencil, Plus, Save} from "lucide-react";

/* -------- Types (match API models) -------- */
type BadgeModel = {
  id: number;
  organizationId: number;
  name: string;
  icon_name: string;
  color: string; // Tailwind bg class
  points: number;
  criteria?: string;
  rules?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

type AchievementDefinitionModel = {
  id: number;
  organizationId: number | null;
  code: string;
  title: string;
  description?: string;
  icon: string;
  category: string;
  target_value: number | null;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Summary = {
  totalPointsAwarded: number;
  badgesEarned: number;
  activeStreaks: number;
  avgEngagement: number;
};

type LeaderboardRow = {
  rank: number;
  studentId: number;
  student: string;
  points: number;
  badges: number;
  streak: number;
};

/* -------- Page -------- */
export default function GamificationPage() {
  const router = useRouter();
  // States
  const [summary, setSummary] = useState<Summary | null>(null);
  const [badges, setBadges] = useState<BadgeModel[]>([]);
  const [achievements, setAchievements] = useState<
    AchievementDefinitionModel[]
  >([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data sequentially for better error handling
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Summary
        const sumRes = await fetch("/api/admin/gamification/summary");
        if (!sumRes.ok) {
          const errData = await sumRes.json().catch(() => ({}));
          if (errData.redirect) {
            router.push(errData.redirect);
            return;
          }
          throw new Error(errData.error || "Failed to fetch summary");
        }
        setSummary(await sumRes.json());

        // Badges
        const badgesRes = await fetch("/api/admin/gamification/badges");
        if (!badgesRes.ok) {
          const errData = await badgesRes.json().catch(() => ({}));
          if (errData.redirect) {
            router.push(errData.redirect);
            return;
          }
          throw new Error(errData.error || "Failed to fetch badges");
        }
        setBadges(await badgesRes.json());

        // Achievements
        const achRes = await fetch("/api/admin/gamification/achievements");
        if (!achRes.ok) {
          const errData = await achRes.json().catch(() => ({}));
          if (errData.redirect) {
            router.push(errData.redirect);
            return;
          }
          throw new Error(errData.error || "Failed to fetch achievements");
        }
        setAchievements(await achRes.json());

        // Leaderboard
        const lbRes = await fetch("/api/admin/gamification/leaderboard");
        if (!lbRes.ok) {
          const errData = await lbRes.json().catch(() => ({}));
          if (errData.redirect) {
            router.push(errData.redirect);
            return;
          }
          throw new Error(errData.error || "Failed to fetch leaderboard");
        }
        setLeaderboard(await lbRes.json());
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Refetch badges
  const refetchBadges = async () => {
    const res = await fetch("/api/admin/gamification/badges");
    if (res.ok) {
      setBadges(await res.json());
    }
  };

  // Refetch achievements
  const refetchAchievements = async () => {
    const res = await fetch("/api/admin/gamification/achievements");
    if (res.ok) {
      setAchievements(await res.json());
    }
  };

  // Save handlers with error handling
  async function saveBadge(data: Partial<BadgeModel> & {id?: number}) {
    const url = data.id
      ? `/api/admin/gamification/badges/${data.id}`
      : "/api/admin/gamification/badges";
    const method = data.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.redirect) {
        router.push(errData.redirect);
        return;
      }
      throw new Error(
        errData.error || `Failed to ${data.id ? "update" : "create"} badge`
      );
    }
    await refetchBadges();
  }

  async function saveAchievement(
    data: Partial<AchievementDefinitionModel> & {id?: number}
  ) {
    const url = data.id
      ? `/api/admin/gamification/achievements/${data.id}`
      : "/api/admin/gamification/achievements";
    const method = data.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.redirect) {
        router.push(errData.redirect);
        return;
      }
      throw new Error(
        errData.error ||
          `Failed to ${data.id ? "update" : "create"} achievement`
      );
    }
    await refetchAchievements();
  }

  // Dialog state
  const [openBadgeDlg, setOpenBadgeDlg] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeModel | null>(null);

  const [openAchDlg, setOpenAchDlg] = useState(false);
  const [editingAch, setEditingAch] =
    useState<AchievementDefinitionModel | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-destructive">Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Gamification
        </h1>
        <p className="text-muted-foreground mt-1">
          Badges, points, achievements, and student motivation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Total Points Awarded"
          value={summary?.totalPointsAwarded.toLocaleString() || "0"}
        />
        <StatCard
          title="Badges Earned"
          value={summary?.badgesEarned.toLocaleString() || "0"}
        />
        <StatCard
          title="Active Streaks"
          value={summary?.activeStreaks.toLocaleString() || "0"}
        />
        <StatCard
          title="Avg Engagement"
          value={(summary?.avgEngagement || 0) + "%"}
        />
      </div>

      {/* Manage Badges & Achievements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Manage Badges */}
        <Card>
          <CardHeader className="sm:flex-row justify-between">
            <div>
              <CardTitle>Manage Badges</CardTitle>
              <CardDescription>Create and update visual badges</CardDescription>
            </div>
            <Dialog open={openBadgeDlg} onOpenChange={setOpenBadgeDlg}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  size="sm"
                  onClick={() => {
                    setEditingBadge(null);
                    setOpenBadgeDlg(true);
                  }}>
                  <Plus className="h-4 w-4" />
                  New Badge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <BadgeForm
                  initial={editingBadge ?? undefined}
                  onCancel={() => setOpenBadgeDlg(false)}
                  onSave={async (payload) => {
                    await saveBadge(payload);
                    setOpenBadgeDlg(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {badges.length === 0 ? (
                <p className="text-muted-foreground">
                  No badges yet. Create one to get started!
                </p>
              ) : (
                badges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl text-white ${
                        b.color || "bg-gray-400"
                      }`}
                      title={b.icon_name}>
                      🏅
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {b.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <UIBadge variant="secondary">
                              Icon: {b.icon_name}
                            </UIBadge>
                            <UIBadge variant="secondary">
                              Points: {b.points}
                            </UIBadge>
                          </div>
                        </div>
                        <Dialog
                          open={openBadgeDlg && editingBadge?.id === b.id}
                          onOpenChange={(v) => {
                            if (!v) setEditingBadge(null);
                            setOpenBadgeDlg(v);
                          }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setEditingBadge(b);
                                setOpenBadgeDlg(true);
                              }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <BadgeForm
                              initial={b}
                              onCancel={() => {
                                setEditingBadge(null);
                                setOpenBadgeDlg(false);
                              }}
                              onSave={async (payload) => {
                                await saveBadge(payload);
                                setEditingBadge(null);
                                setOpenBadgeDlg(false);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      {b.criteria && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {b.criteria}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manage Achievements */}
        <Card>
          <CardHeader className="sm:flex-row justify-between">
            <div>
              <CardTitle>Manage Achievements</CardTitle>
              <CardDescription>
                Configure <code>AchievementDefinition</code> entries
              </CardDescription>
            </div>
            <Dialog open={openAchDlg} onOpenChange={setOpenAchDlg}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  size="sm"
                  onClick={() => {
                    setEditingAch(null);
                    setOpenAchDlg(true);
                  }}>
                  <Plus className="h-4 w-4" />
                  New Achievement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <AchievementForm
                  initial={editingAch ?? undefined}
                  onCancel={() => setOpenAchDlg(false)}
                  onSave={async (payload) => {
                    await saveAchievement(payload);
                    setOpenAchDlg(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.length === 0 ? (
                <p className="text-muted-foreground">
                  No achievements yet. Create one to get started!
                </p>
              ) : (
                achievements.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Star className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {a.title}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <UIBadge variant="secondary">
                              Code: {a.code}
                            </UIBadge>
                            <UIBadge variant="secondary">
                              Icon: {a.icon}
                            </UIBadge>
                            <UIBadge variant="secondary">
                              Category: {a.category}
                            </UIBadge>
                            <UIBadge variant="secondary">
                              Points: {a.points}
                            </UIBadge>
                            {typeof a.target_value === "number" && (
                              <UIBadge variant="secondary">
                                Target: {a.target_value}
                              </UIBadge>
                            )}
                            <UIBadge
                              variant={a.is_active ? "default" : "secondary"}>
                              {a.is_active ? "Active" : "Inactive"}
                            </UIBadge>
                          </div>
                          {a.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {a.description}
                            </p>
                          )}
                        </div>
                        <Dialog
                          open={openAchDlg && editingAch?.id === a.id}
                          onOpenChange={(v) => {
                            if (!v) setEditingAch(null);
                            setOpenAchDlg(v);
                          }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setEditingAch(a);
                                setOpenAchDlg(true);
                              }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-xl">
                            <AchievementForm
                              initial={a}
                              onCancel={() => {
                                setEditingAch(null);
                                setOpenAchDlg(false);
                              }}
                              onSave={async (payload) => {
                                await saveAchievement(payload);
                                setEditingAch(null);
                                setOpenAchDlg(false);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Students</CardTitle>
          <CardDescription>Current leaderboard rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-muted-foreground">
                No leaderboard data available.
              </p>
            ) : (
              leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1
                        ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                        : entry.rank === 2
                        ? "bg-gray-400/20 text-gray-700 dark:text-gray-400"
                        : entry.rank === 3
                        ? "bg-orange-500/20 text-orange-700 dark:text-orange-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                    {entry.rank === 1
                      ? "🥇"
                      : entry.rank === 2
                      ? "🥈"
                      : entry.rank === 3
                      ? "🥉"
                      : entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {entry.student}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{entry.points} pts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        <span>{entry.badges} badges</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>{entry.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------- Small helpers -------- */

function StatCard({title, value}: {title: string; value: string}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

/* -------- Forms -------- */

function BadgeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<BadgeModel>;
  onSave: (payload: Partial<BadgeModel>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<BadgeModel>>(
    initial ?? {
      name: "",
      icon_name: "medal",
      color: "bg-gray-500",
      points: 0,
      criteria: "",
      rules: {},
    }
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function set<K extends keyof BadgeModel>(key: K, val: BadgeModel[K] | any) {
    setForm((f) => ({...f, [key]: val}));
  }

  return (
    <>
      {/* Wrapper ensures full-height dialog */}
      <div className="flex flex-col h-[80dvh] sm:h-auto">
        {/* ===== HEADER (STATIC) ===== */}
        <DialogHeader className="shrink-0 py-3">
          <DialogTitle className="text-base sm:text-lg">
            {initial?.id ? "Edit Badge" : "New Badge"}
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="px-4 pt-3">
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {formError}
            </div>
          </div>
        )}

        {/* ===== BODY (SCROLLABLE) ===== */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Helping Hand"
                />
              </div>

              <div className="grid gap-2">
                <Label>Icon name</Label>
                <Input
                  value={form.icon_name ?? ""}
                  onChange={(e) => set("icon_name", e.target.value)}
                  placeholder="e.g. crown, gem, medal"
                />
              </div>

              <div className="grid gap-2">
                <Label>Color (Tailwind class)</Label>
                <Input
                  value={form.color ?? ""}
                  onChange={(e) => set("color", e.target.value)}
                  placeholder="e.g. bg-emerald-500"
                />
              </div>

              <div className="grid gap-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={form.points ?? 0}
                  onChange={(e) => set("points", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Criteria</Label>
              <Textarea
                value={form.criteria ?? ""}
                onChange={(e) => set("criteria", e.target.value)}
                placeholder="What must a student do to get this badge?"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Rules (JSON)</Label>
              <Textarea
                value={JSON.stringify(form.rules ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || "{}");
                    set("rules", parsed);
                  } catch {
                    /* keep last valid */
                  }
                }}
                className="font-mono text-xs min-h-[140px]"
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* ===== FOOTER (STATIC) ===== */}
        <DialogFooter className="shrink-0 py-3 bg-background flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto">
            Cancel
          </Button>

          <Button
            onClick={async () => {
              setSaving(true);
              setFormError(null);
              try {
                await onSave({...form, id: initial?.id});
              } catch (e) {
                setFormError((e as Error).message);
              } finally {
                setSaving(false);
              }
            }}
            disabled={!form.name || saving}
            className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}

function AchievementForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<AchievementDefinitionModel>;
  onSave: (
    payload: Partial<AchievementDefinitionModel>
  ) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<AchievementDefinitionModel>>(
    initial ?? {
      code: "",
      title: "",
      description: "",
      icon: "star",
      category: "General",
      target_value: null,
      points: 0,
      is_active: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function set<K extends keyof AchievementDefinitionModel>(
    key: K,
    val: AchievementDefinitionModel[K] | any
  ) {
    setForm((f) => ({...f, [key]: val}));
  }

  return (
    <>
      {/* Wrapper for full-height dialog */}
      <div className="flex flex-col h-[80dvh] sm:h-auto">
        {/* ===== HEADER (STATIC) ===== */}
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-base sm:text-lg">
            {initial?.id ? "Edit Achievement" : "New Achievement"}
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="px-4 pt-3">
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {formError}
            </div>
          </div>
        )}

        {/* ===== BODY (SCROLLABLE) ===== */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Code</Label>
                <Input
                  value={form.code ?? ""}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="e.g. streak_champion"
                />
              </div>

              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={form.title ?? ""}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Streak Champion"
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe what this achievement means"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-2">
                <Label>Icon</Label>
                <Input
                  value={form.icon ?? ""}
                  onChange={(e) => set("icon", e.target.value)}
                  placeholder="e.g. star, trophy, target, zap"
                />
              </div>

              <div className="grid gap-2">
                <Label>Category</Label>
                <Input
                  value={form.category ?? ""}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="e.g. General, Learning, Practice"
                />
              </div>

              <div className="grid gap-2">
                <Label>Target Value (leave empty for non-numeric)</Label>
                <Input
                  type="number"
                  value={form.target_value ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    set("target_value", raw === "" ? null : Number(raw));
                  }}
                />
              </div>

              <div className="grid gap-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={form.points ?? 0}
                  onChange={(e) => set("points", Number(e.target.value))}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="font-medium">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle to enable/disable the achievement
                </p>
              </div>
              <Switch
                checked={!!form.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
            </div>
          </div>
        </div>

        {/* ===== FOOTER (STATIC) ===== */}
        <DialogFooter className="shrink-0 border-t px-4 py-3 bg-background flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto">
            Cancel
          </Button>

          <Button
            onClick={async () => {
              setSaving(true);
              setFormError(null);
              try {
                await onSave({...form, id: initial?.id});
              } catch (e) {
                setFormError((e as Error).message);
              } finally {
                setSaving(false);
              }
            }}
            disabled={!form.title || !form.code || saving}
            className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
