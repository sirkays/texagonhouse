"use client";

import {useSession} from "next-auth/react";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {useState} from "react";
import Loading from "./Loading";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "../ui/button";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {LayoutList, Users} from "lucide-react";
import EndCallButton from "./EndCallButton";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const {data: session, status} = useSession();

  if (status !== "authenticated" || !session?.user) return <Loading />;

  const {useCallCallingState} = useCallStateHooks();
  const callingState = useCallCallingState();
  if (callingState !== CallingState.JOINED) return <Loading />;

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-4 text-white">
      {/* Invite Button */}
      <Button
        className="ml-2 xs:ml-3 sm:ml-5 font-semibold bg-gray-900 hover:scale-105 rounded-3xl px-2 py-1 xs:px-3 xs:py-2 sm:px-5 sm:py-3 text-xs xs:text-sm sm:text-base transition-all duration-200"
        onClick={() => {
          const meetingLink = `https://texagon.epichouse.online${pathname}`;
          navigator.clipboard.writeText(meetingLink);
          toast("Meeting Link Copied", {
            duration: 3000,
            className:
              "!bg-gray-300 !rounded-3xl !py-4 xs:!py-5 sm:!py-8 !px-3 xs:!px-4 sm:!px-5 !justify-center !text-xs xs:!text-sm sm:!text-base",
          });
        }}>
        Invite People
      </Button>

      {/* Main Call Area */}
      <div className="relative flex flex-col lg:flex-row w-full h-[calc(100vh-120px)] items-center justify-center px-1 xs:px-2 sm:px-4">
        {/* Call Layout */}
        <div className="flex flex-1 w-full max-w-full lg:max-w-[1000px] items-center justify-center animate-fade-in">
          <CallLayout />
        </div>

        {/* Participants Sidebar (toggleable on mobile) */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-64 xs:w-72 bg-[#111827] lg:static lg:h-[calc(100vh-100px)] lg:w-72 lg:ml-2 transition-transform duration-300 ease-in-out z-10",
            showParticipants
              ? "translate-x-0 block"
              : "translate-x-full lg:block"
          )}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Call Controls */}
      <div className="fixed bottom-0 flex w-full flex-wrap xs:flex-wrap sm:flex-nowrap items-center justify-center gap-2 xs:gap-3 sm:gap-5 bg-[#0f172a]/90 py-2 xs:py-2.5 sm:py-3 px-1 xs:px-2 transition-all duration-200">
        <CallControls onLeave={() => router.push(`/`)} />

        {/* Layout Dropdown */}
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2 hover:bg-[#4c535b] transition-colors">
              <LayoutList
                size={16}
                className="xs:size-18 sm:size-20 text-white"
              />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-black bg-black text-white text-xs xs:text-sm sm:text-base">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  className="py-1 xs:py-1.5 sm:py-2"
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }>
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-black" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        {/* Toggle Participants */}
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2 hover:bg-[#4c535b] transition-colors">
            <Users size={16} className="xs:size-18 sm:size-20 text-white" />
          </div>
        </button>

        <EndCallButton />
      </div>
    </section>
  );
};

export default MeetingRoom;
