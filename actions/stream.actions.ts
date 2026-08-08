"use server";

import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {StreamClient} from "@stream-io/node-sdk";

const streamApiKey = process.env.STREAM_API_KEY!;
const streamSecretKey = process.env.STREAM_SECRET_KEY!;

export const tokenProvider = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("User is not authenticated");
  if (!streamApiKey) throw new Error("Stream API key is missing");
  if (!streamSecretKey) throw new Error("Stream API secret is missing");

  const client = new StreamClient(streamApiKey, streamSecretKey);
  const userId: string = String(
    session.user.id || session.user.email || "anonymous"
  );

  // token is valid for an hour
  const validity = 60 * 60;

  try {
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    });

    return token;
  } catch (error) {
    console.error("Token generation failed:", error);
    throw new Error("Failed to generate Stream token");
  }
};

/**
 * Generate a Stream token for a guest user (no auth required).
 * Used for public meetings where anyone can join.
 */
export const guestTokenProvider = async (guestId: string) => {
  if (!streamApiKey) throw new Error("Stream API key is missing");
  if (!streamSecretKey) throw new Error("Stream API secret is missing");

  const client = new StreamClient(streamApiKey, streamSecretKey);

  const validity = 60 * 60; // 1 hour

  try {
    const token = client.generateUserToken({
      user_id: guestId,
      validity_in_seconds: validity,
    });

    return token;
  } catch (error) {
    console.error("Guest token generation failed:", error);
    throw new Error("Failed to generate guest Stream token");
  }
};

export const createStreamCallServer = async (
  id: string,
  startsAt: string,
  description: string,
  callType: "default" | "livestream" = "default",
  isPublic: boolean = false
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("User is not authenticated");
  const client = new StreamClient(streamApiKey, streamSecretKey);
  const userId: string = String(
    session.user.id || session.user.email || "anonymous"
  );

  try {
    const call = client.video.call(callType, id);
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        starts_at: startsAt,
        custom: { description, is_public: isPublic },
        settings_override: {
          backstage: { enabled: false },
          recording: {
            mode: "available",
          },
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[StreamServer] Call creation error:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Fetch all video call recordings directly from GetStream Video API.
 */
export const getStreamRecordingsAction = async () => {
  if (!streamApiKey || !streamSecretKey) {
    return { success: false, recordings: [], error: "Stream keys missing" };
  }
  const client = new StreamClient(streamApiKey, streamSecretKey);
  try {
    const callsRes = await client.video.queryCalls({
      filter_conditions: {},
      limit: 30,
      sort: [{ field: "created_at", direction: -1 }],
    });

    const allRecordings: any[] = [];
    if (callsRes.calls?.length) {
      for (const callObj of callsRes.calls) {
        const cType = callObj.call.type;
        const cId = callObj.call.id;
        try {
          const recsRes = await client.video.call(cType, cId).listRecordings();
          if (recsRes.recordings?.length) {
            for (const rec of recsRes.recordings) {
              allRecordings.push({
                ...rec,
                call_id: cId,
                call_type: cType,
                custom: callObj.call.custom,
              });
            }
          }
        } catch {
          // ignore calls with no recordings
        }
      }
    }

    return {
      success: true,
      recordings: allRecordings,
    };
  } catch (error) {
    console.error("[StreamServer] Fetch recordings error:", error);
    return { success: false, recordings: [], error: String(error) };
  }
};

/**
 * Delete a specific video recording from GetStream Cloud Storage.
 */
export const deleteStreamRecordingAction = async (
  callType: string,
  callId: string,
  sessionId: string,
  filename: string
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("User is not authenticated");

  if (!streamApiKey || !streamSecretKey) {
    return { success: false, error: "Stream API keys missing" };
  }

  const client = new StreamClient(streamApiKey, streamSecretKey, { timeout: 10000 });
  try {
    const call = client.video.call(callType || "default", callId);
    await call.deleteRecording({ session: sessionId, filename: filename });
    return { success: true };
  } catch (error: any) {
    console.error("[StreamServer] Delete recording error:", error);
    return { success: false, error: error?.message || String(error) };
  }
};

