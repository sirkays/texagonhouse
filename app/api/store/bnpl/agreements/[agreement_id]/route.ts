// texagon_academy/texagonui/app/api/store/bnpl/agreements/[agreement_id]/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface Installment {
  id: string;
  index: number;
  due_at: string;
  amount_due: string;
  amount_paid: string;
  status: string;
}

interface BnplAgreementResponse {
  id: string;
  order_id: string;
  provider: string;
  status: string;
  total_amount: string;
  amount_paid: string;
  amount_outstanding: string;
  installments: Installment[];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ agreement_id: string }> } // params is async in your codebase
) {
  noStore();

  const { agreement_id } = await params;

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/store/api/bnpl/agreements/${agreement_id}/`,
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
      if (response.status === 404)
        return NextResponse.json({ error: "Agreement not found" }, { status: 404 });

      return NextResponse.json(
        { error: "Failed to fetch BNPL agreement" },
        { status: response.status }
      );
    }

    let data: BnplAgreementResponse;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    const normalizedData: BnplAgreementResponse = {
      id: data.id || "",
      order_id: data.order_id || "",
      provider: data.provider || "",
      status: data.status || "",
      total_amount: data.total_amount || "0",
      amount_paid: data.amount_paid || "0",
      amount_outstanding: data.amount_outstanding || "0",
      installments: (data.installments ?? []).map((item) => ({
        id: item.id || "",
        index: item.index || 0,
        due_at: item.due_at || "",
        amount_due: item.amount_due || "0",
        amount_paid: item.amount_paid || "0",
        status: item.status || "",
      })),
    };

    const res = NextResponse.json(normalizedData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });

    // Forward Django cookies (e.g., sessionid) if Django sets any
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch BNPL agreement" },
      { status: 500 }
    );
  }
}
