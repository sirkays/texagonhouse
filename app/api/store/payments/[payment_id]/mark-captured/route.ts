// app/api/store/payments/[paymentId]/mark-captured/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface MarkCapturedRequest {
  provider_ref?: string;
}

interface MarkCapturedResponse {
  detail: string;
  order_status: string;
}

const getSessionToken = (req: Request): string | undefined => {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.headers.get("x-session-token") || undefined;
};

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function POST(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  const { paymentId } = params;

  try {
    const sessionToken = getSessionToken(req);

    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body: MarkCapturedRequest = await req.json();

    const { response, text, setCookie } = await djangoFetch(
      `/store/api/payments/${paymentId}/mark-captured`,
      {
        method: "POST",
        // This endpoint expects these header names; we add them here.
        // proxy.ts still adds Authorization: Api-Key ... but backend can ignore it.
        headers: {
          "X-API-KEY": process.env.STORE_API_KEY || "WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8",
          "X-SESSION-TOKEN": sessionToken,
          // optional: also send the standard casing some endpoints use
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        const res = NextResponse.json({ error: "Payment not found" }, { status: 404 });
        return attachSetCookie(res, setCookie);
      }
      const res = NextResponse.json(
        { error: "Failed to capture payment" },
        { status: response.status }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: MarkCapturedResponse;
    try {
      data = JSON.parse(text);
    } catch {
      const res = NextResponse.json({ error: "Invalid response format" }, { status: 500 });
      return attachSetCookie(res, setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("Mark captured error:", error);
    return NextResponse.json(
      { error: "Failed to mark payment as captured" },
      { status: 500 }
    );
  }
}
