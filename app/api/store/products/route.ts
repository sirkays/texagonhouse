// app/api/store/products/route.ts
// (Sample provided in query, copied here for completeness with minor adjustments for consistency)
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

//const BASE_URL = "http://127.0.0.1:9098/store/api";
const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
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
  pay_in_4_amount: string;
}

interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {results: Product[]};
}

export async function GET(req: Request) {
  noStore();
  const {searchParams} = new URL(req.url);
  const params = new URLSearchParams();
  if (searchParams.get("page"))
    params.append("page", searchParams.get("page")!);
  if (searchParams.get("page_size"))
    params.append("page_size", searchParams.get("page_size")!);
  if (searchParams.get("q")) params.append("q", searchParams.get("q")!);
  if (searchParams.get("category"))
    params.append("category", searchParams.get("category")!);
  if (searchParams.get("type"))
    params.append("type", searchParams.get("type")!);
  if (searchParams.get("sort"))
    params.append("sort", searchParams.get("sort")!);
  if (searchParams.get("min_price"))
    params.append("min_price", searchParams.get("min_price")!);
  if (searchParams.get("max_price"))
    params.append("max_price", searchParams.get("max_price")!);
  const queryString = params.toString();
  const fullUrl = `${BASE_URL}/products/${queryString ? `?${queryString}` : ""}`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(`${fullUrl}`, {
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
        return NextResponse.json({error: "Products not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to fetch products"},
        {status: response.status}
      );
    }
    let data: ProductsResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      // return NextResponse.json(
      //   {error: "Invalid response format"},
      //   {status: 500}
      // );
      console.error("Fetch error for products:", parseError);
      return NextResponse.json(
        {error: "Backend service unavailable"},
        {status: 503}
      );
    }
    const normalizedProducts: Product[] = data.results.results.map((item) => ({
      id: item.id || "",
      title: item.title || "",
      slug: item.slug || "",
      type: item.type || "",
      category: item.category || "",
      price: item.price || "0",
      rating: item.rating || 0,
      rating_count: item.rating_count || 0,
      image: item.image || null,
      bnpl_enabled: item.bnpl_enabled || false,
      description: item.description || "",
      pay_in_4_amount: item.pay_in_4_amount || "",
    }));
    const normalizedData = {
      count: data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
      results: {results: normalizedProducts},
    };

    console.log(normalizedData)
    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch products"},
      {status: 500}
    );
  }
}
