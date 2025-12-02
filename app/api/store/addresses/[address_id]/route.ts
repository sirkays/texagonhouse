// app/api/store/addresses/[address_id]/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function PATCH(
  req: Request,
  {params}: {params: {address_id: string}}
) {
  const body = await req.json();
  const fullUrl = `${BASE_URL}/addresses/${params.address_id}`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
    });
    const rawResponse = await response.text();
    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 400)
        return NextResponse.json({error: "Invalid request"}, {status: 400});
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Address not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to update address"},
        {status: response.status}
      );
    }
    let data: {detail: string};
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    return NextResponse.json(data, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to update address"},
      {status: 500}
    );
  }
}

export async function DELETE(
  req: Request,
  {params}: {params: {address_id: string}}
) {
  const fullUrl = `${BASE_URL}/addresses/${params.address_id}`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(sessionToken ? sessionToken : undefined),
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
    return NextResponse.json({}, {status: 204});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to delete address"},
      {status: 500}
    );
  }
}
