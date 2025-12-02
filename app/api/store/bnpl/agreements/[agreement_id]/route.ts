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
  req: Request,
  {params}: {params: {agreement_id: string}}
) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  const sessionToken = session.user.sessionToken;

  const fullUrl = `${BASE_URL}/bnpl/agreements/${params.agreement_id}`;
  console.log("[StoreBnplAgreementAPI] Initiating fetch for:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken),
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
        return NextResponse.json({error: "Agreement not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to fetch BNPL agreement"},
        {status: response.status}
      );
    }

    let data: BnplAgreementResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: BnplAgreementResponse = {
      id: data.id || "",
      order_id: data.order_id || "",
      provider: data.provider || "",
      status: data.status || "",
      total_amount: data.total_amount || "0",
      amount_paid: data.amount_paid || "0",
      amount_outstanding: data.amount_outstanding || "0",
      installments: data.installments.map((item) => ({
        id: item.id || "",
        index: item.index || 0,
        due_at: item.due_at || "",
        amount_due: item.amount_due || "0",
        amount_paid: item.amount_paid || "0",
        status: item.status || "",
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch BNPL agreement"},
      {status: 500}
    );
  }
}
