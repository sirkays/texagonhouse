import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

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

export async function GET(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  const fullUrl = `${BASE_URL}/bnpl/plans`;
  console.log("[StoreBnplPlansAPI] Initiating fetch for:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken ? sessionToken : undefined),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json(
          {error: "BNPL plans not found"},
          {status: 404}
        );
      return NextResponse.json(
        {error: "Failed to fetch BNPL plans"},
        {status: response.status}
      );
    }

    let data: BnplPlansResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: BnplPlansResponse = {
      results: data.results.map((item) => ({
        id: item.id || "",
        provider: item.provider || "",
        name: item.name || "",
        num_installments: item.num_installments || 0,
        interval_days: item.interval_days || 0,
        currency: item.currency || "",
        min_amount: item.min_amount || "0",
        max_amount: item.max_amount || null,
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch BNPL plans"},
      {status: 500}
    );
  }
}
