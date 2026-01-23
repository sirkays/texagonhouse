// app/api/admin/teachers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();

    const path = qs
      ? `/orgs/api/admin/teachers/?${qs}`
      : `/orgs/api/admin/teachers/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    // Try parse JSON; if not JSON, fall back to raw text
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: (data && data.detail) || "Failed to fetch data" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data, { status: 200 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Route] Error fetching teachers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // If multipart, we must NOT force application/json.
    // Your djangoFetch currently sets Content-Type: application/json by default,
    // so we override/remove it by setting it to empty and letting fetch handle FormData.
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      if (!formData.get("email")) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const { response, text, setCookie } = await djangoFetch(
        `/orgs/api/admin/teachers/`,
        {
          method: "POST",
          body: formData,
          headers: {
            // override the default "Content-Type": "application/json"
            // so the browser/node sets the correct multipart boundary
            "Content-Type": "",
          },
        }
      );

      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: (data && data.detail) || "Failed to create teacher" },
          { status: response.status }
        );
      }

      const nextRes = NextResponse.json(data, { status: 201 });
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      return nextRes;
    }

    // JSON case
    const jsonBody = await request.json();

    if (!jsonBody?.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/teachers/`,
      {
        method: "POST",
        body: JSON.stringify(jsonBody),
        // no need to set Content-Type here; djangoFetch already sets JSON
      }
    );

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: (data && data.detail) || "Failed to create teacher" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data, { status: 201 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Route] Error creating teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
