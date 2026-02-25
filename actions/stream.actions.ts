"use server";

import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {StreamClient} from "@stream-io/node-sdk";

const streamApiKey = "cx85x7gj2dxr";
const streamSecretKey =
  "u35v7mqqwfcqdcr544w92kj39r6mm5cxxszqkmgdcmna23m7tn75candrdjw3k2h";

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
