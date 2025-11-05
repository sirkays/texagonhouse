import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/code-ide";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function fetchWithTimeout(url: string, options: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function withAuthHeaders() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    throw new Error("Missing session token");
  }
  return {
    Authorization: `Api-Key ${API_KEY}`,
    "X-Session-Token": session.user.sessionToken,
    "Content-Type": "application/json",
  };
}

export { BASE_URL };