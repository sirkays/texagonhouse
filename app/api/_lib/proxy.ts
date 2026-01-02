import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.STORE_BASE_URL || "http://127.0.0.1:9098";
//const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = process.env.STORE_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function djangoFetch(path: string, init?: RequestInit) {
  const session = await getServerSession(authOptions);
  const sessionToken = (session as any)?.user?.sessionToken as string | undefined;

  const headers: Record<string, string> = {
    Authorization: `Api-Key ${API_KEY}`,
    "Content-Type": "application/json",
  };
  if (sessionToken) headers["X-Session-Token"] = sessionToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
    cache: "no-store",
  });

  const text = await res.text();
  return { res, text };
}
