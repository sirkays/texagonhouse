import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

// GET /api/code-ide/uploads/resolve?label=myfile.png
// Returns { id, label, original_name, url, content_type, size_bytes }
// for the most recent upload matching the given label.
export async function GET(req: NextRequest) {
  const label = req.nextUrl.searchParams.get("label")?.trim();

  if (!label) {
    return NextResponse.json(
      { error: "Missing required query param: label" },
      { status: 400 }
    );
  }

  const { response, text } = await djangoFetch(
    `/code-ide/api/uploads/resolve/?label=${encodeURIComponent(label)}`,
    { method: "GET" }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch uploads", detail: text },
      { status: response.status }
    );
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid response from server" },
      { status: 502 }
    );
  }

  // Backend may return paginated object or plain object
  const result = Array.isArray(data)
    ? data[0]
    : data.results?.[0] ?? data;

  if (!result) {
    return NextResponse.json(
      { error: `No uploaded file found with label: "${label}"` },
      { status: 404 }
    );
  }

  return NextResponse.redirect(result.url);
}
