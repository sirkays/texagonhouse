// app/api/store/addresses/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
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

interface Address {
  id: string;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

interface AddressesResponse {
  results: Address[];
}

export async function GET(req: Request) {
  noStore();

  const t = withTimeout(12000);
  try {
    // BASE_URL is handled by proxy.ts, so include only the relative path
    const startFetch = await djangoFetch(`/store/api/addresses/`, {
      method: "GET",
      signal: t.signal,
    });

    const data = safeJsonParse<AddressesResponse>(startFetch.text);

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

      const res = NextResponse.json(
        { error: "Failed to fetch addresses", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    if (!data || !Array.isArray(data.results)) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: startFetch.text?.slice(0, 300) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const normalizedAddresses: Address[] = data.results.map((item: any) => ({
      id: item?.id || "",
      full_name: item?.full_name || "",
      line1: item?.line1 || "",
      line2: item?.line2 || "",
      city: item?.city || "",
      state: item?.state || "",
      postal_code: item?.postal_code || "",
      country: item?.country || "US",
      phone: item?.phone || "",
      is_default: !!item?.is_default,
    }));

    const res = NextResponse.json(
      { results: normalizedAddresses },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to fetch addresses",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

export async function POST(req: Request) {
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
    const startFetch = await djangoFetch(`/store/api/addresses/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });

    const data = safeJsonParse<{ id: string }>(startFetch.text);

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 400) {
        const res = NextResponse.json({ error: "Invalid request", raw: startFetch.text }, { status: 400 });
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to create address", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    if (!data) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: startFetch.text?.slice(0, 300) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: 201 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to create address",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
