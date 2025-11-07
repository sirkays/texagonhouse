// ########################################
// ### Webhooks Module
// ########################################

// app/api/store/webhooks/tracking/route.ts
import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = () => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
});

interface WebhookResponse {
  detail: string;
  event_id: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const fullUrl = `${BASE_URL}/webhooks/tracking/`;
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    const rawResponse = await response.text();
    if (!response.ok) {
      if (response.status === 400)
        return NextResponse.json({error: "Invalid request"}, {status: 400});
      if (response.status === 404)
        return NextResponse.json({error: "Shipment not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to process webhook"},
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
    return NextResponse.json(normalizedData, {status: 202});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to process webhook"},
      {status: 500}
    );
  }
}
