import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface BnplPlan {
  id: string;
  provider: string;
  name: string;
  num_installments: number;
  interval_days: number;
  currency: string;
  min_amount: string;
  max_amount: string | null;
}

interface BnplPlansResponse {
  results: BnplPlan[];
}

export async function GET(_req: Request) {
  noStore();

  try {
    const { response, text, setCookie } = await djangoFetch(`/store/api/bnpl/plans`, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      if (response.status === 403)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (response.status === 404)
        return NextResponse.json({ error: "BNPL plans not found" }, { status: 404 });

      return NextResponse.json(
        { error: "Failed to fetch BNPL plans" },
        { status: response.status }
      );
    }

    let data: BnplPlansResponse;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    const normalizedData: BnplPlansResponse = {
      results: (data.results ?? []).map((item) => ({
        id: item.id || "",
        provider: item.provider || "",
        name: item.name || "",
        num_installments: item.num_installments || 0,
        interval_days: item.interval_days || 0,
        currency: item.currency || "",
        min_amount: item.min_amount || "0",
        max_amount: item.max_amount ?? null,
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
      { error: "Failed to fetch BNPL plans" },
      { status: 500 }
    );
  }
}
