// app/api/billing/create-subscription-payment/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request) {
  noStore();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Guard: Django expects item_list as comma-separated string
  if (body?.is_store_payment) {
    if (!body?.item_list || typeof body.item_list !== "string") {
      return NextResponse.json(
        {
          error:
            "Missing item_list for store payment (expected comma-separated string)",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/billing/api/create/subscription/payment/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const contentType = response.headers.get("content-type") || "";

    // If Django returns non-JSON, surface a readable error
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          error: "Non-JSON response from backend",
          status: response.status,
          details: text?.slice?.(0, 500) ?? "",
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON response from backend" },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const res = NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    // Forward Django cookies (e.g., sessionid) if present
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Backend request failed",
        details: (error as Error).message,
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
