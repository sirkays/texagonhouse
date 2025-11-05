// import {NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.epichouse.online";
// const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz"; // Store in .env

// export async function GET(
//   request: Request,
//   {params}: {params: {path?: string[]}}
// ) {
//   console.log(
//     `[Route] GET handler triggered for path: ${params.path?.join("/") || ""}`
//   );
//   const path = params.path ? params.path.join("/") : "";
//   console.log(`[Route] Received GET request to /api/parent/${path}`);

//   const session = await getServerSession(authOptions);
//   console.log("[Route] Session data:", {
//     sessionToken: session?.user?.sessionToken,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[Route] No session token found");
//     return NextResponse.json(
//       {detail: "Invalid or missing session token."},
//       {status: 401}
//     );
//   }

//   if (path !== "children") {
//     return NextResponse.json({detail: "Not found"}, {status: 404});
//   }

//   try {
//     console.log(
//       "[Route] Fetching data from",
//       `${BASE_URL}/api/parent/children/`
//     );
//     const res = await fetch(`${BASE_URL}/api/parent/children/`, {
//       method: "GET",
//       headers: {
//         "X-API-Key": API_KEY,
//         Authorization: `Session ${session.user.sessionToken}`,
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("[Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Route] API fetch failed:", data);
//       return NextResponse.json(
//         {detail: data.detail || "Failed to fetch children data"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Route] Error fetching children data:", error);
//     return NextResponse.json({detail: "Internal server error"}, {status: 500});
//   }
// }

// export async function POST(
//   request: Request,
//   {params}: {params: {path?: string[]}}
// ) {
//   const path = params.path ? params.path.join("/") : "";

import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY =
  process.env.TEXAGON_API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz"; // Fallback for dev, should be in .env

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/parent/children");

  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    const url = `${BASE_URL}/accounts/api/parent/children/`;
    console.log("[Route] Fetching data from", url);
    const headers = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    };
    console.log("[Route] Request headers:", headers); // Debug headers
    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    console.log("[Route] API response text:", text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[Route] Failed to parse JSON:", e);
      return NextResponse.json(
        {detail: "External API returned an invalid response"},
        {status: 502}
      );
    }

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      if (res.status === 403) {
        return NextResponse.json(
          {detail: "Unauthorized: Invalid session token or API key"},
          {status: 403}
        );
      }
      return NextResponse.json(
        {detail: data.detail || "Failed to fetch children data"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching children data:", error);
    return NextResponse.json({detail: "Internal server error"}, {status: 500});
  }
}

export async function POST(request: Request) {
  console.log(
    "[Route] Received POST request to /api/parent/reset-child-password"
  );

  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    const body = await request.json();
    const {childId, newPassword} = body;

    if (!childId || !newPassword) {
      return NextResponse.json(
        {detail: "child_id and new_password are required."},
        {status: 400}
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {detail: "Password must be at least 8 characters."},
        {status: 400}
      );
    }

    const url = `${BASE_URL}/accounts/api/parent/reset-child-password/`;
    console.log(
      "[Route] Sending reset password request to",
      url,
      "for childId:",
      childId
    );
    const headers = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    };
    console.log("[Route] Request headers:", headers); // Debug headers
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({child_id: childId, new_password: newPassword}),
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    console.log("[Route] API response text:", text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[Route] Failed to parse JSON:", e);
      return NextResponse.json(
        {detail: "External API returned an invalid response"},
        {status: 502}
      );
    }

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      if (res.status === 403) {
        return NextResponse.json(
          {detail: "Unauthorized: Invalid session token or API key"},
          {status: 403}
        );
      }
      return NextResponse.json(
        {detail: data.detail || "Failed to reset password"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error resetting password:", error);
    return NextResponse.json({detail: "Internal server error"}, {status: 500});
  }
}
