// texagon_academy\texagonui\app\api\auth\logout-route\route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.STORE_API_KEY || "WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8";

interface Headers {
  [key: string]: string;
}

const headers = (sessionToken: string): Headers => ({
  Authorization: `Api-Key ${API_KEY}`,
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

    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user?.sessionToken) {
      console.error("[LogoutRoute] No session or session token");
      const res: NextResponse = NextResponse.json(
        {message: "Logged out (no session)"},
        {status: 200}
      );
      res.cookies.set("next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.cookies.set("next-auth.csrf-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      return res;
    }

    const response: Response = await fetch(`${BASE_URL}/api/auth/logout/`, {
      method: "POST",
      headers: headers(session.user.sessionToken as string),
    });

    const rawResponse: string = await response.text();

    let data: LogoutResponseData = {};
    if (rawResponse) {
      try {
        data = JSON.parse(rawResponse) as LogoutResponseData;
      } catch (parseError) {
        console.error("[LogoutRoute] Failed to parse logout JSON:", parseError);
        data = {detail: "Invalid response format"};
      }
    } else {
      data = {detail: "Logged out (assumed)"};
    }

    if (!response.ok) {
      console.error("[LogoutRoute] Logout failed:", response.status, data);
      const res: NextResponse = NextResponse.json(
        {message: "Logged out (API error)"},
        {status: 200}
      );
      res.cookies.set("next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.cookies.set("next-auth.csrf-token", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      return res;
    }

    const res: NextResponse = NextResponse.json(
      {message: "Logged out successfully", detail: data.detail},
      {status: 200}
    );
    res.cookies.set("next-auth.session-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.cookies.set("next-auth.csrf-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    return res;
  } catch (error) {
    console.error("[LogoutRoute] Error:", error);
    const res: NextResponse = NextResponse.json(
      {message: "Logged out (error)"},
      {status: 200}
    );
    res.cookies.set("next-auth.session-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.cookies.set("next-auth.csrf-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    return res;
  }
}
