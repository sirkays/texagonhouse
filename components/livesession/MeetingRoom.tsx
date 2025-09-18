"use client";

import {useSession} from "next-auth/react";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import {useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {Button} from "../ui/button";
import {toast} from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {LayoutList, Users} from "lucide-react";
import {Spinner} from "../ui/spinner";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false); // Sidebar off by default
  const router = useRouter();
  const pathname = usePathname();
  const {data: session, status} = useSession();
  const {useCallCallingState} = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-black" />
      </div>
    );
  }

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
        className="ml-5 font-semibold bg-gray-900 hover:scale-105 rounded-3xl px-5 py-3 transition-all duration-200"
        onClick={() => {
          const meetingLink = `https://texagon.epichouse.online${pathname}`;
          navigator.clipboard.writeText(meetingLink);
          toast("Meeting Link Copied", {
            duration: 3000,
            className:
              "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center !text-base",
          });
        }}>
        Invite People
      </Button>

      {/* Main Call Area */}
      <div className="flex w-full h-[calc(100vh-120px)] items-center justify-center px-4">
        {/* Call Layout */}
        <div className="flex-1 max-w-[1000px] items-center justify-center animate-fade-in">
          <CallLayout />
        </div>

        {/* Participants Sidebar */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-10 ${
            showParticipants ? "translate-x-0" : "translate-x-full"
          }`}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Call Controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 bg-[#0f172a]/90 py-3 px-2 transition-all duration-200">
        <CallControls onLeave={() => router.push("/")} />

        {/* Layout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] transition-colors">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-black bg-black text-white text-base">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  className="py-2"
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

        {/* Toggle Participants */}
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] transition-colors">
            <Users size={20} className="text-white" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default MeetingRoom;
