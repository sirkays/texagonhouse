// "use client";

// import { useSession } from "next-auth/react";
// import {
//   CallControls,
//   CallingState,
//   CallParticipantsList,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
//   useCall,
// } from "@stream-io/video-react-sdk";
// import { useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { Button } from "../ui/button";
// import { toast } from "sonner";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { LayoutList, Users } from "lucide-react";
// import { Spinner } from "../ui/spinner";

// type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

// const MeetingRoom = () => {
//   const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
//   const [showParticipants, setShowParticipants] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();
//   const { data: session, status } = useSession();
//   const { useCallCallingState } = useCallStateHooks();
//   const call = useCall();
//   const callingState = useCallCallingState();

//   if (status !== "authenticated" || !session?.user) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50">
//         <Spinner size="lg" className="text-indigo-500" />
//       </div>
//     );
//   }

//   if (callingState !== CallingState.JOINED) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-background">
//         <Spinner size="md" className="text-black" />
//       </div>
//     );
//   }

//   const CallLayout = () => {
//     switch (layout) {
//       case "grid":
//         return <PaginatedGridLayout />;
//       case "speaker-right":
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white">
//       {/* Invite People Button as Floating Action Button */}
//       <Button
//         className="fixed top-4 right-4 z-10 font-semibold bg-gray-800 hover:bg-gray-700 rounded-full px-4 py-2 shadow-lg transition-all duration-200"
//         onClick={() => {
//           const meetingLink = `https://texagon.epichouse.online${pathname}`;
//           navigator.clipboard.writeText(meetingLink);
//           toast("Meeting Link Copied", {
//             duration: 3000,
//             className:
//               "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center !text-base",
//           });
//         }}
//       >
//         Invite People
//       </Button>

//       {/* Main Call Area */}
//       <div className="flex flex-col w-full h-[calc(100vh-60px)] items-center justify-start px-2 py-2">
//         <div className="flex-1 w-full p-1 sm:p-2">
//           <CallLayout />
//         </div>
//       </div>

//       {/* Participants Sidebar */}
//       <div
//         className={`fixed top-0 right-0 h-full w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
//           showParticipants ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <CallParticipantsList onClose={() => setShowParticipants(false)} />
//       </div>

//       {/* Bottom Controls */}
//       <div className="fixed bottom-0 flex w-full items-center justify-center gap-3 bg-[#0f172a]/90 py-2 px-2 sm:px-4 transition-all duration-200">
//         <CallControls onLeave={() => router.push("/")} />
//         <DropdownMenu>
//           <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-3 py-2 hover:bg-[#4c535b] transition-colors">
//             <LayoutList size={20} className="text-white" />
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="border-black bg-black text-white text-base">
//             {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   className="py-2"
//                   onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
//                 >
//                   {item}
//                   </DropdownMenuItem>
//                 </div>
//             ))}
//             </DropdownMenuContent>
//         </DropdownMenu>
//         <button
//           onClick={() => setShowParticipants((prev) => !prev)}
//           className="cursor-pointer rounded-2xl bg-[#19232d] px-3 py-2 hover:bg-[#4c535b] transition-colors"
//         >
//           <Users size={20} className="text-white" />
//         </button>
//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;

// "use client";

// import {useSession} from "next-auth/react";
// import {
//   CallControls,
//   CallingState,
//   CallParticipantsList,
//   PaginatedGridLayout,
//   useCallStateHooks,
//   useCall,
// } from "@stream-io/video-react-sdk";
// import {useState} from "react";
// import {useRouter, usePathname} from "next/navigation";
// import {Button} from "../ui/button";
// import {toast} from "sonner";
// import {Users} from "lucide-react";
// import {Spinner} from "../ui/spinner";

// const MeetingRoom = () => {
//   const [showParticipants, setShowParticipants] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();
//   const {data: session, status} = useSession();
//   const {useCallCallingState} = useCallStateHooks();
//   const call = useCall();
//   const callingState = useCallCallingState();

//   if (status !== "authenticated" || !session?.user) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50">
//         <Spinner size="lg" className="text-indigo-500" />
//       </div>
//     );
//   }

//   if (callingState !== CallingState.JOINED) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-background">
//         <Spinner size="md" className="text-black" />
//       </div>
//     );
//   }

//   const CallLayout = () => {
//     // Grid-only: Always render PaginatedGridLayout
//     return <PaginatedGridLayout />;
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden bg-gray-900 text-white">
//       {/* Invite People Button as Floating Action Button */}
//       <Button
//         className="fixed top-4 right-4 z-10 font-semibold bg-gray-800 hover:bg-gray-700 rounded-full px-4 py-2 shadow-lg transition-all duration-200"
//         onClick={() => {
//           const meetingLink = `https://texagon.epichouse.online${pathname}`;
//           navigator.clipboard.writeText(meetingLink);
//           toast("Meeting Link Copied", {
//             duration: 3000,
//             className:
//               "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center !text-base",
//           });
//         }}>
//         Invite People
//       </Button>

//       {/* Main Call Area - Full Screen for Grid */}
//       <div className="flex flex-col w-full h-full items-center justify-start p-1 sm:p-2">
//         <div className="flex-1 w-full max-w-[1200px] mx-auto">
//           <CallLayout />
//         </div>
//       </div>

//       {/* Participants Sidebar */}
//       <div
//         className={`fixed top-0 right-0 h-full w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
//           showParticipants ? "translate-x-0" : "translate-x-full"
//         }`}>
//         <CallParticipantsList onClose={() => setShowParticipants(false)} />
//       </div>

//       {/* Bottom Controls */}
//       <div className="fixed bottom-0 flex w-full items-center justify-center gap-4 bg-[#0f172a]/90 py-3 px-2 sm:px-4 transition-all duration-200">
//         <CallControls onLeave={() => router.push("/")} />
//         {/* Removed Layout Dropdown - Grid Only */}
//         <button
//           onClick={() => setShowParticipants((prev) => !prev)}
//           className="cursor-pointer rounded-2xl bg-[#19232d] px-3 py-2 hover:bg-[#4c535b] transition-colors">
//           <Users size={20} className="text-white" />
//         </button>
//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;

"use client";

import {useSession} from "next-auth/react";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import {useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {Button} from "../ui/button";
import {toast} from "sonner";
import {Users} from "lucide-react";
import {Spinner} from "../ui/spinner";

const MeetingRoom = () => {
  const [showParticipants, setShowParticipants] = useState(false);
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
    // Always use PaginatedGridLayout for grid-only view
    return <PaginatedGridLayout />;
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white">
      {/* Invite People Button as Floating Action Button */}
      <Button
        className="fixed top-4 right-4 z-10 font-semibold bg-gray-800 hover:bg-gray-700 rounded-full px-4 py-2 shadow-lg transition-all duration-200"
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
      <div className="flex flex-col w-full h-[calc(100vh-60px)] items-center justify-start px-2 py-2">
        <div className="flex-1 w-full p-1 sm:p-2">
          <CallLayout />
        </div>
      </div>

      {/* Participants Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
          showParticipants ? "translate-x-0" : "translate-x-full"
        }`}>
        <CallParticipantsList onClose={() => setShowParticipants(false)} />
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 flex flex-wrap w-full items-center justify-center gap-3 bg-[#0f172a]/90 py-2 px-2 sm:px-4 transition-all duration-200">
        <CallControls className="px-4" onLeave={() => router.push("/")} />
        {/* Removed layout dropdown since grid-only */}
        <button
          onClick={() => setShowParticipants((prev) => !prev)}
          className="cursor-pointer rounded-2xl bg-[#19232d] px-3 py-2 hover:bg-[#4c535b] transition-colors">
          <Users size={20} className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default MeetingRoom;
