// import {NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";
// import {unstable_noStore as noStore} from "next/cache";

// const BASE_URL = "https://texagonbackend.onrender.com/store/api";
// const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// const headers = (sessionToken: string | undefined) => ({
//   Authorization: `Api-Key ${API_KEY}`,
//   "Content-Type": "application/json",
//   ...(sessionToken && {"X-Session-Token": sessionToken}),
// });

// interface Product {
//   id: string;
//   title: string;
//   slug: string;
//   type: string;
//   category: string;
//   price: string;
//   rating: number;
//   rating_count: number;
//   image: string | null;
//   bnpl_enabled: boolean;
//   description: string;
// }

// export async function GET(req: Request, {params}: {params: {slug: string}}) {
//   noStore();
//   const slug = params.slug;
//   const fullUrl = `${BASE_URL}/products/${slug}`;
//   console.log("[StoreProductDetailAPI] Initiating fetch for:", fullUrl);

//   const session = await getServerSession(authOptions);
//   const sessionToken = session?.user?.sessionToken;

//   try {
//     const response = await fetch(fullUrl, {
//       method: "GET",
//       headers: headers(sessionToken ? sessionToken : undefined),
//     });

//     const rawResponse = await response.text();

//     if (!response.ok) {
//       if (response.status === 401)
//         return NextResponse.json(
//           {error: "Session expired", redirect: "/login"},
//           {status: 401}
//         );
//       if (response.status === 403)
//         return NextResponse.json({error: "Forbidden"}, {status: 403});
//       if (response.status === 404)
//         return NextResponse.json({error: "Product not found"}, {status: 404});
//       return NextResponse.json(
//         {error: "Failed to fetch product"},
//         {status: response.status}
//       );
//     }

//     let data: Product;
//     try {
//       data = JSON.parse(rawResponse);
//     } catch (parseError) {
//       return NextResponse.json(
//         {error: "Invalid response format"},
//         {status: 500}
//       );
//     }

//     const normalizedProduct: Product = {
//       id: data.id || "",
//       title: data.title || "",
//       slug: data.slug || "",
//       type: data.type || "",
//       category: data.category || "",
//       price: data.price || "0",
//       rating: data.rating || 0,
//       rating_count: data.rating_count || 0,
//       image: data.image || null,
//       bnpl_enabled: data.bnpl_enabled || false,
//       description: data.description || "",
//     };

//     return NextResponse.json(normalizedProduct, {
//       status: 200,
//       headers: {"Cache-Control": "no-store"},
//     });
//   } catch (error) {
//     return NextResponse.json({error: "Failed to fetch product"}, {status: 500});
//   }
// }

import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface Product {
  id: string;
  title: string;
  slug: string;
  type: string;
  category: string;
  price: string;
  rating: number;
  rating_count: number;
  image: string | null;
  bnpl_enabled: boolean;
  description: string;
}

export async function GET(
  req: Request,
  context: {params: Promise<{slug: string}>}
) {
  noStore();

  // ✅ Await the entire params object (Next.js 15+ requirement)
  const {slug} = await context.params;

  const fullUrl = `${BASE_URL}/products/${slug}`;
  console.log("[StoreProductDetailAPI] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken ? sessionToken : undefined),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Product not found"}, {status: 404});

      return NextResponse.json(
        {error: "Failed to fetch product"},
        {status: response.status}
      );
    }

    const data: Product = JSON.parse(rawResponse);

    const normalizedProduct: Product = {
      id: data.id || "",
      title: data.title || "",
      slug: data.slug || "",
      type: data.type || "",
      category: data.category || "",
      price: data.price || "0",
      rating: data.rating || 0,
      rating_count: data.rating_count || 0,
      image: data.image || null,
      bnpl_enabled: data.bnpl_enabled || false,
      description: data.description || "",
    };

    return NextResponse.json(normalizedProduct, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    console.error("[StoreProductDetailAPI] Error fetching product:", error);
    return NextResponse.json({error: "Failed to fetch product"}, {status: 500});
  }
}
