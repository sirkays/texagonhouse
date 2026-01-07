import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/courses/${params.courseId}/pass-criteria`,
    { method: "GET" }
  );

  const headers = new Headers();
  if (setCookie) headers.set("set-cookie", setCookie);
  headers.set("Content-Type", "application/json");

  return new Response(text, { status: response.status, headers });
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const body = await req.text();

  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/courses/${params.courseId}/pass-criteria`,
    {
      method: "POST",
      body,
    }
  );

  const headers = new Headers();
  if (setCookie) headers.set("set-cookie", setCookie);
  headers.set("Content-Type", "application/json");

  return new Response(text, { status: response.status, headers });
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const body = await req.text();

  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/courses/${params.courseId}/pass-criteria`,
    {
      method: "PATCH",
      body,
    }
  );

  const headers = new Headers();
  if (setCookie) headers.set("set-cookie", setCookie);
  headers.set("Content-Type", "application/json");

  return new Response(text, { status: response.status, headers });
}
