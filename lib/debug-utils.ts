export function debugLog(context: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const prefix = `[v0] [${timestamp}] [${context}]`

  if (data) {
    console.log(`${prefix} ${message}:`, data)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

export function debugError(context: string, message: string, error?: any) {
  const timestamp = new Date().toISOString()
  const prefix = `[v0] [${timestamp}] [${context}] ERROR`

  if (error) {
    console.error(`${prefix} ${message}:`, error)
  } else {
    console.error(`${prefix} ${message}`)
  }
}

export function debugWarn(context: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const prefix = `[v0] [${timestamp}] [${context}] WARN`

  if (data) {
    console.warn(`${prefix} ${message}:`, data)
  } else {
    console.warn(`${prefix} ${message}`)
  }
}

// Check if all required environment variables are set
export function checkEnvironmentVariables() {
  const required = ["API_BASE_URL", "API_KEY"]
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    debugWarn("ENV", `Missing environment variables: ${missing.join(", ")}`)
    return false
  }

  debugLog("ENV", "All required environment variables are set")
  return true
}
