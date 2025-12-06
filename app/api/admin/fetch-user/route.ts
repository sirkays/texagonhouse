import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const sessionToken = (session?.user as any)?.sessionToken;
        const userRole = (session?.user as any)?.role;
        const userEmail = (session?.user as any)?.email;

        console.log(`[fetch-user] Request from: ${userEmail}, Role: ${userRole}`);

        if (!sessionToken) {
            return NextResponse.json(
                { detail: "Session token not found. Please log in." },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        if (!body.email) {
            return NextResponse.json(
                { detail: "Email field is required." },
                { status: 400 }
            );
        }

        // Forward request to backend
        const response = await fetch(`${BACKEND_URL}/accounts/api/auth/fetch-user/`, {
            method: "POST",
            headers: {
                "Authorization": `Api-Key ${API_KEY}`,
                "X-Session-Token": sessionToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log("[fetch-user] Backend Response:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("Backend API Error:", {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error in fetch-user API:", error);
        return NextResponse.json(
            { detail: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
