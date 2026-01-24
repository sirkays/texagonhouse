// app/api/code-ide/uploads/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lesson = searchParams.get("lesson");

    const path =
      `/code-ide/api/ide/files/` + (lesson ? `?lesson=${encodeURIComponent(lesson)}` : "");

    const t = withTimeout(10000);
    try {
      const startFetch = await djangoFetch(path, {
        method: "GET",
        signal: t.signal,
        // headers/session/cookies handled by proxy.ts
      });

      if (!startFetch.response.ok) {
        const res = NextResponse.json(
          { error: `Failed to fetch files: ${startFetch.text}` },
          { status: startFetch.response.status }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      const data = startFetch.text ? JSON.parse(startFetch.text) : null;
      const res = NextResponse.json(data, { status: 200 });
      return attachSetCookie(res, startFetch.setCookie);
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      return NextResponse.json(
        {
          error: isTimeout ? "Connection timeout" : "Internal server error",
          details: err?.message || String(err),
        },
        { status: isTimeout ? 504 : 500 }
      );
    } finally {
      t.clear();
    }
  } catch (error: any) {
    console.error("[Upload Route] Error fetching files:", error?.message || String(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const lesson = (formData.get("lesson") as string | null) || "";
    const label = (formData.get("label") as string | null) || "";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (lesson) backendFormData.append("lesson", lesson);
    if (label) backendFormData.append("label", label);

    const t = withTimeout(30000);
    try {
      // IMPORTANT: djangoFetch won't force Content-Type when body is FormData
      const startFetch = await djangoFetch(`/code-ide/api/ide/files/upload/`, {
        method: "POST",
        signal: t.signal,
        body: backendFormData,
      });

      if (!startFetch.response.ok) {
        console.error("[Upload Route] Backend error:", startFetch.text);
        const res = NextResponse.json(
          { error: `Upload failed: ${startFetch.text}` },
          { status: startFetch.response.status }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      const data = startFetch.text ? JSON.parse(startFetch.text) : null;
      const res = NextResponse.json(data, { status: 201 });
      return attachSetCookie(res, startFetch.setCookie);
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      console.error("[Upload Route] Error uploading file:", err?.message || String(err));
      return NextResponse.json(
        {
          error: isTimeout ? "Connection timeout" : "Internal server error during upload",
          details: err?.message || String(err),
        },
        { status: isTimeout ? 504 : 500 }
      );
    } finally {
      t.clear();
    }
  } catch (error: any) {
    console.error("[Upload Route] Error uploading file:", error?.message || String(error));
    return NextResponse.json({ error: "Internal server error during upload" }, { status: 500 });
  }
}
