"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { Award, Trophy, Star, Zap, Pencil, Plus, Save } from "lucide-react";

/* -------- Types (match your models) -------- */
type BadgeModel = {
  id: number;
  name: string;
  icon_name: string;
  color: string; // Tailwind bg class
  points: number;
  criteria?: string;
  rules?: Record<string, any>;
};

type AchievementDefinitionModel = {
  id: number;
  code:
    | "first_steps"
    | "code_warrior"
    | "quiz_master"
    | "streak_champion"
    | "course_conqueror"
    | string;
  title: string;
  description?: string;
  icon: string;
  category: string;
  target_value?: number | null;
  points: number;
  is_active: boolean;
};

/* -------- Dummy data -------- */
const DUMMY_BADGES: BadgeModel[] = [
  { id: 1, name: "Perfect Attendance", icon_name: "medal", color: "bg-emerald-500", points: 100, criteria: "100% attendance for a month", rules: { days: 30 } },
  { id: 2, name: "Top Scorer",         icon_name: "crown", color: "bg-amber-500",   points: 150, criteria: "Score 95%+ on 5 tests",   rules: { tests: 5, minScore: 95 } },
  { id: 3, name: "Quick Learner",      icon_name: "zap",   color: "bg-indigo-500",  points: 80,  criteria: "Complete 10 modules in a week", rules: { modules: 10, windowDays: 7 } },
  { id: 4, name: "Helping Hand",       icon_name: "hand",  color: "bg-pink-500",    points: 60,  criteria: "Help 5 classmates", rules: { assists: 5 } },
];

const DUMMY_ACHIEVEMENTS: AchievementDefinitionModel[] = [
  {
    id: 1,
    code: "first_steps",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "star",
    category: "General",
    target_value: 1,
    points: 20,
    is_active: true,
  },
  {
    id: 2,
    code: "streak_champion",
    title: "Streak Champion",
    description: "Maintain a 30-day learning streak",
    icon: "zap",
    category: "Consistency",
    target_value: 30,
    points: 200,
    is_active: true,
  },
  {
    id: 3,
    code: "quiz_master",
    title: "Quiz Master",
    description: "Get ≥ 90% in 5 quizzes",
    icon: "trophy",
    category: "Assessment",
    target_value: 5,
    points: 150,
    is_active: true,
  },
];

/* -------- Page -------- */
export default function GamificationPage() {
  const leaderboard = [
    { rank: 1, student: "Sarah Williams", points: 2450, badges: 12, streak: 45 },
    { rank: 2, student: "John Doe", points: 2380, badges: 11, streak: 38 },
    { rank: 3, student: "Mike Johnson", points: 2210, badges: 10, streak: 42 },
    { rank: 4, student: "Emily Davis", points: 2150, badges: 9, streak: 35 },
    { rank: 5, student: "Tom Brown", points: 2090, badges: 9, streak: 28 },
  ];

  // Local state only (no API)
  const [badges, setBadges] = useState<BadgeModel[]>(DUMMY_BADGES);
  const [achievements, setAchievements] = useState<AchievementDefinitionModel[]>(DUMMY_ACHIEVEMENTS);

  // Dialog state
  const [openBadgeDlg, setOpenBadgeDlg] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeModel | null>(null);

  const [openAchDlg, setOpenAchDlg] = useState(false);
  const [editingAch, setEditingAch] = useState<AchievementDefinitionModel | null>(null);

  // Save handlers mutate local state
  async function saveBadge(data: Partial<BadgeModel>) {
    if (data.id) {
      setBadges((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } as BadgeModel : b)));
    } else {
      const nextId = Math.max(0, ...badges.map((b) => b.id)) + 1;
      setBadges((prev) => [{ ...(data as BadgeModel), id: nextId }, ...prev]);
    }
  }

  async function saveAchievement(data: Partial<AchievementDefinitionModel>) {
    if (data.id) {
      setAchievements((prev) => prev.map((a) => (a.id === data.id ? { ...a, ...data } as AchievementDefinitionModel : a)));
    } else {
      const nextId = Math.max(0, ...achievements.map((a) => a.id)) + 1;
      setAchievements((prev) => [{ ...(data as AchievementDefinitionModel), id: nextId }, ...prev]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gamification</h1>
        <p className="text-muted-foreground mt-1">Badges, points, achievements, and student motivation</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Points Awarded" value="124,567" />
        <StatCard title="Badges Earned" value="892" />
        <StatCard title="Active Streaks" value="234" />
        <StatCard title="Avg Engagement" value="87%" />
      </div>

      {/* Manage Badges & Achievements */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Manage Badges */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
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
                  }}
                >
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
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl text-white ${b.color || "bg-gray-400"}`}
                    title={b.icon_name}
                  >
                    🏅
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{b.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <UIBadge variant="secondary">Icon: {b.icon_name}</UIBadge>
                          <UIBadge variant="secondary">Points: {b.points}</UIBadge>
                        </div>
                      </div>
                      <Dialog
                        open={openBadgeDlg && editingBadge?.id === b.id}
                        onOpenChange={(v) => {
                          if (!v) setEditingBadge(null);
                          setOpenBadgeDlg(v);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingBadge(b);
                              setOpenBadgeDlg(true);
                            }}
                          >
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
                    {b.criteria && <p className="mt-2 text-sm text-muted-foreground">{b.criteria}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manage Achievements */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Manage Achievements</CardTitle>
              <CardDescription>Configure <code>AchievementDefinition</code> entries</CardDescription>
            </div>
            <Dialog open={openAchDlg} onOpenChange={setOpenAchDlg}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  size="sm"
                  onClick={() => {
                    setEditingAch(null);
                    setOpenAchDlg(true);
                  }}
                >
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
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{a.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <UIBadge variant="secondary">Code: {a.code}</UIBadge>
                          <UIBadge variant="secondary">Icon: {a.icon}</UIBadge>
                          <UIBadge variant="secondary">Category: {a.category}</UIBadge>
                          <UIBadge variant="secondary">Points: {a.points}</UIBadge>
                          {typeof a.target_value === "number" && (
                            <UIBadge variant="secondary">Target: {a.target_value}</UIBadge>
                          )}
                          <UIBadge variant={a.is_active ? "default" : "secondary"}>
                            {a.is_active ? "Active" : "Inactive"}
                          </UIBadge>
                        </div>
                        {a.description && <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>}
                      </div>
                      <Dialog
                        open={openAchDlg && editingAch?.id === a.id}
                        onOpenChange={(v) => {
                          if (!v) setEditingAch(null);
                          setOpenAchDlg(v);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingAch(a);
                              setOpenAchDlg(true);
                            }}
                          >
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
              ))}
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
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1
                      ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : entry.rank === 2
                      ? "bg-gray-400/20 text-gray-700 dark:text-gray-400"
                      : entry.rank === 3
                      ? "bg-orange-500/20 text-orange-700 dark:text-orange-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{entry.student}</p>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------- Small helpers -------- */

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

/* -------- Forms (local state only) -------- */

function BadgeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: BadgeModel;
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

  function set<K extends keyof BadgeModel>(key: K, val: BadgeModel[K] | any) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initial ? "Edit Badge" : "New Badge"}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Helping Hand" />
        </div>

        <div className="grid gap-2">
          <Label>Icon name</Label>
          <Input value={form.icon_name ?? ""} onChange={(e) => set("icon_name", e.target.value)} placeholder="e.g. crown, gem, medal" />
        </div>

        <div className="grid gap-2">
          <Label>Color (Tailwind class)</Label>
          <Input value={form.color ?? ""} onChange={(e) => set("color", e.target.value)} placeholder="e.g. bg-emerald-500" />
        </div>

        <div className="grid gap-2">
          <Label>Points</Label>
          <Input type="number" value={form.points ?? 0} onChange={(e) => set("points", Number(e.target.value))} />
        </div>

        <div className="grid gap-2">
          <Label>Criteria</Label>
          <Textarea
            value={form.criteria ?? ""}
            onChange={(e) => set("criteria", e.target.value)}
            placeholder="What must a student do to get this badge?"
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
            className="font-mono text-xs"
            rows={5}
          />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ ...form, id: initial?.id });
            } finally {
              setSaving(false);
            }
          }}
          disabled={!form.name || saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </DialogFooter>
    </>
  );
}

function AchievementForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: AchievementDefinitionModel;
  onSave: (payload: Partial<AchievementDefinitionModel>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<AchievementDefinitionModel>>(
    initial ?? {
      code: "first_steps",
      title: "",
      description: "",
      icon: "star",
      category: "General",
      target_value: 1,
      points: 0,
      is_active: true,
    }
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof AchievementDefinitionModel>(key: K, val: AchievementDefinitionModel[K] | any) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const codeOptions = useMemo(
    () => ["first_steps", "code_warrior", "quiz_master", "streak_champion", "course_conqueror"],
    []
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initial ? "Edit Achievement" : "New Achievement"}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label>Code</Label>
          <Select defaultValue={String(form.code)} onValueChange={(v) => set("code", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose code" />
            </SelectTrigger>
            <SelectContent>
              {codeOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Title</Label>
          <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Streak Champion" />
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe what this achievement means"
          />
        </div>

        <div className="grid gap-2">
          <Label>Icon</Label>
          <Input value={form.icon ?? ""} onChange={(e) => set("icon", e.target.value)} placeholder="e.g. star, trophy, target, zap" />
        </div>

        <div className="grid gap-2">
          <Label>Category</Label>
          <Input value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="e.g. General, Learning, Practice" />
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
          <Input type="number" value={form.points ?? 0} onChange={(e) => set("points", Number(e.target.value))} />
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label className="font-medium">Active</Label>
            <p className="text-xs text-muted-foreground">Toggle to enable/disable the achievement</p>
          </div>
          <Switch checked={!!form.is_active} onCheckedChange={(v) => set("is_active", v)} />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ ...form, id: initial?.id });
            } finally {
              setSaving(false);
            }
          }}
          disabled={!form.title || !form.code || saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
