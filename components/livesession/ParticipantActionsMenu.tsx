"use client";

import { useState } from "react";
import { type StreamVideoParticipant, useCall } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { MoreVertical, MicOff, UserX, ShieldAlert, Unlock, VideoOff, Video, Mic, Pin, PinOff, MonitorOff } from "lucide-react";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";

interface ParticipantActionsMenuProps {
  participant: StreamVideoParticipant;
}

export function ParticipantActionsMenu({ participant }: ParticipantActionsMenuProps) {
  const call = useCall();
  const { canMuteUsers, canKickUsers, canBlockUsers, canGrantAudio, canGrantVideo, canRevokeAudio, canRevokeVideo } = useMeetingPermissions();

  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!call || participant.isLocalParticipant) {
    return null; // Do not show moderation actions on self or when call is unavailable
  }

  const hasAnyModerationPermission = canMuteUsers || canKickUsers || canBlockUsers;
  if (!hasAnyModerationPermission) {
    return null;
  }

  const participantName = participant.name || participant.userId || "Participant";
  const hasAudio = !!participant.audioStream;
  const hasVideo = !!participant.videoStream;

  const isSharingScreen = !!participant.screenShareStream;
  const isPinned = !!participant.isPinned;

  // Toggle mic: disable if on, enable if off
  const handleToggleMic = async () => {
    if (!call) return;
    setIsLoading(true);
    try {
      if (hasAudio) {
        // Disable: mute + revoke permission
        await call.muteUser(participant.userId, "audio");
        await (call as any).updateUserPermissions({
          user_id: participant.userId,
          revoke_permissions: ["send-audio"],
        });
        toast.success(`Disabled mic for ${participantName}`);
      } else {
        // Enable: grant permission back
        await (call as any).updateUserPermissions({
          user_id: participant.userId,
          grant_permissions: ["send-audio"],
        });
        toast.success(`Enabled mic for ${participantName}`);
      }
    } catch (err: any) {
      console.error("[Moderation] Mic toggle error:", err);
      toast.error(err?.message || "Unable to toggle mic.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle camera: disable if on, enable if off
  const handleToggleCamera = async () => {
    if (!call) return;
    setIsLoading(true);
    try {
      if (hasVideo) {
        // Disable: mute + revoke permission
        await call.muteUser(participant.userId, "video");
        await (call as any).updateUserPermissions({
          user_id: participant.userId,
          revoke_permissions: ["send-video"],
        });
        toast.success(`Disabled camera for ${participantName}`);
      } else {
        // Enable: grant permission back
        await (call as any).updateUserPermissions({
          user_id: participant.userId,
          grant_permissions: ["send-video"],
        });
        toast.success(`Enabled camera for ${participantName}`);
      }
    } catch (err: any) {
      console.error("[Moderation] Camera toggle error:", err);
      toast.error(err?.message || "Unable to toggle camera.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stop screen share for participant
  const handleStopScreenShare = async () => {
    if (!call) return;
    setIsLoading(true);
    try {
      await call.muteUser(participant.userId, "screenshare");
      await (call as any).updateUserPermissions({
        user_id: participant.userId,
        revoke_permissions: ["send-screenshare"],
      });
      toast.success(`Stopped screen sharing for ${participantName}`);
    } catch (err: any) {
      console.error("[Moderation] Stop screen share error:", err);
      toast.error(err?.message || "Unable to stop screen share.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Pin
  const handleTogglePin = async () => {
    if (!call) return;
    setIsLoading(true);
    try {
      if (isPinned) {
        await call.unpin(participant.sessionId);
        toast.info(`Unpinned ${participantName}`);
      } else {
        await call.pin(participant.sessionId);
        toast.info(`Pinned ${participantName}`);
      }
    } catch (err: any) {
      console.error("[Moderation] Pin toggle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Kick participant
  const handleKickConfirm = async () => {
    if (!call) return;
    setIsLoading(true);
    try {
      await call.kickUser({ user_id: participant.userId });
      toast.success(`Removed ${participantName} from meeting`);
      setIsKickDialogOpen(false);
    } catch (err: any) {
      console.error("[Moderation] Kick error:", err);
      toast.error(err?.message || "Unable to remove participant.");
    } finally {
      setIsLoading(false);
    }
  };

  // Block participant
  const handleBlockConfirm = async () => {
    if (!call) return;
    setIsLoading(true);
    try {
      await call.blockUser(participant.userId);
      toast.success(`Blocked ${participantName}`);
      setIsBlockDialogOpen(false);
    } catch (err: any) {
      console.error("[Moderation] Block error:", err);
      toast.error(err?.message || "Unable to block participant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isLoading}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
          title={`Moderation options for ${participantName}`}
        >
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border border-white/15 bg-zinc-900/98 backdrop-blur-xl text-white rounded-xl p-1.5 shadow-2xl min-w-[170px] z-50">
          {/* Pin / Unpin */}
          <DropdownMenuItem
            onClick={handleTogglePin}
            disabled={isLoading}
            className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-white/10 cursor-pointer text-zinc-200"
          >
            {isPinned ? <PinOff className="w-3.5 h-3.5 text-zinc-400" /> : <Pin className="w-3.5 h-3.5 text-sky-400" />}
            <span>{isPinned ? "Unpin Tile" : "Pin Tile"}</span>
          </DropdownMenuItem>

          {/* Toggle Mic */}
          {canMuteUsers && (
            <DropdownMenuItem
              onClick={handleToggleMic}
              disabled={isLoading}
              className={`flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-white/10 cursor-pointer ${
                hasAudio ? "text-amber-400" : "text-emerald-300"
              }`}
            >
              {hasAudio ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{hasAudio ? "Disable Mic" : "Enable Mic"}</span>
            </DropdownMenuItem>
          )}

          {/* Toggle Camera */}
          {canMuteUsers && (
            <DropdownMenuItem
              onClick={handleToggleCamera}
              disabled={isLoading}
              className={`flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-white/10 cursor-pointer ${
                hasVideo ? "text-amber-400" : "text-emerald-300"
              }`}
            >
              {hasVideo ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              <span>{hasVideo ? "Disable Camera" : "Enable Camera"}</span>
            </DropdownMenuItem>
          )}

          {/* Stop Screen Share */}
          {isSharingScreen && canMuteUsers && (
            <DropdownMenuItem
              onClick={handleStopScreenShare}
              disabled={isLoading}
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-white/10 cursor-pointer text-amber-400"
            >
              <MonitorOff className="w-3.5 h-3.5" />
              <span>Stop Screen Share</span>
            </DropdownMenuItem>
          )}

          {/* Kick */}
          {canKickUsers && (
            <DropdownMenuItem
              onClick={() => setIsKickDialogOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-white/10 cursor-pointer text-rose-400"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Kick Participant</span>
            </DropdownMenuItem>
          )}

          {/* Block */}
          {canBlockUsers && (
            <DropdownMenuItem
              onClick={() => setIsBlockDialogOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-red-500/20 cursor-pointer text-red-400"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Block Participant</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Kick Confirmation Dialog */}
      <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-white/15 text-white max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <UserX className="w-5 h-5" />
              Kick {participantName}?
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-2">
              This will remove {participantName} from the current meeting. They can rejoin if the meeting remains open.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsKickDialogOpen(false)}
              disabled={isLoading}
              className="bg-white/5 border-white/15 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleKickConfirm}
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
            >
              {isLoading ? <Spinner size="sm" /> : "Kick Participant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-white/15 text-white max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-red-500">
              <ShieldAlert className="w-5 h-5" />
              Block {participantName}?
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-2">
              This will remove {participantName} from the meeting and prevent them from rejoining this call. You can unblock them later from the Participants list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBlockDialogOpen(false)}
              disabled={isLoading}
              className="bg-white/5 border-white/15 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleBlockConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
            >
              {isLoading ? <Spinner size="sm" /> : "Block Participant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Unblock Recovery component for hosts to view & unblock blocked participants.
 */
export function BlockedParticipantsSection() {
  const call = useCall();
  const { canBlockUsers } = useMeetingPermissions();
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  if (!canBlockUsers || !call) return null;

  const handleUnblock = async (userId: string) => {
    setUnblockingId(userId);
    try {
      await call.unblockUser(userId);
      toast.success(`Unblocked user ${userId}`);
      setBlockedUserIds((prev) => prev.filter((id) => id !== userId));
    } catch (err: any) {
      console.error("[Moderation] Unblock error:", err);
      toast.error(err?.message || "Unable to unblock user.");
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/10 px-2">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-between w-full py-1.5 transition"
      >
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          Blocked Users ({blockedUserIds.length})
        </span>
        <span className="text-[10px] text-zinc-500">{isOpen ? "Hide" : "Show"}</span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1.5">
          {blockedUserIds.length === 0 ? (
            <p className="text-[11px] text-zinc-500 italic px-2 py-1">No blocked participants</p>
          ) : (
            blockedUserIds.map((userId) => (
              <div
                key={userId}
                className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg text-xs"
              >
                <span className="text-zinc-300 font-mono truncate max-w-[140px]">{userId}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnblock(userId)}
                  disabled={unblockingId === userId}
                  className="h-6 px-2 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30 text-emerald-300 rounded-md"
                >
                  {unblockingId === userId ? <Spinner size="sm" /> : <Unlock className="w-3 h-3 mr-1" />}
                  Unblock
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
