import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const BASE_URL = "https://texagonbackend.onrender.com";
//const BASE_URL = "http://127.0.0.1:9098";
const API_KEY =
  process.env.TEXAGON_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

/**
 * Parent cancels an upcoming tutoring booking
 * Proxies PATCH to Django using Api-Key + X-Session-Token
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { detail: "Invalid or missing session token." },
      { status: 401 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { detail: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // Accept either booking_id or id (nice DX)
  const booking_id = body.booking_id ?? body.id;

  if (!booking_id) {
    return NextResponse.json(
      { detail: "booking_id (or id) is required." },
      { status: 400 }
    );
  }

  // IMPORTANT: point this to your Django cancel endpoint
  // Example Django route: /api/tutor/tutoring/bookings/cancel/
  const url = `${BASE_URL}/api/tutor/tutoring/bookings/cancel/`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    },
    body: JSON.stringify({
      booking_id, // keep naming consistent with Django serializer
    }),
  });

  const text = await res.text();

  // Try parse JSON; if backend returns non-JSON, surface safely
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json(
      {
        detail: "External API returned non-JSON response",
        raw: text.slice(0, 500),
      },
      { status: 502 }
    );
  }

  return NextResponse.json(data, { status: res.status });
}
