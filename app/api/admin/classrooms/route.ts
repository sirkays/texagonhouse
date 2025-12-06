// app/api/admin/classrooms/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ Base configuration
const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// ✅ GET /api/admin/classrooms - List all classrooms
export async function GET(request: Request) {
  console.log(
    "[Admin Classrooms] Received GET request to /api/admin/classrooms"
  );

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    console.warn("[Admin Classrooms] No session token found");
    return NextResponse.json(
      { detail: "Invalid or missing session token." },
      { status: 401 }
    );
  }

  try {
    const endpoint = `${BASE_URL}/api/classrooms/`;
    console.log("[Admin Classrooms] Fetching from:", endpoint);

    const res = await fetchWithRetry(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": sessionToken,
        "Content-Type": "application/json",
      },
    });

    console.log("[Admin Classrooms] Response status:", res.status);

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[Admin Classrooms] Non-JSON response:", text);
      data = { detail: text };
    }

    if (!res.ok) {
      console.error("[Admin Classrooms] Backend error:", data);
      if (res.status === 403) {
        return NextResponse.json(
          { detail: "Unauthorized: Invalid session token or API key" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { detail: data.detail || "Failed to fetch classrooms" },
        { status: res.status }
      );
    }

    console.log("[Admin Classrooms] Successfully fetched classrooms");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Admin Classrooms] Error fetching classrooms:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// ✅ POST /api/admin/classrooms - Create a new classroom
export async function POST(request: Request) {
  console.log(
    "[Admin Classrooms] Received POST request to /api/admin/classrooms"
  );

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    console.warn("[Admin Classrooms] No session token found");
    return NextResponse.json(
      { detail: "Invalid or missing session token." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const endpoint = `${BASE_URL}/api/classrooms/`;
    console.log("[Admin Classrooms] Creating classroom at:", endpoint);

    const res = await fetchWithRetry(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": sessionToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("[Admin Classrooms] Response status:", res.status);

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[Admin Classrooms] Non-JSON response:", text);
      data = { detail: text };
    }

    if (!res.ok) {
      console.error("[Admin Classrooms] Backend error:", data);
      if (res.status === 403) {
        return NextResponse.json(
          { detail: "Unauthorized: Invalid session token or API key" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { detail: data.detail || "Failed to create classroom" },
        { status: res.status }
      );
    }

    console.log("[Admin Classrooms] Successfully created classroom");
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Admin Classrooms] Error creating classroom:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// Reusable fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  timeout = 30000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      console.error(
        "[Admin Classrooms] Fetch attempt",
        i + 1,
        "failed:",
        err.message
      );
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
}

/* Note: For editing (PATCH) and deleting (DELETE) individual classrooms, create a dynamic route at app/api/admin/classrooms/[id]/route.ts with similar structure:
- GET: Fetch single classroom details
- PATCH: Update classroom
- DELETE: Delete classroom

Example structure:
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  // similar to POST, but endpoint = `${BASE_URL}/api/classrooms/${params.id}/`, method: "PATCH"
}

Similar for GET and DELETE.
*/
