// app/api/billing/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function noStoreJson(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

function noStoreJsonSimple(body: any, status = 200) {
  // (used in a couple spots where you previously set only no-store)
  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  noStore();

  const endpoint = "/billing/api/fetch/invoices/";
  const { searchParams } = new URL(req.url);
  const path = `${endpoint}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    // If proxy forwards Django cookies, pass them through
    const extraHeaders: Record<string, string> = {};
    if (setCookie) extraHeaders["Set-Cookie"] = setCookie;

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error("[BillingAPI] Fetch failed:", response.status, text.slice(0, 100));

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { error: "Billing endpoint not found" },
          { status: 404, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch invoices" },
        { status: response.status, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[BillingAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[BillingAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        ...extraHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[BillingAPI] Fetch error:", error);
    return noStoreJsonSimple(
      { error: "Failed to fetch invoices", details: (error as Error).message },
      500
    );
  }
}

export async function POST(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const endpoint =
    searchParams.get("action") === "confirm"
      ? "/billing/api/confirm/payment/"
      : "/billing/api/create/subscription/payment/";

  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    console.error("[BillingAPI] Failed to parse request body:", error);
    return noStoreJsonSimple({ error: "Invalid request body" }, 400);
  }

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "POST",
      // djangoFetch already sets JSON content-type; we just provide the body
      body: JSON.stringify(body),
    });

    const extraHeaders: Record<string, string> = {};
    if (setCookie) extraHeaders["Set-Cookie"] = setCookie;

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error("[BillingAPI] Fetch failed:", response.status, text.slice(0, 100));

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        {
          error: `Failed to ${
            searchParams.get("action") === "confirm"
              ? "confirm payment"
              : "create payment"
          }`,
        },
        { status: response.status, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[BillingAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[BillingAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { ...extraHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(data, {
      status: searchParams.get("action") === "confirm" ? 200 : 201,
      headers: {
        ...extraHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[BillingAPI] Fetch error:", error);
    return noStoreJsonSimple(
      {
        error: `Failed to ${
          searchParams.get("action") === "confirm"
            ? "confirm payment"
            : "create payment"
        }`,
        details: (error as Error).message,
      },
      500
    );
  }
}
