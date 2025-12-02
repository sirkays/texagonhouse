// app/api/store/entitlements/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface Entitlement {
  product_id: string;
  title: string;
}

interface EntitlementsResponse {
  results: Entitlement[];
}

export async function GET() {
  const fullUrl = `${BASE_URL}/me/entitlements`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
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
      return NextResponse.json(
        {error: "Failed to fetch entitlements"},
        {status: response.status}
      );
    }
    let data: EntitlementsResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedEntitlements: Entitlement[] = data.results.map((item) => ({
      product_id: item.product_id || "",
      title: item.title || "",
    }));
    return NextResponse.json({results: normalizedEntitlements}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch entitlements"},
      {status: 500}
    );
  }
}
