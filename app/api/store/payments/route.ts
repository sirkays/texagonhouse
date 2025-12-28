// app/api/billing/create-subscription-payment/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { unstable_noStore as noStore } from "next/cache"

//const BASE_URL = "http://127.0.0.1:9098"
const BASE_URL = "https://texagonbackend.onrender.com"

const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c"

const makeHeaders = (sessionToken: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  "X-Session-Token": sessionToken,
})

export async function POST(req: Request) {
  noStore()

  const endpoint = "/billing/api/create/subscription/payment/"
  const fullUrl = `${BASE_URL}${endpoint}`

  const session = await getServerSession(authOptions)

  const sessionToken = (session as any)?.user?.sessionToken
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  }

  let body: any = null
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      {
        status: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      }
    )
  }

  // Helpful guard because your Django code does `request.data.get("item_list").split(",")`
  // If item_list is missing/undefined, it will crash.
  if (body?.is_store_payment) {
    if (!body?.item_list || typeof body.item_list !== "string") {
      return NextResponse.json(
        { error: "Missing item_list for store payment (expected comma-separated string)" },
        { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      )
    }
  }

  try {
    const resp = await fetch(fullUrl, {
      method: "POST",
      headers: makeHeaders(sessionToken),
      body: JSON.stringify(body),
    })

    const contentType = resp.headers.get("content-type") || ""
    const raw = await resp.text()

    // If Django returns non-JSON, still surface something readable
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          error: "Non-JSON response from backend",
          status: resp.status,
          details: raw?.slice?.(0, 500) ?? "",
        },
        {
          status: 502,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      )
    }

    let data: any
    try {
      data = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON response from backend" },
        { status: 502, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      )
    }

    // Pass through status code from Django
    return NextResponse.json(data, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Backend request failed", details: (error as Error).message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    )
  }
}
