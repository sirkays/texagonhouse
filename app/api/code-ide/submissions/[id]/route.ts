import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE = "https://texagonbackend.epichouse.online/code-ide/api/ide";
const KEY  = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

/* ---------- shared proxy ------- */
const proxy = async (method: string, tail: string, body?: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const res = await fetch(`${BASE}/submissions/${tail}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${KEY}`,
      "X-Session-Token": session.user.sessionToken,
    },
    ...(body && { body }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
};

/* GET  /api/code-ide/submissions/:id   (student owner or teacher) */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  return proxy("GET", `${params.id}/`);
}

/* PATCH /api/code-ide/submissions/:id  → teacher-update */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.text();
  return proxy("PATCH", `${params.id}/teacher-update/`, body);
}