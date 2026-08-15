"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useCall, useCallStateHooks, OwnCapability } from "@stream-io/video-react-sdk";

export interface MeetingPermissions {
  isHost: boolean;
  canMuteUsers: boolean;
  canKickUsers: boolean;
  canBlockUsers: boolean;
  canEndCall: boolean;
  canScreenShare: boolean;
  canRecord: boolean;
  canGrantAudio: boolean;
  canGrantVideo: boolean;
  canRevokeAudio: boolean;
  canRevokeVideo: boolean;
  ownCapabilities: string[];
}

/**
 * Determines meeting permissions from real Stream capabilities.
 * isHost is for UI layout only — moderation actions require actual Stream capabilities.
 */
export function useMeetingPermissions(): MeetingPermissions {
  const call = useCall();
  const { data: session } = useSession();
  const { useHasPermissions, useOwnCapabilities } = useCallStateHooks();

  const ownCapabilities = useOwnCapabilities() || [];

  const hasMutePermission = useHasPermissions(OwnCapability.MUTE_USERS);
  const hasKickPermission = useHasPermissions(OwnCapability.KICK_USER);
  const hasBlockPermission = useHasPermissions(OwnCapability.BLOCK_USERS);
  const hasEndCallPermission = useHasPermissions(OwnCapability.END_CALL);
  const hasScreenSharePermission = useHasPermissions(OwnCapability.SCREENSHARE);
  const hasStartRecordPermission = useHasPermissions(OwnCapability.START_RECORD_CALL);
  const hasUpdateCallPermission = useHasPermissions(OwnCapability.UPDATE_CALL);

  const userId = session?.user?.id ? String(session.user.id) : null;
  const userRole = session?.user?.role?.toLowerCase() || "";

  // isHost: for display/layout decisions only (e.g. show host panel header)
  // Does NOT grant Stream moderation capabilities by itself
  const isHost = useMemo(() => {
    if (!session?.user) return false;
    const createdById = call?.state?.createdBy?.id;
    if (createdById && userId && createdById === userId) return true;
    if (userRole.includes("teacher") || userRole.includes("instructor") || userRole === "tutor" || userRole.includes("admin")) {
      return true;
    }
    return false;
  }, [call?.state?.createdBy?.id, userId, userRole, session?.user]);

  const isBrowserScreenShareSupported = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      "mediaDevices" in navigator &&
      typeof navigator.mediaDevices?.getDisplayMedia === "function"
    );
  }, []);

  return {
    isHost,
    // Moderation: gated on real Stream capability only
    canMuteUsers: hasMutePermission,
    canKickUsers: hasKickPermission,
    canBlockUsers: hasBlockPermission,
    canEndCall: hasEndCallPermission,
    canScreenShare: isBrowserScreenShareSupported && hasScreenSharePermission,
    canRecord: hasStartRecordPermission,
    canGrantAudio: hasUpdateCallPermission || hasMutePermission,
    canGrantVideo: hasUpdateCallPermission || hasMutePermission,
    canRevokeAudio: hasMutePermission,
    canRevokeVideo: hasMutePermission,
    ownCapabilities,
  };
}
