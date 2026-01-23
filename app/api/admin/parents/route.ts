import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withForwardedCookie(
  res: NextResponse,
  setCookie?: string
): NextResponse {
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }
  return res;
}

export async function GET(request: NextRequest) {
  try {
    // Preserve query params
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();

    const path = qs ? `/orgs/api/parents/?${qs}` : `/orgs/api/parents/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    // Try parse JSON (Django should return JSON)
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errMsg =
        data?.detail || data?.error || "Failed to fetch parents";
      return withForwardedCookie(
        NextResponse.json({ error: errMsg }, { status: response.status }),
        setCookie
      );
    }

    return withForwardedCookie(NextResponse.json(data), setCookie);
  } catch (error) {
    console.error("[Route] Error fetching parents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let init: RequestInit = { method: "POST" };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      if (!formData.get("email")) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      init = {
        ...init,
        body: formData, // ✅ FIXED (was "fetchrena")
      };
    } else {
      const jsonBody = await request.json();

      if (!jsonBody?.email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      init = {
        ...init,
        body: JSON.stringify(jsonBody),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }

    const { response, text, setCookie } = await djangoFetch(`/orgs/api/parents/`, init);

    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errMsg =
        data?.detail || data?.error || "Failed to create parent";
      return withForwardedCookie(
        NextResponse.json({ error: errMsg }, { status: response.status }),
        setCookie
      );
    }

    return withForwardedCookie(
      NextResponse.json(data, { status: 201 }),
      setCookie
    );
  } catch (error) {
    console.error("[Route] Error creating parent:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
