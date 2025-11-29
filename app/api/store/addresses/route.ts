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
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  const sessionToken = session.user.sessionToken;

  const fullUrl = `${BASE_URL}/addresses`;
  console.log("[StoreAddressesAPI] Initiating fetch for:", fullUrl);

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
        return NextResponse.json({error: "Addresses not found"}, {status: 404});
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

    const normalizedData: AddressesResponse = {
      results: data.results.map((item) => ({
        id: item.id || "",
        full_name: item.full_name || "",
        line1: item.line1 || "",
        line2: item.line2 || "",
        city: item.city || "",
        state: item.state || "",
        postal_code: item.postal_code || "",
        country: item.country || "",
        phone: item.phone || "",
        is_default: item.is_default || false,
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch addresses"},
      {status: 500}
    );
  }
}

// ... (existing imports and constants)

interface CreateAddressResponse {
  id: string;
}

export async function POST(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  const sessionToken = session.user.sessionToken;

  const body = await req.json();

  const fullUrl = `${BASE_URL}/addresses`;
  console.log("[StoreCreateAddressAPI] Initiating POST to:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
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
        {error: "Failed to create address"},
        {status: response.status}
      );
    }

    let data: CreateAddressResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: CreateAddressResponse = {
      id: data.id || "",
    };

    return NextResponse.json(normalizedData, {
      status: 201,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to create address"},
      {status: 500}
    );
  }
}
