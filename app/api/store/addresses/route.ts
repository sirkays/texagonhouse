// app/api/store/addresses/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface Address {
  id: string;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

interface AddressesResponse {
  results: Address[];
}

export async function GET(req: Request) {
  noStore();
  const fullUrl = `${BASE_URL}/addresses`;
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
        {error: "Failed to fetch addresses"},
        {status: response.status}
      );
    }
    let data: AddressesResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedAddresses: Address[] = data.results.map((item) => ({
      id: item.id || "",
      full_name: item.full_name || "",
      line1: item.line1 || "",
      line2: item.line2 || "",
      city: item.city || "",
      state: item.state || "",
      postal_code: item.postal_code || "",
      country: item.country || "US",
      phone: item.phone || "",
      is_default: item.is_default || false,
    }));
    return NextResponse.json(
      {results: normalizedAddresses},
      {status: 200, headers: {"Cache-Control": "no-store"}}
    );
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch addresses"},
      {status: 500}
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const fullUrl = `${BASE_URL}/addresses`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
    });
    const rawResponse = await response.text();
    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 400)
        return NextResponse.json({error: "Invalid request"}, {status: 400});
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      return NextResponse.json(
        {error: "Failed to create address"},
        {status: response.status}
      );
    }
    let data: {id: string};
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    return NextResponse.json(data, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to create address"},
      {status: 500}
    );
  }
}
