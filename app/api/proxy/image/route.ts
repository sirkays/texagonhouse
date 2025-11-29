import { NextResponse } from "next/server";
import { headers } from "next/headers";

const BASE_URL = "https://texagonbackend.onrender.com";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path?.join("/") || "";
    const fullUrl = `${BASE_URL}/${imagePath}`;
    
    console.log("[Image Proxy] Fetching:", fullUrl);
    
    const response = await fetch(fullUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Next.js Image Proxy)",
        // Add API key if required by backend
        "Authorization": `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
      },
      cache: "force-cache", // Cache images
    });

    if (!response.ok) {
      console.error("[Image Proxy] Backend returned:", response.status, fullUrl);
      // Return a placeholder or 404
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // 24h cache
        "Content-Length": buffer.byteLength.toString(),
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[Image Proxy] Error:", error);
    // Return a simple placeholder response
    return new NextResponse(null, { status: 500 });
  }
}