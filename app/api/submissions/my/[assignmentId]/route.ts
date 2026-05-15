// app/api/submissions/my/[assignmentId]/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

export async function GET(req: Request, { params }: { params: { assignmentId: string } }) {
  noStore();
  try {
    const { assignmentId } = params;
    const { response, text, setCookie } = await djangoFetch(
      `/api/submissions/?assignment=${assignmentId}`,
      { method: "GET" }
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch submission", detail: safeJson(text)?.detail || text },
        { status: response.status }
      );
    }
    const data = safeJson(text);
    // The backend SubmissionViewSet already filters by the current user (student)
    // Return first match (since unique_together ensures at most one)
    const results = data?.results || data || [];
    const submission = Array.isArray(results) ? results[0] || null : null;
    const res = NextResponse.json({ submission }, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch submission", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}
