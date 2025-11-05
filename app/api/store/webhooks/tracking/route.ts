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

interface WebhookResponse {
  detail: string;
  event_id: string;
}

export async function POST(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken; // Optional

  const body = await req.json();

  const fullUrl = `${BASE_URL}/webhooks/tracking/`;
  console.log("[StoreWebhookTrackingAPI] Initiating POST to:", fullUrl);

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
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to ingest webhook"},
        {status: response.status}
      );
    }

    let data: WebhookResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: WebhookResponse = {
      detail: data.detail || "",
      event_id: data.event_id || "",
    };

    return NextResponse.json(normalizedData, {
      status: 202,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to ingest webhook"},
      {status: 500}
    );
  }
}
