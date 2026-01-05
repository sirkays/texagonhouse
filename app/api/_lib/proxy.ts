// app/api/_lib/proxy.ts
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL =
  process.env.STORE_BASE_URL || "https://texagonbackend.onrender.com";

const API_KEY =
  process.env.STORE_API_KEY ||
  "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

type DjangoFetchResult = {
  response: Response;
  text: string;
  setCookie?: string;
};

export async function djangoFetch(
  path: string,
  init: RequestInit = {}
): Promise<DjangoFetchResult> {
  // --- Auth session (optional) ---
  const session = await getServerSession(authOptions);
  const sessionToken: string | undefined =
    session?.user && "sessionToken" in session.user
      ? (session.user as any).sessionToken ?? undefined
      : undefined;

  // --- Cookies (App Router requires async access) ---
  const cookieStore = await cookies();
  const cookieHeader =
    cookieStore.getAll().length > 0
      ? cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; ")
      : undefined;

  // --- Base headers ---
  const baseHeaders: Record<string, string> = {
    Authorization: `Api-Key ${API_KEY}`,
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    baseHeaders["X-Session-Token"] = sessionToken;
  }

  if (cookieHeader) {
    baseHeaders["Cookie"] = cookieHeader;
  }

  // --- Fetch Django ---
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  return {
    response,
    text,
    // IMPORTANT: forward Django sessionid back to browser
    setCookie: response.headers.get("set-cookie") ?? undefined,
  };
}
