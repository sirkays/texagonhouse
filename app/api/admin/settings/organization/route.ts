import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

function tryJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !("sessionToken" in session.user) || !session.user.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id");
  if (!orgId) {
    return NextResponse.json({ error: "org_id is required" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/api/organizations/${orgId}/`
    );

    const data = tryJson(text);
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to fetch organization settings" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data ?? {});
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Route] Error fetching organization settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !("sessionToken" in session.user) || !session.user.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id");
  if (!orgId) {
    return NextResponse.json({ error: "org_id is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { response, text, setCookie } = await djangoFetch(
      `/api/organizations/${orgId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );

    const data = tryJson(text);
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to update organization settings" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data ?? {});
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Route] Error updating organization settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
