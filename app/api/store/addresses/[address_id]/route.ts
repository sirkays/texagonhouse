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

interface UpdateAddressResponse {
  detail: string;
}

export async function PATCH(
  req: Request,
  {params}: {params: {address_id: string}}
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

  const fullUrl = `${BASE_URL}/addresses/${params.address_id}`;
  console.log("[StoreUpdateAddressAPI] Initiating PATCH to:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "PATCH",
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
        return NextResponse.json({error: "Address not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to update address"},
        {status: response.status}
      );
    }

    let data: UpdateAddressResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: UpdateAddressResponse = {
      detail: data.detail || "",
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to update address"},
      {status: 500}
    );
  }
}

// ... (existing imports and constants)

export async function DELETE(
  req: Request,
  {params}: {params: {address_id: string}}
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

  const fullUrl = `${BASE_URL}/addresses/${params.address_id}`;
  console.log("[StoreDeleteAddressAPI] Initiating DELETE to:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(sessionToken),
    });

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Address not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to delete address"},
        {status: response.status}
      );
    }

    return new NextResponse(null, {
      status: 204,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to delete address"},
      {status: 500}
    );
  }
}
