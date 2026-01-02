import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const BASE_URL = "https://texagonbackend.onrender.com";
//const BASE_URL = "http://127.0.0.1:9098";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }
  try {
    const backendUrl = new URL(`${BASE_URL}/gamification/api/child/rewards/`);
    const {searchParams} = new URL(request.url);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const res = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to fetch data"},
        {status: res.status}
      );
    }

    // Image normalization: Ensure all avatars are absolute URLs

    if (data.children && Array.isArray(data.children)) {
      data.children.forEach((child: any, index: number) => {
        if (
          child.avatar &&
          typeof child.avatar === "string" &&
          child.avatar.startsWith("/")
        ) {
          child.avatar = `${BASE_URL}${child.avatar}`;
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
