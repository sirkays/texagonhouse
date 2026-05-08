// app/api/_lib/proxy.ts
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";
const API_KEY =
  process.env.STORE_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

type DjangoFetchResult = {
  response: Response;
  text: string;
  setCookie?: string;
};

function buildAuthHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra);

  // Only set if not already set by caller
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Api-Key ${API_KEY}`);
  }
  return headers;
}

// Your existing djangoFetch stays the same (or you can refactor it later)
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

  if (sessionToken) baseHeaders["X-Session-Token"] = sessionToken;
  if (cookieHeader) baseHeaders["Cookie"] = cookieHeader;

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
    setCookie: response.headers.get("set-cookie") ?? undefined,
  };
}

/**
 * Raw variant: does NOT force "Content-Type: application/json".
 * Use it when you need to preserve non-JSON bodies (text/plain, octet-stream, etc.)
 */
export async function djangoFetchRaw(
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

  const headers = buildAuthHeaders(init.headers);

  if (sessionToken && !headers.has("X-Session-Token")) {
    headers.set("X-Session-Token", sessionToken);
  }
  if (cookieHeader && !headers.has("Cookie")) {
    headers.set("Cookie", cookieHeader);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await response.text();

  return {
    response,
    text,
    setCookie: response.headers.get("set-cookie") ?? undefined,
  };
}

/**
 * Binary variant: returns the response body as an ArrayBuffer.
 * Use it for downloading files (ZIP, images, etc.).
 */
export type DjangoBinaryResult = {
  response: Response;
  buffer: ArrayBuffer;
  setCookie?: string;
};

export async function djangoFetchBinary(
  path: string,
  init: RequestInit = {}
): Promise<DjangoBinaryResult> {
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

  const headers = buildAuthHeaders(init.headers);

  if (sessionToken && !headers.has("X-Session-Token")) {
    headers.set("X-Session-Token", sessionToken);
  }
  if (cookieHeader && !headers.has("Cookie")) {
    headers.set("Cookie", cookieHeader);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const buffer = await response.arrayBuffer();

  return {
    response,
    buffer,
    setCookie: response.headers.get("set-cookie") ?? undefined,
  };
}