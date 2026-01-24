// app/api/store/addresses/[address_id]/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = any>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
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

export async function PATCH(
  req: Request,
  { params }: { params: { address_id: string } | Promise<{ address_id: string }> }
) {
  const { address_id } = await params;

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
    // NOTE: backend often wants trailing slash for DRF; keep it
    const startFetch = await djangoFetch(`/store/api/addresses/${address_id}/`, {
      method: "PATCH",
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
          { error: "Invalid request", raw: startFetch.text },
          { status: 400 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 404) {
        const res = NextResponse.json({ error: "Address not found" }, { status: 404 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to update address", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = safeJsonParse<{ detail: string }>(startFetch.text);

    if (!data && startFetch.text) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: startFetch.text.slice(0, 300) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data ?? {}, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to update address",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { address_id: string } | Promise<{ address_id: string }> }
) {
  const { address_id } = await params;

  const t = withTimeout(15000);

  try {
    const startFetch = await djangoFetch(`/store/api/addresses/${address_id}/`, {
      method: "DELETE",
      signal: t.signal,
    });

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 404) {
        const res = NextResponse.json({ error: "Address not found" }, { status: 404 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to delete address", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    // If backend returns 204, no JSON body
    const res = NextResponse.json({}, { status: 204 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to delete address",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
