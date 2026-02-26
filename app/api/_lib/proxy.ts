// app/api/_lib/proxy.ts
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";

const API_KEY = process.env.STORE_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

type DjangoFetchResult = {
  response: Response;
  text: string;
  setCookie?: string;
};

export async function djangoFetch(
  path: string,
  init: RequestInit = {}
): Promise<DjangoFetchResult> {
  const session = await getServerSession(authOptions);
  const sessionToken: string | undefined =
    session?.user && "sessionToken" in session.user
      ? (session.user as any).sessionToken ?? undefined
      : undefined;

  const cookieStore = await cookies();
  const cookieHeader =
    cookieStore.getAll().length > 0
      ? cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; ")
      : undefined;

  const baseHeaders: Record<string, string> = {
    Authorization: `Api-Key ${API_KEY}`,
  };

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!isFormData) {
    baseHeaders["Content-Type"] = "application/json";
  }

  if (sessionToken) {
    baseHeaders["X-Session-Token"] = sessionToken;
  }

  if (cookieHeader) {
    baseHeaders["Cookie"] = cookieHeader;
  }

  // -- DEBUG LOGGING (temporary) --
  try {
    console.log("[djangoFetch] ->", {
      url: `${BASE_URL}${path}`,
      out_headers: {
        // show header keys + presence, but do not print secret header values
        keys: Object.keys(baseHeaders),
        has_session_token: !!sessionToken,
        has_cookie_header: !!cookieHeader,
      },
      // show the init passed to fetch (body length only)
      body_length: init?.body ? String((init.body as string).length) : 0,
    });
  } catch (err) {
    // swallow logging errors
    console.log("[djangoFetch] debug log failed", err);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  // -- DEBUG LOGGING (temporary) --
  console.log("[djangoFetch] <- upstream response", {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    content_type: response.headers.get("content-type"),
    // small bodies only — but this helps: print up to 2000 chars of the body
    body_preview:
      typeof text === "string" ? (text.length > 2000 ? text.slice(0, 2000) + "…(truncated)" : text) : null,
    // also print length exactly
    body_length: typeof text === "string" ? text.length : null,
    set_cookie_present: response.headers.has("set-cookie"),
  });

  return {
    response,
    text,
    setCookie: response.headers.get("set-cookie") ?? undefined,
  };
}