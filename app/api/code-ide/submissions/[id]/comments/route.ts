import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE = "https://texagonbackend.epichouse.online/code-ide/api/ide";
const KEY  = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  /* Doc: student owner OR teacher may comment */
  /* (Backend will enforce ownership/course membership; we just forward.) */
  const body = await req.text();
  const res = await fetch(`${BASE}/submissions/${params.id}/comments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${KEY}`,
      "X-Session-Token": session.user.sessionToken,
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}