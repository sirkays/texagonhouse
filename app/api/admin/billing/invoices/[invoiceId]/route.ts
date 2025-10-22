// import {NextRequest, NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
// const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

// async function getSession() {
//   return await getServerSession(authOptions);
// }

// export async function GET(
//   request: NextRequest,
//   {params}: {params: {invoiceId: string}}
// ) {
//   const invoiceId = params.invoiceId;
//   console.log(`[Invoice Route] Received GET request for invoice: ${invoiceId}`);

//   const session = await getSession();

//   if (!session?.user?.sessionToken) {
//     console.log("[Invoice Route] No session token found");
//     return NextResponse.json({error: "No session token"}, {status: 401});
//   }

//   if (!invoiceId) {
//     return NextResponse.json({error: "Invoice ID is required"}, {status: 400});
//   }

//   try {
//     const url = `${BASE_URL}/api/admin/billing/invoices/${invoiceId}`;
//     console.log("[Invoice Route] Fetching data from", url);

//     const res = await fetch(url, {
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "X-Session-Token": session.user.sessionToken,
//       },
//     });

//     console.log("[Invoice Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Invoice Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Invoice Route] API fetch failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to fetch invoice"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Invoice Route] Error fetching invoice:", error);
//     return NextResponse.json({error: "Internal server error"}, {status: 500});
//   }
// }

import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function getSession() {
  return await getServerSession(authOptions);
}

interface Params {
  params: {
    invoiceId: string;
  };
}

export async function GET(request: NextRequest, {params}: Params) {
  const invoiceId = params.invoiceId;
  console.log(`[Invoice Route] Received GET request for invoice: ${invoiceId}`);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    console.log("[Invoice Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  if (!invoiceId) {
    return NextResponse.json({error: "Invoice ID is required"}, {status: 400});
  }

  try {
    const url = `${BASE_URL}/api/admin/billing/invoices/${invoiceId}`;
    console.log("[Invoice Route] Fetching data from", url);

    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Invoice Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Invoice Route] API response data:", data);

    if (!res.ok) {
      console.log("[Invoice Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to fetch invoice"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Invoice Route] Error fetching invoice:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
