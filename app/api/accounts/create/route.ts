// app/api/accounts/create/route.ts   (adjust path if needed)
import {NextRequest, NextResponse} from "next/server";

const BASE_URL =
  process.env.TEXAGON_BASE_URL || "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    console.error("TEXAGON_API_KEY is missing in environment variables");
    return NextResponse.json(
      {detail: "Server configuration error."},
      {status: 500}
    );
  }

  try {
    const body = await request.json();

    // Validation (as before)
    if (!body.email || !body.password) {
      return NextResponse.json(
        {detail: "email and password are required."},
        {status: 400}
      );
    }

    if (
      body.account_type &&
      !["teacher", "parent", "student"].includes(body.account_type)
    ) {
      return NextResponse.json(
        {
          detail:
            "account_type must be one of: 'teacher', 'parent', 'student'.",
        },
        {status: 400}
      );
    }

    // Build payload (as before)
    const payload: Record<string, any> = {
      email: body.email,
      password: body.password,
      first_name: body.first_name ?? undefined,
      last_name: body.last_name ?? undefined,
      phone: body.phone ?? undefined,
      primary_org_id: body.primary_org_id ?? undefined,
      account_type: body.account_type ?? "teacher",
    };

    if (body.account_type === "parent") {
      if (body.address !== undefined) payload.address = body.address;
      if (body.organization_subscription_id !== undefined)
        payload.organization_subscription_id =
          body.organization_subscription_id;
    }

    if (body.account_type === "student") {
      if (body.parent_profile_id !== undefined)
        payload.parent_profile_id = body.parent_profile_id;
      if (body.admission_no !== undefined)
        payload.admission_no = body.admission_no;
      if (body.dob !== undefined) payload.dob = body.dob;
      if (body.classroom_id !== undefined)
        payload.classroom_id = body.classroom_id;
      if (body.relationship !== undefined)
        payload.relationship = body.relationship;
    }

    // Forward request
    const response = await fetch(`${BASE_URL}/accounts/api/account/create/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Improved handling: Read as text first to handle non-JSON responses (e.g., HTML errors from Django)
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      // If not JSON, log and return the text as error detail
      console.error(
        `Backend returned non-JSON (status: ${response.status}):`,
        responseText.substring(0, 500) // Truncate long HTML for log
      );
      return NextResponse.json(
        {
          detail: responseText || "Backend returned invalid response",
          error_type: "non_json_response",
        },
        {status: response.status || 500}
      );
    }

    // If JSON, proxy as-is
    return NextResponse.json(responseData, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Account creation proxy error:", error);

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json(
        {detail: "Invalid JSON in request body."},
        {status: 400}
      );
    }

    return NextResponse.json({detail: "Internal server error."}, {status: 500});
  }
}
