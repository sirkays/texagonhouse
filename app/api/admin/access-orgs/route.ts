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

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !("sessionToken" in session.user) || !session.user.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    // NOTE: proxy BASE_URL is https://texagonbackend.onrender.com
    // so include /accounts in the path
    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/fetch-admin/access-orgs/"
    );

    const data = tryJson(text);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to fetch data" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data ?? {});
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !("sessionToken" in session.user) || !session.user.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body?.orgs_id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/set-admin/access-orgs/",
      {
        method: "POST",
        body: JSON.stringify({ orgs_id: body.orgs_id }),
        // headers optional here; proxy already sets JSON content-type
      }
    );

    const data = tryJson(text);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to set organization" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data ?? {});
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Route] Error setting organization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
