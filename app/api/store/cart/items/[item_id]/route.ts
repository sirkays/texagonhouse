// // // app/api/store/cart/items/[item_id]/route.ts
// // import {NextResponse} from "next/server";
// // import {getServerSession} from "next-auth";
// // import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// // const BASE_URL = "https://texagonbackend.onrender.com/store/api";
// // const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// // const headers = (sessionToken: string | undefined) => ({
// //   Authorization: `Api-Key ${API_KEY}`,
// //   "Content-Type": "application/json",
// //   ...(sessionToken && {"X-Session-Token": sessionToken}),
// // });

// // interface CartItem {
// //   id: string;
// //   product_id: string;
// //   title: string;
// //   price: string;
// //   quantity: number;
// //   line_total: string;
// // }

// // interface CartResponse {
// //   id: string;
// //   items: CartItem[];
// //   coupon: string | null;
// //   subtotal: string;
// // }

// // export async function PATCH(
// //   req: Request,
// //   {params}: {params: {item_id: string}}
// // ) {
// //   const body = await req.json();
// //   const fullUrl = `${BASE_URL}/cart/items/${params.item_id}`;
// //   const session = await getServerSession(authOptions);
// //   const sessionToken = session?.user?.sessionToken;
// //   try {
// //     const response = await fetch(fullUrl, {
// //       method: "PATCH",
// //       headers: headers(sessionToken ? sessionToken : undefined),
// //       body: JSON.stringify(body),
// //     });
// //     const rawResponse = await response.text();
// //     if (!response.ok) {
// //       if (response.status === 401)
// //         return NextResponse.json(
// //           {error: "Session expired", redirect: "/login"},
// //           {status: 401}
// //         );
// //       if (response.status === 400)
// //         return NextResponse.json({error: "Invalid request"}, {status: 400});
// //       if (response.status === 403)
// //         return NextResponse.json({error: "Forbidden"}, {status: 403});
// //       if (response.status === 404)
// //         return NextResponse.json({error: "Item not found"}, {status: 404});
// //       return NextResponse.json(
// //         {error: "Failed to update cart item"},
// //         {status: response.status}
// //       );
// //     }
// //     let data: CartResponse;
// //     try {
// //       data = JSON.parse(rawResponse);
// //     } catch (parseError) {
// //       return NextResponse.json(
// //         {error: "Invalid response format"},
// //         {status: 500}
// //       );
// //     }
// //     const normalizedItems: CartItem[] = data.items.map((item) => ({
// //       id: item.id || "",
// //       product_id: item.product_id || "",
// //       title: item.title || "",
// //       price: item.price || "0",
// //       quantity: item.quantity || 0,
// //       line_total: item.line_total || "0",
// //     }));
// //     const normalizedData: CartResponse = {
// //       id: data.id || "",
// //       items: normalizedItems,
// //       coupon: data.coupon || null,
// //       subtotal: data.subtotal || "0",
// //     };
// //     return NextResponse.json(normalizedData, {status: 200});
// //   } catch (error) {
// //     return NextResponse.json(
// //       {error: "Failed to update cart item"},
// //       {status: 500}
// //     );
// //   }
// // }
// // app/api/store/cart/items/[item_id]/route.ts
// import {NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.onrender.com/store/api";
// const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// const headers = (token?: string) => ({
//   Authorization: `Api-Key ${API_KEY}`,
//   "Content-Type": "application/json",
//   ...(token && {"X-Session-Token": token}),
// });

// export async function PATCH(
//   req: Request,
//   {params}: {params: Promise<{item_id: string}>}
// ) {
//   const {item_id} = await params; // ← awaited
//   const body = await req.json();
//   const fullUrl = `${BASE_URL}/cart/items/${item_id}`;

//   const session = await getServerSession(authOptions);
//   const sessionToken = session?.user?.sessionToken;

//   try {
//     const res = await fetch(fullUrl, {
//       method: "PATCH",
//       headers: headers(sessionToken ? sessionToken : undefined),
//       body: JSON.stringify(body),
//     });

//     const raw = await res.text();
//     if (!res.ok) {
//       // ... handle errors
//     }

//     const data = JSON.parse(raw);
//     const normalized = {
//       id: data.id,
//       items: data.items.map((i: any) => ({
//         id: i.id,
//         product_id: i.product_id,
//         title: i.title,
//         price: i.price,
//         quantity: i.quantity,
//         line_total: i.line_total,
//         image_url: i.image_url,
//         type: i.type,
//         bnpl_enabled: i.bnpl_enabled,
//       })),
//       coupon: data.coupon,
//       subtotal: data.subtotal,
//     };

//     return NextResponse.json(normalized);
//   } catch (e) {
//     return NextResponse.json({error: "Failed"}, {status: 500});
//   }
// }
// app/api/store/cart/items/[item_id]/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (token?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(token && {"X-Session-Token": token}),
});

export async function PATCH(
  req: Request,
  {params}: {params: Promise<{item_id: string}>}
) {
  const {item_id} = await params; // ← awaited
  const body = await req.json();
  const fullUrl = `${BASE_URL}/cart/items/${item_id}`;

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  try {
    const res = await fetch(fullUrl, {
      method: "PATCH",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    if (!res.ok) {
      // ... handle errors
    }

    const data = JSON.parse(raw);
    const normalized = {
      id: data.id,
      items: data.items.map((i: any) => ({
        id: i.id,
        product_id: i.product_id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        line_total: i.line_total,
        image_url: i.image_url,
        type: i.type,
        bnpl_enabled: i.bnpl_enabled,
      })),
      coupon: data.coupon,
      subtotal: data.subtotal,
    };

    return NextResponse.json(normalized);
  } catch (e) {
    return NextResponse.json({error: "Failed"}, {status: 500});
  }
}
