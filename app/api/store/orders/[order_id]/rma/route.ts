import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface RmaResponse {
  rma_id: string;
  rma_number: string;
}

export async function POST(
  req: Request,
  { params }: { params: { order_id: string } }
) {
  noStore();

  const { order_id } = params;
  const body = await req.json();

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/store/api/orders/${order_id}/rma`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      if (response.status === 403)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (response.status === 404)
        return NextResponse.json({ error: "Order not found" }, { status: 404 });

      return NextResponse.json(
        { error: "Failed to create RMA" },
        { status: response.status }
      );
    }

    let data: RmaResponse;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    const normalizedData: RmaResponse = {
      rma_id: data.rma_id || "",
      rma_number: data.rma_number || "",
    };

    const res = NextResponse.json(normalizedData, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });

    // Forward Django cookies (e.g., sessionid) if present
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch {
    return NextResponse.json({ error: "Failed to create RMA" }, { status: 500 });
  }
}
