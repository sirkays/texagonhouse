import { headers } from "next/headers"

const API_BASE_URL = process.env.API_BASE_URL || "https://texagonbackend.onrender.com/store/api"
const API_KEY = process.env.API_KEY

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean
}

export async function apiCall<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options

  const headersList = await headers()
  const sessionToken = headersList.get("x-session-token")

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY || "",
    ...fetchOptions.headers,
  }

  if (requiresAuth && sessionToken) {
    requestHeaders["X-SESSION-TOKEN"] = sessionToken
  }

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(error.detail || `API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}
