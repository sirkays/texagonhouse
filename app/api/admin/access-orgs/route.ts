// import {NextRequest, NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.onrender.com/accounts";
// const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// async function getSession() {
//   return await getServerSession(authOptions);
// }

// export async function GET(request: NextRequest) {
//   console.log("[Route] Received GET request to /api/admin/access-orgs");
//   const session = await getSession();
//   console.log("[Route] Session data:", {
//     sessionToken: session?.user?.sessionToken,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[Route] No session token found");
//     return NextResponse.json({error: "No session token"}, {status: 401});
//   }

//   try {
//     console.log(
//       "[Route] Fetching data from",
//       `${BASE_URL}/api/fetch-admin/access-orgs/`
//     );
//     const res = await fetch(`${BASE_URL}/api/fetch-admin/access-orgs/`, {
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "Session-Token": session.user.sessionToken,
//       },
//     });

//     console.log("[Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Route] API fetch failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to fetch data"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Route] Error fetching data:", error);
//     return NextResponse.json({error: "Internal server error"}, {status: 500});
//   }
// }

// export async function POST(request: NextRequest) {
//   console.log("[Route] Received POST request to /api/admin/access-orgs");
//   const session = await getSession();
//   console.log("[Route] Session data:", {
//     sessionToken: session?.user?.sessionToken,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[Route] No session token found");
//     return NextResponse.json({error: "No session token"}, {status: 401});
//   }

//   try {
//     const body = await request.json();
//     console.log("[Route] Request body:", body);

//     if (!body.orgs_id) {
//       return NextResponse.json(
//         {error: "Organization ID is required"},
//         {status: 400}
//       );
//     }

//     console.log(
//       "[Route] Setting organization from",
//       `${BASE_URL}/api/set-admin/access-orgs/`
//     );
//     const res = await fetch(`${BASE_URL}/api/set-admin/access-orgs/`, {
//       method: "POST",
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "Content-Type": "application/json",
//         "Session-Token": session.user.sessionToken,
//       },
//       body: JSON.stringify({orgs_id: body.orgs_id}),
//     });

//     console.log("[Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Route] API post failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to set organization"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Route] Error setting organization:", error);
//     return NextResponse.json({error: "Internal server error"}, {status: 500});
//   }
// }

import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/accounts";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
  console.log("[Route] Received GET request to /api/admin/access-orgs");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    console.log(
      "[Route] Fetching data from",
      `${BASE_URL}/api/fetch-admin/access-orgs/`
    );
    const res = await fetch(`${BASE_URL}/api/fetch-admin/access-orgs/`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
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
  console.log("[Route] Received POST request to /api/admin/access-orgs");
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

    if (!body.orgs_id) {
      return NextResponse.json(
        {error: "Organization ID is required"},
        {status: 400}
      );
    }

    console.log(
      "[Route] Setting organization from",
      `${BASE_URL}/api/set-admin/access-orgs/`
    );
    const res = await fetch(`${BASE_URL}/api/set-admin/access-orgs/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify({orgs_id: body.orgs_id}),
    });

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API post failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to set organization"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error setting organization:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
