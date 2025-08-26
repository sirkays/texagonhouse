// app/api/student/cbt/route.ts

import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.esm.name.ng";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";

// ---------------------- GET ----------------------
export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/student/cbt");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const res = await fetch(`${BASE_URL}/assessments/api/tests/available/`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: "Failed to fetch data"},
        {status: res.status}
      );
    }

    return NextResponse.json(data, {status: res.status});
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json().catch(() => ({}));
    console.log(body.currentTest, "bjbhbjhjbhj");
    console.log(
      `${BASE_URL}/assessments/api/tests/${body.currentTest}/submit/`
    );
    const res = await fetch(
      `${BASE_URL}/assessments/api/tests/${body.currentTest}/submit/`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok)
      return NextResponse.json(
        {error: "Failed to submit test"},
        {status: res.status}
      );
    return NextResponse.json(data, {status: res.status});
  } catch (err) {
    console.error(err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
