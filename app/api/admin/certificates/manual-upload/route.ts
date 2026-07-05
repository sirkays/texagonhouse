import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const { response, text, setCookie } = await djangoFetch(
      "/academics/api/certificates/manual-upload/",
      {
        method: "POST",
        body: backendFormData,
        // Let browser set the correct multipart/form-data boundary
        headers: {}, 
      }
    );

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const res = NextResponse.json(data, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, {
      status: response.status || 201,
    });
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
