"use client";

import { useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { PhoneOff, AlertTriangle, LogOut } from "lucide-react";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";

interface EndMeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLeaveOnly: () => Promise<void>;
  meetingDbId?: string | number;
}

export function EndMeetingDialog({
  isOpen,
  onOpenChange,
  onLeaveOnly,
  meetingDbId,
}: EndMeetingDialogProps) {
  const call = useCall();
  const router = useRouter();
  const { canEndCall, isHost } = useMeetingPermissions();
  const [isEndingAll, setIsEndingAll] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveOnlyClick = async () => {
    setIsLeaving(true);
    try {
      await onLeaveOnly();
    } finally {
      setIsLeaving(false);
      onOpenChange(false);
    }
  };

  const handleEndAllClick = async () => {
    if (!call) return;
    setIsEndingAll(true);
    try {
      // 1. End Stream call for everyone
      await call.endCall();

      // 2. Notify backend if database ID is known
      if (meetingDbId) {
        try {
          await fetch(`/api/teacher/live-session/${meetingDbId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" }),
          });
        } catch (dbErr) {
          console.warn("[EndMeetingDialog] Non-fatal DB update warning:", dbErr);
        }
      }

      toast.success("Meeting ended for all participants");
      onOpenChange(false);
      router.push("/");
    } catch (err: any) {
      console.error("[EndMeetingDialog] End call error:", err);
      toast.error(err?.message || "Failed to end meeting for everyone.");
    } finally {
      setIsEndingAll(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-white/15 text-white max-w-sm rounded-2xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
            <PhoneOff className="w-5 h-5 text-red-500" />
            {isHost ? "Leave or End Meeting?" : "Leave Meeting?"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs mt-2 leading-relaxed">
            {isHost && canEndCall
              ? "As the meeting host, you can leave the meeting while others remain, or end the meeting for all participants."
              : "Are you sure you want to leave this meeting?"}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col gap-2 mt-4">
          {/* Host option: End for everyone */}
          {isHost && canEndCall && (
            <Button
              size="sm"
              onClick={handleEndAllClick}
              disabled={isEndingAll || isLeaving}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              {isEndingAll ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>End Meeting for Everyone</span>
                </>
              )}
            </Button>
          )}

          {/* Leave only */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveOnlyClick}
            disabled={isEndingAll || isLeaving}
            className="w-full bg-white/10 hover:bg-white/20 border-white/15 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            {isLeaving ? (
              <Spinner size="sm" />
            ) : (
              <>
                <LogOut className="w-4 h-4 text-zinc-300" />
                <span>{isHost && canEndCall ? "Leave Meeting Only" : "Leave Meeting"}</span>
              </>
            )}
          </Button>

          {/* Cancel */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isEndingAll || isLeaving}
            className="w-full text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl text-xs"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
