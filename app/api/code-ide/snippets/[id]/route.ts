// app/api/ide/snippets/[id]/route.ts
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[Route] Received GET request to /api/ide/snippets/${id}`);

  const t = withTimeout(8000);
  try {
    // backend: /code-ide/api/ide/snippets/{id}/
    const startFetch = await djangoFetch(`/code-ide/api/ide/snippets/${id}/`, {
      method: "GET",
      signal: t.signal,
    });

    if (!startFetch.response.ok) {
      console.error("[Route] External API error response (GET):", startFetch.text);
      const res = NextResponse.json(
        { error: `Failed to fetch data: ${startFetch.text}` },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = startFetch.text ? JSON.parse(startFetch.text) : null;
    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Route] Error fetching data:", error?.message || String(error));

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;

  const t = withTimeout(12000);
  try {
    // backend: /code-ide/snippets/{id}/delete/  (note: not under /api/ide/)
    const startFetch = await djangoFetch(`/code-ide/snippets/${id}/delete/`, {
      method: "DELETE",
      signal: t.signal,
    });

    // 204 => success no content
    if (startFetch.response.status === 204) {
      const res = new NextResponse(null, { status: 204 });
      return attachSetCookie(res, startFetch.setCookie);
    }

    if (!startFetch.response.ok) {
      const res = NextResponse.json(
        { error: `Delete failed: ${startFetch.text}` },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    // If backend returns 200 with body, still normalize to 204
    const res = new NextResponse(null, { status: 204 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
