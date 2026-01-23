import { djangoFetch } from "@/app/api/_lib/proxy";

type Ctx = { params: Promise<{ courseId: string }> };

function makeHeaders(setCookie?: string) {
  const headers = new Headers();
  if (setCookie) headers.set("set-cookie", setCookie);
  headers.set("Content-Type", "application/json");
  return headers;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { courseId } = await params;

  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/courses/${courseId}/pass-criteria`,
    { method: "GET" }
  );

  return new Response(text, { status: response.status, headers: makeHeaders(setCookie) });
}

export async function POST(req: Request, { params }: Ctx) {
  const { courseId } = await params;
  const body = await req.text();

  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/courses/${courseId}/pass-criteria`,
    { method: "POST", body }
  );

  return new Response(text, { status: response.status, headers: makeHeaders(setCookie) });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { courseId } = await params;
  const body = await req.text();

  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/courses/${courseId}/pass-criteria`,
    { method: "PATCH", body }
  );

  return new Response(text, { status: response.status, headers: makeHeaders(setCookie) });
}
