// // // app/api/store/cart/route.ts
// // import {NextResponse} from "next/server";
// // import {getServerSession} from "next-auth";
// // import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// // const BASE_URL = "https://texagonbackend.onrender.com/store/api";
// // const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// // const headers = (sessionToken?: string) => ({
// //   Authorization: `Api-Key ${API_KEY}`,
// //   "Content-Type": "application/json",
// //   ...(sessionToken && {"X-Session-Token": sessionToken}),
// // });

// // export async function GET() {
// //   const session = await getServerSession(authOptions);
// //   const sessionToken = session?.user?.sessionToken;

// //   try {
// //     const res = await fetch(`${BASE_URL}/cart`, {
// //       method: "GET",
// //       headers: headers(sessionToken ? sessionToken : undefined),
// //       signal: AbortSignal.timeout(10000), // 10s timeout
// //       cache: "no-store",
// //     });

// //     if (!res.ok) {
// //       console.error("[CART API ERROR]", res.status, await res.text());
// //       // Return empty cart instead of 500
// //       return NextResponse.json({
// //         id: "",
// //         items: [],
// //         coupon: null,
// //         subtotal: "0",
// //       });
// //     }

// //     const rawText = await res.text();
// //     console.log("[CART RAW RESPONSE]", rawText); // Debug log

// //     let data;
// //     try {
// //       data = JSON.parse(rawText);
// //     } catch (parseError) {
// //       console.error("[CART PARSE ERROR]", parseError);
// //       return NextResponse.json({
// //         id: "",
// //         items: [],
// //         coupon: null,
// //         subtotal: "0",
// //       });
// //     }

// //     // Ensure items array exists
// //     if (!data.items || !Array.isArray(data.items)) {
// //       console.error("[CART INVALID DATA]", data);
// //       return NextResponse.json({
// //         id: "",
// //         items: [],
// //         coupon: null,
// //         subtotal: "0",
// //       });
// //     }

// //     // Normalize with image_url
// //     const normalized = {
// //       id: data.id || "",
// //       items: data.items.map((i: any) => ({
// //         id: i.id || "",
// //         product_id: i.product_id || "",
// //         title: i.title || "Unknown Product",
// //         price: i.price || "0",
// //         quantity: i.quantity || 0,
// //         line_total: i.line_total || "0",
// //         image_url: i.image_url || null, // Critical for images
// //         type: i.type || "physical",
// //         bnpl_enabled: i.bnpl_enabled ?? false,
// //       })),
// //       coupon: data.coupon || null,
// //       subtotal: data.subtotal || "0",
// //     };

// //     console.log("[CART NORMALIZED]", normalized); // Debug log

// //     return NextResponse.json(normalized, {
// //       status: 200,
// //       headers: {
// //         "Cache-Control": "no-store",
// //       },
// //     });
// //   } catch (error) {
// //     console.error("[CART EXCEPTION]", error);
// //     // Return empty cart on error (no 500)
// //     return NextResponse.json({
// //       id: "",
// //       items: [],
// //       coupon: null,
// //       subtotal: "0",
// //     });
// //   }
// // }

// // app/api/store/cart/route.ts
// import {NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.onrender.com/store/api";
// const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
// const CDN = "https://texagonbackend.onrender.com";

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   const sessionToken = session?.user?.sessionToken;

//   try {
//     const res = await fetch(`${BASE_URL}/cart`, {
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "Content-Type": "application/json",
//         ...(sessionToken && {"X-Session-Token": sessionToken}),
//       },
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       return NextResponse.json({
//         id: "",
//         items: [],
//         coupon: null,
//         subtotal: "0",
//       });
//     }

//     const data = await res.json();

//     const normalized = {
//       id: data.id || "",
//       items: (data.items || []).map((i: any) => ({
//         id: i.id || "",
//         product_id: i.product_id || "",
//         title: i.title || "Unknown",
//         price: i.price || "0",
//         quantity: i.quantity || 0,
//         line_total: i.line_total || "0",
//         image: i.image_url ? `${CDN}${i.image_url}` : "/placeholder.svg", // ← FULL URL
//         type: i.type || "physical",
//         bnpl_enabled: i.bnpl_enabled ?? false,
//       })),
//       coupon: data.coupon || null,
//       subtotal: data.subtotal || "0",
//     };

//     return NextResponse.json(normalized);
//   } catch (e) {
//     return NextResponse.json({id: "", items: [], coupon: null, subtotal: "0"});
//   }
// }

// app/api/store/cart/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const CDN = "https://texagonbackend.onrender.com";

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        ...(sessionToken && {"X-Session-Token": sessionToken}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        id: "",
        items: [],
        coupon: null,
        subtotal: "0",
      });
    }

    const data = await res.json();

    const normalized = {
      id: data.id || "",
      items: (data.items || []).map((i: any) => ({
        id: i.id || "",
        product_id: i.product_id || "",
        title: i.title || "Unknown",
        price: i.price || "0",
        quantity: i.quantity || 0,
        line_total: i.line_total || "0",
        image: i.image_url ? `${CDN}${i.image_url}` : "/placeholder.svg", // FULL URL
        type: i.type || "physical",
        bnpl_enabled: i.bnpl_enabled ?? false,
      })),
      coupon: data.coupon || null,
      subtotal: data.subtotal || "0",
    };

    return NextResponse.json(normalized);
  } catch (e) {
    return NextResponse.json({id: "", items: [], coupon: null, subtotal: "0"});
  }
}
