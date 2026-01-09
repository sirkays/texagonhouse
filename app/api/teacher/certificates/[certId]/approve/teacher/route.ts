import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  req: Request,
  { params }: { params: { certId: string } }
) {
  const body = await req.text();

  const { response, text, setCookie } = await djangoFetch(
    `/academics/api/certificates/${params.certId}/approve/teacher/`,
    { method: "POST", body }
  );

  const res = new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });

  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}
