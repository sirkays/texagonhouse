// app/api/code-ide/uploads/[id]/route.ts
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

  const t = withTimeout(20000); // file detail fetch timeout
  try {
    const path = `/code-ide/api/ide/files/${id}/`;
    console.log(`[File Detail] Fetching ${path}`);

    const startFetch = await djangoFetch(path, {
      method: "GET",
      signal: t.signal,
    });

    if (!startFetch.response.ok) {
      console.error(`[File Detail] Backend error ${startFetch.response.status}:`, startFetch.text);
      const res = NextResponse.json(
        { error: `Failed to fetch file: ${startFetch.text}` },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = startFetch.text ? JSON.parse(startFetch.text) : null;
    console.log(`[File Detail] Success for file ${id}`);

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[File Detail Route] Error:", error?.message || String(error));

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

  const t = withTimeout(15000);
  try {
    const path = `/code-ide/api/ide/files/${id}/delete/`;

    const startFetch = await djangoFetch(path, {
      method: "DELETE",
      signal: t.signal,
    });

    // Some backends return 204 on delete
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

    // Normalize to 204 even if backend returns 200
    const res = new NextResponse(null, { status: 204 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[File Delete Route] Error:", error?.message || String(error));

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
