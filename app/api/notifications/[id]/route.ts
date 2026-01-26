import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  "https://texagonbackend.onrender.com/notifications/api/my-notifications";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const getHeaders = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function PATCH(
  req: NextRequest,
  {params}: {params: {id: string}}
) {
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  const id = params.id;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({error: "Invalid ID"}, {status: 400});
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: "Invalid JSON"}, {status: 400});
  }

  if (typeof body.is_read !== "boolean") {
    return NextResponse.json(
      {error: "Body must contain: { is_read: boolean }"},
      {status: 400}
    );
  }

  try {
    const res = await fetch(`${BASE_URL}/${id}/read/`, {
      method: "PATCH",
      headers: getHeaders(sessionToken ? sessionToken : undefined),
      body: JSON.stringify({is_read: body.is_read}),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      }
      if (res.status === 404) {
        return NextResponse.json(
          {error: "Notification not found"},
          {status: 404}
        );
      }
      return NextResponse.json(
        {error: "Failed to update"},
        {status: res.status}
      );
    }

    const data = await res.json();
    console.log(
      data,
      "PATCH single notification response data.......anlaalnalnaf......."
    );
    return NextResponse.json(data, {status: 200});
  } catch (err) {
    console.error("PATCH single notification error:", err);
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}
