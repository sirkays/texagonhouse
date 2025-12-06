import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BASE_BACKEND_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
    return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
    console.log("[Languages Route] GET /api/admin/languages");
    const session = await getSession();

    if (!session?.user?.sessionToken) {
        return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = searchParams.get("page") || "1";
    const page_size = searchParams.get("page_size") || "20";

    // Attempting /api/languages/ (Root + Plural) as per documentation
    const url = new URL(`${BASE_BACKEND_URL}/api/languages/`);
    if (q) url.searchParams.append("q", q);
    url.searchParams.append("page", page);
    url.searchParams.append("page_size", page_size);

    console.log("[Languages Route] Fetching from:", url.toString());

    try {
        const res = await fetch(url.toString(), {
            headers: {
                "Authorization": `Api-Key ${API_KEY}`,
                "X-Session-Token": session.user.sessionToken,
                "Content-Type": "application/json",
            },
        });

        console.log("[Languages Route] Backend response status:", res.status);
        const data = await res.json();
        console.log("[Languages Route] Backend response data:", JSON.stringify(data, null, 2));

        if (!res.ok) {
            return NextResponse.json(
                { error: data.detail || "Failed to fetch languages" },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[Languages Route] Error fetching languages:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
