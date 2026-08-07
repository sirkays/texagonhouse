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
  ownCapabilities: string[];
}

/**
 * Custom hook to centrally determine meeting permissions & capabilities.
 * Combines Stream reactive capability API, NextAuth session, and call creator identity.
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

  const userId = session?.user?.id ? String(session.user.id) : null;
  const userRole = session?.user?.role?.toLowerCase() || "";

  // Host determination:
  // 1. User is explicit call creator (call.state.createdBy.id === userId)
  // 2. User is teacher/admin role in Techxagon
  const isHost = useMemo(() => {
    if (!session?.user) return false;
    const createdById = call?.state?.createdBy?.id;
    if (createdById && userId && createdById === userId) return true;
    if (userRole.includes("teacher") || userRole.includes("instructor") || userRole === "tutor" || userRole.includes("admin")) {
      return true;
    }
    return false;
  }, [call?.state?.createdBy?.id, userId, userRole, session?.user]);

  // Screen share browser feature detection
  const isBrowserScreenShareSupported = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      "mediaDevices" in navigator &&
      typeof navigator.mediaDevices?.getDisplayMedia === "function"
    );
  }, []);

  const canMuteUsers = isHost || hasMutePermission;
  const canKickUsers = isHost || hasKickPermission;
  const canBlockUsers = isHost || hasBlockPermission;
  const canEndCall = isHost || hasEndCallPermission;
  const canScreenShare = isBrowserScreenShareSupported && (isHost || hasScreenSharePermission);
  const canRecord = isHost;

  return {
    isHost,
    canMuteUsers,
    canKickUsers,
    canBlockUsers,
    canEndCall,
    canScreenShare,
    canRecord,
    ownCapabilities,
  };
}
