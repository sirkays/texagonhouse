// app/api/store/entitlements/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface Entitlement {
  product_id: string;
  title: string;
}

interface EntitlementsResponse {
  results: Entitlement[];
}

export async function GET() {
  try {
    const { response, text, setCookie } = await djangoFetch(
      `/store/api/me/entitlements`,
      { method: "GET" }
    );

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      if (response.status === 403)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      return NextResponse.json(
        { error: "Failed to fetch entitlements" },
        { status: response.status }
      );
    }

    let data: EntitlementsResponse;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    const normalizedEntitlements: Entitlement[] = (data.results ?? []).map(
      (item) => ({
        product_id: item.product_id || "",
        title: item.title || "",
      })
    );

    const res = NextResponse.json(
      { results: normalizedEntitlements },
      { status: 200 }
    );

    // Forward Django cookies (e.g., sessionid) if present
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch entitlements" },
      { status: 500 }
    );
  }
}
