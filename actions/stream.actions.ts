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
        settings_override: { backstage: { enabled: false } },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[StreamServer] Call creation error:", error);
    return { success: false, error: String(error) };
  }
};

