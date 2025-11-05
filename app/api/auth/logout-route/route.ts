import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

interface Headers {
  [key: string]: string;
}

const headers = (sessionToken: string): Headers => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  "X-Session-Token": sessionToken,
});

interface LogoutResponseData {
  detail?: string;
}

interface LogoutApiResponse {
  message: string;
  detail?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    interface SessionUser {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      sessionToken?: string;
    }

    interface Session {
      user?: SessionUser;
      [key: string]: any;
    }

    const session = await getServerSession(authOptions) as Session;
    console.log("[LogoutRoute] Session:", session);

    if (!session?.user?.sessionToken) {
      console.error("[LogoutRoute] No session or session token");
      const res: NextResponse = NextResponse.json({ message: "Logged out (no session)" }, { status: 200 });
      res.cookies.set("next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      res.cookies.set("next-auth.csrf-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      return res;
    }

    const response: Response = await fetch(`${BASE_URL}/api/auth/logout/`, {
      method: "POST",
      headers: headers(session.user.sessionToken as string),
    });

    console.log("[LogoutRoute] Logout API response status:", response.status);
    console.log("[LogoutRoute] Logout API response headers:", Object.fromEntries(response.headers));

    const rawResponse: string = await response.text();
    console.log("[LogoutRoute] Raw response from logout API:", rawResponse || "Empty response");

    let data: LogoutResponseData = {};
    if (rawResponse) {
      try {
        data = JSON.parse(rawResponse) as LogoutResponseData;
      } catch (parseError) {
        console.error("[LogoutRoute] Failed to parse logout JSON:", parseError);
        data = { detail: "Invalid response format" };
      }
    } else {
      console.log("[LogoutRoute] Empty response from logout API, assuming success");
      data = { detail: "Logged out (assumed)" };
    }

    if (!response.ok) {
      console.error("[LogoutRoute] Logout failed:", response.status, data);
      const res: NextResponse = NextResponse.json({ message: "Logged out (API error)" }, { status: 200 });
      res.cookies.set("next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      res.cookies.set("next-auth.csrf-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      return res;
    }

    console.log("[LogoutRoute] Logout successful:", data);
    const res: NextResponse = NextResponse.json({ message: "Logged out successfully", detail: data.detail }, { status: 200 });
    res.cookies.set("next-auth.session-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
    res.cookies.set("next-auth.csrf-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
    return res;
  } catch (error) {
    console.error("[LogoutRoute] Error:", error);
    const res: NextResponse = NextResponse.json({ message: "Logged out (error)" }, { status: 200 });
    res.cookies.set("next-auth.session-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
    res.cookies.set("next-auth.csrf-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
    return res;
  }
}