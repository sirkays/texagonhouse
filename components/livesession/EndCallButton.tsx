"use client";

import {useCall, useCallStateHooks} from "@stream-io/video-react-sdk";
import {useRouter} from "next/navigation";
import {Button} from "../ui/button";
import {cn} from "@/lib/utils";

export type EndCallButtonProps = {
  className?: string;
};

const EndCallButton = ({className}: EndCallButtonProps) => {
  const router = useRouter();
  const call = useCall();

  if (!call) {
    throw new Error(
      "EndCallButton must be used inside a StreamCall component."
    );
  }

  const {useLocalParticipant} = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant?.userId &&
    call.state.createdBy?.id === localParticipant.userId;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    router.push("/");
  };

  return (
    <Button
      onClick={endCall}
      variant="destructive"
      className={cn("bg-red-600 hover:bg-red-700 text-white", className)}>
      End call for everyone
    </Button>
  );
};

export default EndCallButton;
