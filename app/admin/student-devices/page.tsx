"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type Device = {
  id: number;
  device_id: string;
  user_agent: string;
  first_seen: string;
  last_seen: string;
};

type StudentResult = {
  student_id: number;
  user_id: number;
  email: string;
  full_name: string | null;
  organization_id: number;
  devices: Device[];
};

type ApiResp = {
  count: number;
  results: StudentResult[];
};

export default function StudentDevicesAdminPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSearch() {
    const q = query.trim();
    if (!q) {
      setData({ count: 0, results: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/student-devices?query=${encodeURIComponent(q)}&limit=20`);
      const json = (await res.json()) as ApiResp;

      if (!res.ok) {
        throw new Error((json as any)?.detail || "Failed to search");
      }
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(devicePk: number) {
    const ok = window.confirm("Delete this device? The student may be forced to re-auth on that device.");
    if (!ok) return;

    try {
      setDeletingId(devicePk);
      setError(null);

      const res = await fetch(`/api/admin/student-devices/${devicePk}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error((json as any)?.detail || "Failed to delete device");
      }

      // remove device from state without refetch
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results
            .map((s) => ({ ...s, devices: s.devices.filter((d) => d.id !== devicePk) }))
            .filter((s) => s.devices.length > 0), // optional: hide students with no devices left
        };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeletingId(null);
    }
  }

  const hasResults = useMemo(() => (data?.results?.length || 0) > 0, [data]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Devices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search by student email or name, then delete a device to revoke it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. student@email.com or Jane Doe"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
          />
          <Button onClick={onSearch} disabled={loading}>
            {loading ? <Spinner size="sm" className="text-black" /> : "Search"}
          </Button>
        </CardContent>
      </Card>

      {error && <div className="text-sm text-red-600">Error: {error}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Spinner size="md" className="text-black" />
            </div>
          )}

          {!loading && !data && <div className="text-sm text-muted-foreground">No search yet.</div>}

          {!loading && data && !hasResults && (
            <div className="text-sm text-muted-foreground">No matches found.</div>
          )}

          {!loading && data && hasResults && (
            <div className="space-y-4">
              {data.results.map((student) => (
                <div key={student.student_id} className="rounded-lg border p-3 space-y-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">
                      {student.full_name || "Unnamed Student"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                  </div>

                  <div className="space-y-2">
                    {student.devices.map((d) => (
                      <div
                        key={d.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border p-2"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{d.device_id}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            last_seen: {new Date(d.last_seen).toLocaleString()}
                          </div>
                          {d.user_agent ? (
                            <div className="text-xs text-muted-foreground truncate">{d.user_agent}</div>
                          ) : null}
                        </div>

                        <Button
                          variant="destructive"
                          onClick={() => onDelete(d.id)}
                          disabled={deletingId === d.id}
                        >
                          {deletingId === d.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
