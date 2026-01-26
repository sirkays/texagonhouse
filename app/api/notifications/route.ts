import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL =
  "https://texagonbackend.onrender.com/notifications/api/my-notifications";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const getHeaders = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function GET(req: NextRequest) {
  noStore();

  const {searchParams} = new URL(req.url);
  const unread = searchParams.get("unread");

  let url = `${BASE_URL}/`;
  if (unread !== null) url += `?unread=${unread}`;

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  try {
    const res = await fetch(url, {
      headers: getHeaders(sessionToken ? sessionToken : undefined),
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      }
      if (res.status === 403) {
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      }
      return NextResponse.json(
        {error: "Failed to fetch notifications"},
        {status: res.status}
      );
    }

    const data = await res.json();
    console.log(
      data,
      "GET notifications dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );

    // Normalize: backend returns { notifications: [...] }
    const notifications = Array.isArray(data) ? data : data.notifications || [];

    return NextResponse.json(notifications, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (err) {
    console.error("GET notifications error:", err);
    return NextResponse.json({error: "Internal error"}, {status: 500});
  }
}
