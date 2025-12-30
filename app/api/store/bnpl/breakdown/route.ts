// app/api/store/bnpl/breakdown/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

// Match your existing pattern
//const BASE_URL = "http://127.0.0.1:9098/store/api";
const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function POST(req: Request) {
  noStore();

  const body = await req.json().catch(() => ({}));
  const fullUrl = `${BASE_URL}/bnpl/breakdown/`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken as string | undefined;

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
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );

      if (response.status === 403)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // try to pass backend message through (if any)
      try {
        const parsed = JSON.parse(rawResponse || "{}");
        return NextResponse.json(
          { error: parsed?.detail || parsed?.error || "Failed to fetch BNPL breakdown" },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: "Failed to fetch BNPL breakdown" },
          { status: response.status }
        );
      }
    }

    // success: parse json safely
    try {
      const data = JSON.parse(rawResponse || "{}");
      return NextResponse.json(data, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch BNPL breakdown" },
      { status: 500 }
    );
  }
}
