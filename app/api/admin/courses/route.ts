// texagon_academy/texagonui/app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const qs = searchParams.toString();

    const path = qs
      ? `/orgs/api/admin/courses/?${qs}`
      : `/orgs/api/admin/courses/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const data = safeJson(text);

    // Forward Django session cookie to browser (if any)
    const res = NextResponse.json(
      response.ok
        ? (data ?? { raw: text })
        : { error: data?.detail || data || "Failed to fetch courses" },
      { status: response.status }
    );

    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Courses Route] Error fetching courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Build body for upstream (djangoFetch will set JSON Content-Type unless FormData)
    let body: BodyInit;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      if (!formData.get("name")) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      body = formData;
    } else {
      const jsonBody = await request.json();

      if (!jsonBody?.name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      body = JSON.stringify(jsonBody);
    }

    // Keep your org_id=1 behavior
    const path = `/orgs/api/admin/courses/create/?org_id=1`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "POST",
      body,
    });

    const data = safeJson(text);

    const res = NextResponse.json(
      response.ok
        ? (data ?? { raw: text })
        : { error: data?.detail || data || "Failed to create course" },
      { status: response.ok ? 201 : response.status }
    );

    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Courses Route] Error creating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
