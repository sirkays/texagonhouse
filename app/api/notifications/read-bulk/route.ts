import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  "https://texagonbackend.onrender.com/notifications/api/my-notifications";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const getHeaders = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: "Invalid JSON"}, {status: 400});
  }

  if (!Array.isArray(body.ids) || typeof body.is_read !== "boolean") {
    return NextResponse.json(
      {error: "Body must contain: { ids: number[], is_read: boolean }"},
      {status: 400},
    );
  }

  try {
    const res = await fetch(`${BASE_URL}/read-bulk/`, {
      method: "PATCH",
      headers: getHeaders(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401},
        );
      }
      return NextResponse.json(
        {error: "Failed to update notifications"},
        {status: res.status},
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {status: 200});
  } catch (err) {
    console.error("Bulk PATCH error:", err);
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}
