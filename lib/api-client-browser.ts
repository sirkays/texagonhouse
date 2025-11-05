export async function clientApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.detail || errorMessage
      } catch {
        // If response is not JSON, use status message
        errorMessage = response.statusText || errorMessage
      }
      console.error(`[v0] API Error [${endpoint}]:`, errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log(`[v0] API Success [${endpoint}]:`, data)
    return data
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`[v0] Client API Error [${endpoint}]:`, errorMessage)
    throw error
  }
}
