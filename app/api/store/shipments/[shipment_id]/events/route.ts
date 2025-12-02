// app/api/store/shipments/[shipment_id]/events/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface AddEventResponse {
  id: string;
}

export async function POST(
  req: Request,
  {params}: {params: {shipment_id: string}}
) {
  const body = await req.json();
  const fullUrl = `${BASE_URL}/shipments/${params.shipment_id}/events/`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
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
        return NextResponse.json({error: "Shipment not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to add shipment event"},
        {status: response.status}
      );
    }
    let data: AddEventResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedData: AddEventResponse = {
      id: data.id || "",
    };
    return NextResponse.json(normalizedData, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to add shipment event"},
      {status: 500}
    );
  }
}
