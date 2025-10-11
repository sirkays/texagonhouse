import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE = "https://texagonbackend.epichouse.online/code-ide/api/ide";
const KEY  = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (session.user.role !== "student")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const res = await fetch(`${BASE}/snippets/${params.id}/`, {
    headers: {
      Authorization: `Api-Key ${KEY}`,
      "X-Session-Token": session.user.sessionToken,
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}