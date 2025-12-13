import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.sessionToken) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, other_email, action, relationship } = body;

        // Basic validation
        if (!email || !other_email || !action) {
            return NextResponse.json(
                { detail: "Missing required fields: email, other_email, action" },
                { status: 400 }
            );
        }

        const apiUrl = "https://texagonbackend.onrender.com/accounts/api/update-parent-child-link/";

        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Api-Key ${process.env.TEXAGON_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c"}`,
                "X-Session-Token": session.user.sessionToken,
            },
            body: JSON.stringify({
                email,
                other_email,
                action,
                relationship: relationship || "Parent", // Default to "Parent" if not provided
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Parent-Child Link API Error:", error);
        return NextResponse.json(
            { detail: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
