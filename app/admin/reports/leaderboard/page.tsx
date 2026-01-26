"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Season = { id: number; name: string; is_active: boolean };
type Row = {
  rank: number;
  student_id: number;
  name: string;
  organization: string | null;
  total_points: number;
  badges_count: number;
  achievements_count: number;
};

export default function AdminLeaderboardPage() {
  const [orgScope, setOrgScope] = useState<"selected" | "all">("selected");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState<string>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  // fetch seasons when scope changes
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/leaderboard/seasons?org_scope=${orgScope}`);
      const data = await res.json();
      setSeasons(Array.isArray(data) ? data : []);
      // default to active season if present
      const active = (Array.isArray(data) ? data : []).find((s: any) => s.is_active);
      setSeasonId(active ? String(active.id) : "");
      setPage(1);
    })();
  }, [orgScope]);

  // fetch leaderboard
  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("org_scope", orgScope);
      if (seasonId) params.set("season", seasonId);
      if (q.trim()) params.set("q", q.trim());
      params.set("page", String(page));
      params.set("page_size", String(pageSize));

      const res = await fetch(`/api/admin/leaderboard/students?${params.toString()}`);
      const data = await res.json();
      setRows(data.results || []);
      setTotal(data.total || 0);
      setLoading(false);
    })();
  }, [orgScope, seasonId, q, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-56">
          <label className="text-sm font-medium">Leaderboard type</label>
          <Select value={orgScope} onValueChange={(v) => setOrgScope(v as any)}>
            <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="selected">This school</SelectItem>
              <SelectItem value="all">General (all schools)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-72">
          <label className="text-sm font-medium">Season</label>
          <Select value={seasonId} onValueChange={(v) => { setSeasonId(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}{s.is_active ? " (Active)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium">Search student</label>
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name or username..." />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="md" className="text-black" />
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-3 w-16">#</th>
                <th className="p-3">Student</th>
                <th className="p-3">School</th>
                <th className="p-3 w-32">Points</th>
                <th className="p-3 w-32">Badges</th>
                <th className="p-3 w-40">Achievements</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id} className="border-t">
                  <td className="p-3">{r.rank}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.organization ?? "-"}</td>
                  <td className="p-3 font-medium">{r.total_points}</td>
                  <td className="p-3">{r.badges_count}</td>
                  <td className="p-3">{r.achievements_count}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={6}>No results.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} • {total} students
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
