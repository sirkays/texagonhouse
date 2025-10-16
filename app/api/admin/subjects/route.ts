import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function getSession() {
  return await getServerSession(authOptions);
}

// GET: List all subjects
export async function GET(request: NextRequest) {
  console.log("[Subjects Route] GET /api/admin/subjects");
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";
  const page_size = searchParams.get("page_size") || "20";
  const org_id = searchParams.get("org_id");

  const url = new URL(`${BASE_URL}/api/subjects/`);
  if (q) url.searchParams.append("q", q);
  url.searchParams.append("page", page);
  url.searchParams.append("page_size", page_size);
  if (org_id) url.searchParams.append("org_id", org_id);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, {status: res.status});
  } catch (error) {
    console.error("[Subjects Route] Error listing subjects:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

// POST: Create subject
export async function POST(request: NextRequest) {
  console.log("[Subjects Route] POST /api/admin/subjects");
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();

    const res = await fetch(`${BASE_URL}/api/subjects/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, {status: res.status});
  } catch (error) {
    console.error("[Subjects Route] Error creating subject:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
