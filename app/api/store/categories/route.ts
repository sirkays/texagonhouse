import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
}

interface CategoriesResponse {
  results: Category[];
}

export async function GET(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  const fullUrl = `${BASE_URL}/categories`;
  console.log("[StoreCategoriesAPI] Initiating fetch for:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken ? sessionToken : undefined),
    });

    console.log("[StoreCategoriesAPI] Fetch response status:", response.status);

    const rawResponse = await response.text();

    if (!response.ok) {
      console.error(
        "[StoreCategoriesAPI] Fetch failed:",
        response.status,
        rawResponse
      );
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json(
          {error: "Categories not found"},
          {status: 404}
        );
      return NextResponse.json(
        {error: "Failed to fetch categories"},
        {status: response.status}
      );
    }

    let data: CategoriesResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[StoreCategoriesAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: CategoriesResponse = {
      results: data.results.map((item) => ({
        id: item.id || "",
        name: item.name || "",
        slug: item.slug || "",
        parent: item.parent || null,
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    console.error("[StoreCategoriesAPI] Fetch error:", error);
    return NextResponse.json(
      {error: "Failed to fetch categories"},
      {status: 500}
    );
  }
}
