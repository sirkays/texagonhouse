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

  // Fetch the student's upload list from the backend
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
    return NextResponse.json({ error: "Invalid response from server" }, { status: 502 });
  }

  // Backend may return a paginated object or a plain array
  const results: any[] = Array.isArray(data) ? data : data.results ?? [];

  // Filter client-side by exact label match (backend may do partial/icontains)
  const match = results.find(
    (f: any) => (f.label ?? "").toLowerCase() === label.toLowerCase()
  );

  if (!match) {
    return NextResponse.json(
      { error: `No uploaded file found with label: "${label}"` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id:            match.id,
    label:         match.label,
    original_name: match.original_name,
    url:           match.url,
    content_type:  match.content_type,
    size_bytes:    match.size_bytes,
  });
}