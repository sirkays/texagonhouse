// app/api/billing/transactions/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  noStore();

  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    // NOT under /orgs — matches your original endpoint
    const path = queryString
      ? `/billing/api/transactions-list/?${queryString}`
      : `/billing/api/transactions-list/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401, headers: { "Cache-Control": "no-store" } }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      const res = NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: response.status, headers: { "Cache-Control": "no-store" } }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const data = parseJsonSafely(text);
    if (!data) {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Billing Transactions] Error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
