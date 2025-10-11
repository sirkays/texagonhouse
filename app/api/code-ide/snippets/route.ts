import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE = "https://texagonbackend.epichouse.online/code-ide/api/ide";
const KEY  = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  /* Doc: only students may list/view snippets */
  if (session.user.role !== "student")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const lesson = searchParams.get("lesson");
  const url = `${BASE}/snippets/${lesson ? `?lesson=${lesson}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Api-Key ${KEY}`,
      "X-Session-Token": session.user.sessionToken,
    },
  });

  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}