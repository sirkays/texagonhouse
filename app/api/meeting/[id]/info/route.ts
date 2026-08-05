import { NextRequest, NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

const streamApiKey = "cx85x7gj2dxr";
const streamSecretKey =
  "u35v7mqqwfcqdcr544w92kj39r6mm5cxxszqkmgdcmna23m7tn75candrdjw3k2h";

/**
 * GET /api/meeting/[id]/info
 * Returns whether a meeting is public or private.
 * No authentication required — used by the guest join flow.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ is_public: false, error: "Missing meeting ID" }, { status: 400 });
  }

  const client = new StreamClient(streamApiKey, streamSecretKey);

  let fallbackResult: { is_public: boolean; title: string; call_type: string } | null = null;

  for (const callType of ["default", "livestream"] as const) {
    try {
      const call = client.video.call(callType, id);
      const response = await call.get();

      const custom = response.call?.custom || {};
      const isPublic = custom.is_public === true || custom.is_public === "true";

      const result = {
        is_public: isPublic,
        title: custom.description || "Meeting",
        call_type: callType,
      };

      if (isPublic) {
        return NextResponse.json(result);
      }

      if (Object.keys(custom).length > 0 && !fallbackResult) {
        fallbackResult = result;
      }
    } catch {
      continue;
    }
  }

  if (fallbackResult) {
    return NextResponse.json(fallbackResult);
  }

  return NextResponse.json({ is_public: false, error: "Meeting not found" }, { status: 404 });
}
