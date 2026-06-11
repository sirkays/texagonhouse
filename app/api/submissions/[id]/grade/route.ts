// app/api/submissions/[id]/grade/route.ts
// Dedicated proxy for the teacher-only grade action.
// Proxies: PATCH /api/submissions/{id}/grade/ → Django backend
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(`/api/submissions/${params.id}/grade/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const parsed = safeJson(text);
      return NextResponse.json(
        { error: parsed?.detail || parsed?.error || text },
        { status: response.status }
      );
    }
    const res = NextResponse.json(safeJson(text), { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
