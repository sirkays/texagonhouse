import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BASE_URL = "https://texagonbackend.onrender.com";
//const BASE_URL = "http://127.0.0.1:9098";
const API_KEY = process.env.TEXAGON_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { detail: "Invalid or missing session token." },
      { status: 401 }
    );
  }

  // IMPORTANT: point this to your actual Django URL for time_periods_view
  const url = `${BASE_URL}/accounts/api/parent/time-periods/`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    },
  });

  const text = await res.text();
  console.log(text, " data......")
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { detail: "External API returned non-JSON response", raw: text.slice(0, 500) },
      { status: 502 }
    );
  }

  return NextResponse.json(data, { status: res.status });
}
