import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET() {
  console.log("[Route] Received GET request to /api/store/addresses");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    console.log("[Route] Fetching addresses from", `${BASE_URL}/addresses/`);
    const res = await fetch(`${BASE_URL}/addresses/`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to fetch addresses"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

export async function POST(request: Request) {
  console.log("[Route] Received POST request to /api/store/addresses");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();
    console.log("[Route] Creating new address");
    const res = await fetch(`${BASE_URL}/addresses/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to create address"},
        {status: res.status}
      );
    }

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

export async function PATCH(request: Request) {
  console.log("[Route] Received PATCH request to /api/store/addresses");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        {error: "Address ID is required"},
        {status: 400}
      );
    }

    const body = await request.json();
    console.log("[Route] Updating address", addressId);
    const res = await fetch(`${BASE_URL}/addresses/${addressId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to update address"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

export async function DELETE(request: Request) {
  console.log("[Route] Received DELETE request to /api/store/addresses");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        {error: "Address ID is required"},
        {status: 400}
      );
    }

    console.log("[Route] Deleting address", addressId);
    const res = await fetch(`${BASE_URL}/addresses/${addressId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Route] API response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to delete address"},
        {status: res.status}
      );
    }

    return NextResponse.json(null, {status: 204});
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}
