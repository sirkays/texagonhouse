import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!BASE_URL || !API_KEY) {
  throw new Error(
    "Missing required environment variables: API_BASE_URL, API_KEY"
  );
}

interface ApiCallOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiServerCall(
  endpoint: string,
  options: ApiCallOptions = {}
) {
  const {requiresAuth = true, ...fetchOptions} = options;

  let sessionToken: string | null = null;

  if (requiresAuth) {
    const session = await getServerSession(authOptions);
    sessionToken = session?.user?.sessionToken || null;

    if (!sessionToken) {
      throw new Error("No session token");
    }
  }

  const url = `${BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    Authorization: `Api-Key ${API_KEY}`,
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (sessionToken) {
    headers["X-Session-Token"] = sessionToken;
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to fetch data");
    }

    return data;
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    throw error;
  }
}
