"use client";

import {useSession} from "next-auth/react";
import {useStreamVideoClient} from "@stream-io/video-react-sdk";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {toast} from "sonner";

const PersonalMeetingInfo = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-start gap-2 xl:flex-row text-black">
      <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
        {title}:
      </h1>
      <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
        {description}
      </h1>
    </div>
  );
};

const MyRoomPage = () => {
  const router = useRouter();
  const {data: session} = useSession();
  const client = useStreamVideoClient();

  const user = session?.user;
  const meetingId = `personal-${user?.id}-${Date.now()}`; // Unique ID to avoid reusing ended calls

  const startRoom = async () => {
    if (!client || !user || !meetingId) {
      toast.error("Cannot start meeting: Missing client, user, or meeting ID", {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[MyRoomPage] Missing data:", {client, user, meetingId});
      return;
    }

    try {
      const personalCall = client.call("default", meetingId);
      console.log("[MyRoomPage] Creating call with ID:", meetingId);
      await personalCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            title: `${
              user.name || user.email?.split("@")[0] || "User"
            }'s Meeting`,
            description: `${
              user.name || user.email?.split("@")[0] || "User"
            }'s Personal Meeting Room`,
          },
        },
      });
      console.log("[MyRoomPage] Call created, checking state...");
      const callData = await personalCall.get();
      console.log("[MyRoomPage] Call state:", {
        createdAt: callData.call.created_at,
        endedAt: callData.call.ended_at,
      });

      if (callData.call.ended_at) {
        toast.error("Meeting already ended, creating a new one", {
          duration: 4000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
        // Recreate the call with a new ID
        const newMeetingId = `personal-${user.id}-${Date.now()}`;
        const newCall = client.call("default", newMeetingId);
        await newCall.getOrCreate({
          data: {
            starts_at: new Date().toISOString(),
            custom: {
              title: `${
                user.name || user.email?.split("@")[0] || "User"
              }'s Meeting`,
              description: `${
                user.name || user.email?.split("@")[0] || "User"
              }'s Personal Meeting Room`,
            },
          },
        });
        await newCall.join({create: false});
        console.log(
          "[MyRoomPage] New call created, navigating to:",
          `/main/meeting/${newMeetingId}`
        );
        router.push(`/main/meeting/${newMeetingId}`);
        return;
      }

      await personalCall.join({create: false});
      console.log(
        "[MyRoomPage] Joined call, navigating to:",
        `/main/meeting/${meetingId}`
      );
      router.push(`/main/meeting/${meetingId}`);
    } catch (err: any) {
      toast.error(`Failed to start meeting: ${err.message}`, {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[MyRoomPage] Error starting meeting:", err);
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("Session")
      ) {
        router.push("/login");
      }
    }
  };

  const meetingLink = `https://texagon.epichouse.online/main/meeting/${
    meetingId || "unknown"
  }`;

  return (
    <section className="flex size-full flex-col gap-10 text-white animate-fade-in">
      <h1 className="text-xl font-bold lg:text-3xl">Personal Meeting Room</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <PersonalMeetingInfo
          title="Topic"
          description={`${
            user?.name || user?.email?.split("@")[0] || "No Name Found"
          }'s Meeting Room`}
        />
        <PersonalMeetingInfo
          title="Meeting ID"
          description={meetingId || "Not available"}
        />
        <PersonalMeetingInfo title="Invite Link" description={meetingLink} />
      </div>
      <div className="flex gap-5">
        <Button
          className="rounded bg-blue-700 p-4 hover:bg-blue-400 px-6"
          onClick={startRoom}
          disabled={!meetingId}>
          Start Meeting
        </Button>
        <Button
          className="bg-gray-700"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast("Link Copied", {
              duration: 3000,
              className:
                "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
            });
          }}>
          <Image src="/copy.svg" alt="copy" width={20} height={20} />
          Copy Invitation
        </Button>
      </div>
    </section>
  );
};

export default MyRoomPage;
