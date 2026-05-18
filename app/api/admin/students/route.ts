// app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const path = queryString
      ? `/orgs/api/admin/students/?${queryString}`
      : `/orgs/api/admin/students/`;

    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail || data?.error || data?.message || "Failed to fetch data";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Students GET] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let proxyBody: BodyInit;
    let name: string | undefined;
    let email: string | undefined;

    if (isMultipart) {
      // Forward the raw FormData to Django (proxy.ts detects FormData and skips Content-Type override)
      const formData = await request.formData();
      name = formData.get("name") as string | undefined;
      email = formData.get("email") as string | undefined;
      proxyBody = formData;
    } else {
      const body = await request.json();
      name = body?.name;
      email = body?.email;
      proxyBody = JSON.stringify(body);
    }

    // Only enforce truly required fields — classroom is optional
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/students/`,
      {
        method: "POST",
        body: proxyBody,
      }
    );

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail || data?.error || data?.message || "Failed to create student";

      const res = NextResponse.json({ detail: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 201 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Students POST] Error creating student:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
