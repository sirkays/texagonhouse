import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function DELETE(req: Request) {
  // /api/admin/student-devices/<devicePk>
  const pathname = new URL(req.url).pathname;
  const devicePk = pathname.split("/").pop(); // last segment

  if (!devicePk) {
    return NextResponse.json({ detail: "Missing devicePk" }, { status: 400 });
  }

  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/student-devices/${encodeURIComponent(devicePk)}/`,
    { method: "DELETE" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}
