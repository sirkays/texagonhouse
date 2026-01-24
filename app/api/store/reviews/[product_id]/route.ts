// app/api/store/reviews/[productId]/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

interface ReviewResponse {
  id: string;
  detail: string;
}

export async function POST(
  req: Request,
  { params }: { params: { productId: string } | Promise<{ productId: string }> }
) {
  const { productId } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message || String(error) },
      { status: 400 }
    );
  }

  const t = withTimeout(15000);

  try {
    // DRF usually expects trailing slash
    const startFetch = await djangoFetch(`/store/api/reviews/${productId}/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 400) {
        const res = NextResponse.json(
          { error: "Invalid product", raw: startFetch.text },
          { status: 400 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const parsed = safeJsonParse<any>(startFetch.text);
      const msg = parsed?.detail || parsed?.error || "Failed to create review";

      const res = NextResponse.json(
        { error: msg, raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = safeJsonParse<ReviewResponse>(startFetch.text);
    if (data === null) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: (startFetch.text || "").slice(0, 300) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const normalizedData: ReviewResponse = {
      id: (data as any)?.id || "",
      detail: (data as any)?.detail || "",
    };

    // keep your "201 or 200" behavior
    const status = startFetch.response.status === 201 ? 201 : 200;

    const res = NextResponse.json(normalizedData, { status });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to create review",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
