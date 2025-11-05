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

interface ReviewResponse {
  id: string;
  detail: string;
}

export async function POST(
  req: Request,
  {params}: {params: {product_id: string}}
) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  const sessionToken = session.user.sessionToken;

  const body = await req.json();

  const fullUrl = `${BASE_URL}/reviews/${params.product_id}`;
  console.log("[StoreReviewAPI] Initiating POST to:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
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
        {error: "Failed to create/update review"},
        {status: response.status}
      );
    }

    let data: ReviewResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: ReviewResponse = {
      id: data.id || "",
      detail: data.detail || "",
    };

    return NextResponse.json(normalizedData, {
      status: response.status === 201 ? 201 : 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to create/update review"},
      {status: 500}
    );
  }
}
