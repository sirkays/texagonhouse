import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(
  request: NextRequest,
  {params}: {params: {slug?: string[]}}
) {
  console.log("[Route] Received GET request to /api/admin/students");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const headers = {
    Authorization: `Api-Key ${API_KEY}`,
    "X-Session-Token": session.user.sessionToken,
  };

  // Handle export if slug is ['export']
  if (params?.slug?.[0] === "export") {
    try {
      console.log(
        "[Route] Fetching export from",
        `${BASE_URL}/api/admin/students/export/`
      );
      const res = await fetch(`${BASE_URL}/api/admin/students/export/`, {
        headers,
      });

      console.log("[Route] API response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.log("[Route] API export failed:", errorText);
        return NextResponse.json(
          {error: errorText || "Failed to export data"},
          {status: res.status}
        );
      }

      const csv = await res.text();
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="students_${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    } catch (error) {
      console.error("[Route] Error exporting data:", error);
      return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
  }

  // Handle list students (base path or with query params)
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : "";
    console.log(
      "[Route] Fetching data from",
      `${BASE_URL}/api/admin/students/${queryString}`
    );
    const res = await fetch(`${BASE_URL}/api/admin/students/${queryString}`, {
      headers,
    });

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to fetch data"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  console.log("[Route] Received POST request to /api/admin/students");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();
    console.log("[Route] Request body:", body);

    if (!body.name || !body.email || !body.admissionNo || !body.classroom) {
      return NextResponse.json(
        {error: "Name, email, admissionNo, and classroom are required"},
        {status: 400}
      );
    }

    console.log(
      "[Route] Creating student from",
      `${BASE_URL}/api/admin/students/`
    );
    const res = await fetch(`${BASE_URL}/api/admin/students/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
    });

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API post failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to create student"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error creating student:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
