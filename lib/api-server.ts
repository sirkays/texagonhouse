import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BASE_URL = process.env.API_BASE_URL
const API_KEY = process.env.API_KEY

if (!BASE_URL || !API_KEY) {
  throw new Error("Missing required environment variables: API_BASE_URL, API_KEY")
}

interface ApiCallOptions extends RequestInit {
  requiresAuth?: boolean
}

export async function apiServerCall(endpoint: string, options: ApiCallOptions = {}) {
  const { requiresAuth = true, ...fetchOptions } = options

  console.log(`[Route] Received ${fetchOptions.method || "GET"} request to ${endpoint}`)

  let sessionToken: string | null = null

  if (requiresAuth) {
    const session = await getServerSession(authOptions)
    sessionToken = session?.user?.sessionToken || null

    console.log("[Route] Session data:", {
      sessionToken: sessionToken ? "present" : "missing",
    })

    if (!sessionToken) {
      console.log("[Route] No session token found")
      throw new Error("No session token")
    }
  }

  const url = `${BASE_URL}${endpoint}`
  console.log("[Route] Fetching data from", url)

  const headers: HeadersInit = {
    Authorization: `Api-Key ${API_KEY}`,
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }

  if (sessionToken) {
    headers["X-Session-Token"] = sessionToken
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    console.log("[Route] API response status:", res.status)

    const data = await res.json()
    console.log("[Route] API response data:", data)

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data)
      throw new Error(data.detail || "Failed to fetch data")
    }

    return data
  } catch (error) {
    console.error("[Route] Error fetching data:", error)
    throw error
  }
}
