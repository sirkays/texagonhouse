// import {NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   "https://texagonbackend.epichouse.online/store/api";
// const API_KEY =
//   process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

// export async function PATCH(request: Request) {
//   console.log("[Route] Received PATCH request to /api/store/cart/items");
//   const session = await getServerSession(authOptions);
//   console.log("[Route] Session data:", {
//     sessionToken: session?.user?.sessionToken,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[Route] No session token found");
//     return NextResponse.json({error: "No session token"}, {status: 401});
//   }

//   try {
//     const {searchParams} = new URL(request.url);
//     const itemId = searchParams.get("id");

//     if (!itemId) {
//       return NextResponse.json({error: "Item ID is required"}, {status: 400});
//     }

//     const body = await request.json();
//     console.log("[Route] Updating cart item", itemId);
//     const res = await fetch(`${BASE_URL}/cart/items/${itemId}/`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "Content-Type": "application/json",
//         "X-Session-Token": session.user.sessionToken,
//       },
//       body: JSON.stringify({quantity: body.quantity}),
//     });

//     console.log("[Route] API response status:", res.status);
//     const text = await res.text();
//     const data = text ? JSON.parse(text) : {};

//     if (!res.ok) {
//       console.log("[Route] API fetch failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to update cart item"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Route] Error:", error);
//     return NextResponse.json(
//       {error: error instanceof Error ? error.message : "Internal server error"},
//       {status: 500}
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   console.log("[Route] Received DELETE request to /api/store/cart/items");
//   const session = await getServerSession(authOptions);
//   console.log("[Route] Session data:", {
//     sessionToken: session?.user?.sessionToken,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[Route] No session token found");
//     return NextResponse.json({error: "No session token"}, {status: 401});
//   }

//   try {
//     const {searchParams} = new URL(request.url);
//     const itemId = searchParams.get("id");

//     if (!itemId) {
//       return NextResponse.json({error: "Item ID is required"}, {status: 400});
//     }

//     console.log("[Route] Removing cart item", itemId);
//     const res = await fetch(`${BASE_URL}/cart/items/${itemId}/remove/`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "Content-Type": "application/json",
//         "X-Session-Token": session.user.sessionToken,
//       },
//     });

//     console.log("[Route] API response status:", res.status);

//     if (!res.ok) {
//       const text = await res.text();
//       const data = text ? JSON.parse(text) : {};
//       console.log("[Route] API fetch failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to remove cart item"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(null, {status: 204});
//   } catch (error) {
//     console.error("[Route] Error:", error);
//     return NextResponse.json(
//       {error: error instanceof Error ? error.message : "Internal server error"},
//       {status: 500}
//     );
//   }
// }

import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function parseResponse(res: Response) {
  console.log("[Route] API response status:", res.status);
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[Route] Failed to parse response as JSON:", parseError);
      // Fallback: treat as empty object, but you could return 502 if strict
    }
  }
  return {data, text};
}

export async function PATCH(request: Request) {
  console.log("[Route] Received PATCH request to /api/store/cart/items");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({error: "Item ID is required"}, {status: 400});
    }

    const body = await request.json();
    console.log(
      "[Route] Updating cart item",
      itemId,
      "with quantity:",
      body.quantity
    );

    const res = await fetch(`${BASE_URL}/cart/items/${itemId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify({quantity: body.quantity}),
    });

    const {data} = await parseResponse(res);

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to update cart item"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

export async function DELETE(request: Request) {
  console.log("[Route] Received DELETE request to /api/store/cart/items");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({error: "Item ID is required"}, {status: 400});
    }

    console.log("[Route] Removing cart item", itemId);
    const res = await fetch(`${BASE_URL}/cart/items/${itemId}/remove/`, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const {data} = await parseResponse(res);

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to remove cart item"},
        {status: res.status}
      );
    }

    console.log("[Route] Item removed successfully");
    // FIXED: Proxy backend's status/body (e.g., 200 with data) instead of forcing 204
    // If backend ever uses 204, this still works (data will be {})
    return NextResponse.json(data, {status: res.status});
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}
