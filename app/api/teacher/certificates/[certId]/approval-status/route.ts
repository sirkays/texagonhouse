import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: { certId: string } }
) {
  const { response, text, setCookie } = await djangoFetch(
    `/api/certificates/${params.certId}/approval-status/`,
    { method: "GET" }
  );

  const res = new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });

  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}
