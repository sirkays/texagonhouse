import { NextRequest, NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

const streamApiKey = process.env.STREAM_API_KEY!;
const streamSecretKey = process.env.STREAM_SECRET_KEY!;

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
      const isRoomOpen = custom.is_room_open !== false && custom.is_room_open !== "false";
      const hostId = response.call?.created_by?.id || null;
      const endedAt = response.call?.ended_at || null;

      const result = {
        is_public: isPublic,
        is_room_open: isRoomOpen,
        title: custom.description || "Meeting",
        call_type: callType,
        host_id: hostId,
        ended_at: endedAt,
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
