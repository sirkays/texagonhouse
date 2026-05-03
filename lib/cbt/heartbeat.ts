// lib/cbt/heartbeat.ts
export interface HeartbeatResponse {
  status: "in_progress" | "expired" | "submitted" | "no_attempt";
  attempt_id: number | null;
  started_at: string | null;
  expires_at_ms: number | null;
  server_now_ms: number;
  remaining_seconds: number;
}

export async function checkHeartbeat(
  testId: string | number,
  sessionToken: string,
  deviceId?: string
): Promise<HeartbeatResponse | null> {
  try {
    const res = await fetch(`/api/student/cbt/tests/${testId}/heartbeat/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": sessionToken,
        ...(deviceId ? { "X-Device-Id": deviceId } : {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as HeartbeatResponse;
  } catch {
    return null;
  }
}