// // "use client";

// // import {useSession} from "next-auth/react";
// // import {
// //   CallControls,
// //   CallingState,
// //   CallParticipantsList,
// //   PaginatedGridLayout,
// //   SpeakerLayout,
// //   useCallStateHooks,
// //   useCall,
// // } from "@stream-io/video-react-sdk";
// // import {useState} from "react";
// // import {useRouter, usePathname} from "next/navigation";
// // import {Button} from "../ui/button";
// // import {toast} from "sonner";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "../ui/dropdown-menu";
// // import {LayoutList, Users} from "lucide-react";
// // import {Spinner} from "../ui/spinner";

// // type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

// // const MeetingRoom = () => {
// //   const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
// //   const [showParticipants, setShowParticipants] = useState(false);
// //   const router = useRouter();
// //   const pathname = usePathname();
// //   const {data: session, status} = useSession();
// //   const {useCallCallingState} = useCallStateHooks();
// //   const call = useCall();
// //   const callingState = useCallCallingState();

// //   if (status !== "authenticated" || !session?.user) {
// //     return (
// //       <div className="flex min-h-screen items-center justify-center bg-gray-50">
// //         <Spinner size="lg" className="text-indigo-500" />
// //       </div>
// //     );
// //   }

// //   if (callingState !== CallingState.JOINED) {
// //     return (
// //       <div className="flex min-h-screen items-center justify-center bg-background">
// //         <Spinner size="md" className="text-black" />
// //       </div>
// //     );
// //   }

// //   const CallLayout = () => {
// //     switch (layout) {
// //       case "grid":
// //         return (
// //           <div className="w-full h-full">
// //             <PaginatedGridLayout
// //               groupSize={4}
// //               className="custom-paginated-grid w-full h-full"
// //             />
// //           </div>
// //         );
// //       case "speaker-right":
// //         return (
// //           <SpeakerLayout
// //             participantsBarPosition="left"
// //             className="w-full h-full flex flex-col lg:flex-row"
// //           />
// //         );
// //       default:
// //         return (
// //           <SpeakerLayout
// //             participantsBarPosition="right"
// //             className="w-full h-full flex flex-col lg:flex-row"
// //           />
// //         );
// //     }
// //   };

// //   return (
// //     <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white flex flex-col">
// //       {/* Invite People Button */}
// //       <Button
// //         className="fixed top-4 right-4 z-30 font-semibold bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg transition-all duration-200 text-sm sm:text-base"
// //         onClick={() => {
// //           const meetingLink = `https://texagon.epichouse.online${pathname}`;
// //           navigator.clipboard.writeText(meetingLink);
// //           toast("Meeting Link Copied", {
// //             duration: 3000,
// //             className:
// //               "!bg-gray-300 !rounded-3xl !py-4 !px-4 !justify-center !text-sm sm:!text-base",
// //           });
// //         }}>
// //         Invite People
// //       </Button>

// //       {/* Main Call Area */}
// //       <div className="flex-1 w-full flex items-center justify-center px-2 sm:px-4 py-4 mb-10">
// //         <div className="w-full max-w-[1400px] h-full">
// //           <CallLayout />
// //         </div>
// //       </div>

// //       {/* Participants Sidebar */}
// //       <div
// //         className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
// //           showParticipants ? "translate-x-0" : "translate-x-full"
// //         }`}>
// //         <CallParticipantsList onClose={() => setShowParticipants(false)} />
// //       </div>

// //       {/* Bottom Controls */}
// //       <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0f172a]/90 py-3 px-2 sm:px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
// //         <CallControls
// //           className="flex flex-wrap justify-center gap-2 sm:gap-3"
// //           onLeave={() => router.push("/")}
// //         />
// //         <DropdownMenu>
// //           <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
// //             <LayoutList size={18} className="text-white sm:w-5 sm:h-5" />
// //           </DropdownMenuTrigger>
// //           <DropdownMenuContent className="border-black bg-black text-white text-sm sm:text-base">
// //             {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
// //               <div key={index}>
// //                 <DropdownMenuItem
// //                   className="py-1.5 sm:py-2 px-2"
// //                   onClick={() =>
// //                     setLayout(item.toLowerCase() as CallLayoutType)
// //                   }>
// //                   {item}
// //                 </DropdownMenuItem>
// //                 <DropdownMenuSeparator className="border-dark-1" />
// //               </div>
// //             ))}
// //           </DropdownMenuContent>
// //         </DropdownMenu>
// //         <button
// //           onClick={() => setShowParticipants((prev) => !prev)}
// //           className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
// //           <Users size={18} className="text-white sm:w-5 sm:h-5" />
// //         </button>
// //       </div>
// //     </section>
// //   );
// // };

// // export default MeetingRoom;

// "use client";

// import {useSession} from "next-auth/react";
// import {
//   CallControls,
//   CallingState,
//   CallParticipantsList,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
//   useCall,
// } from "@stream-io/video-react-sdk";
// import {useState, useEffect, useCallback} from "react";
// import {useRouter, usePathname} from "next/navigation";
// import {Button} from "../ui/button";
// import {toast} from "sonner";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import {LayoutList, Users} from "lucide-react";
// import {Spinner} from "../ui/spinner";

// type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

// const MeetingRoom = () => {
//   const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [groupSize, setGroupSize] = useState(4); // Dynamic group size for grid
//   const router = useRouter();
//   const pathname = usePathname();
//   const {data: session, status} = useSession();
//   const {useCallCallingState, useParticipantCount} = useCallStateHooks();
//   const call = useCall();
//   const callingState = useCallCallingState();
//   const participantCount = useParticipantCount?.() || 0;

//   // Adjust group size based on participant count and screen size
//   useEffect(() => {
//     const updateGroupSize = () => {
//       const width = window.innerWidth;
//       if (participantCount > 100) {
//         setGroupSize(width < 640 ? 6 : width < 1024 ? 8 : 12); // Larger groups for more participants
//       } else if (participantCount > 50) {
//         setGroupSize(width < 640 ? 4 : width < 1024 ? 6 : 8);
//       } else {
//         setGroupSize(width < 640 ? 3 : width < 1024 ? 4 : 6);
//       }
//     };

//     updateGroupSize();
//     window.addEventListener("resize", updateGroupSize);
//     return () => window.removeEventListener("resize", updateGroupSize);
//   }, [participantCount]);

//   // Memoized CallLayout to prevent unnecessary re-renders
//   const CallLayout = useCallback(() => {
//     switch (layout) {
//       case "grid":
//         return (
//           <div className="w-full h-full overflow-hidden">
//             <PaginatedGridLayout
//               groupSize={groupSize}
//               className="custom-paginated-grid w-full h-full"
//               excludeLocalParticipant={participantCount > 50} // Optimize for large calls
//               pageSize={groupSize * 2} // Dynamic page size
//             />
//           </div>
//         );
//       case "speaker-right":
//         return (
//           <SpeakerLayout
//             participantsBarPosition="left"
//             className="w-full h-full flex flex-col lg:flex-row"
//           />
//         );
//       default:
//         return (
//           <SpeakerLayout
//             participantsBarPosition="right"
//             className="w-full h-full flex flex-col lg:flex-row"
//           />
//         );
//     }
//   }, [layout, groupSize, participantCount]);

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

//   return (
//     <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white flex flex-col">
//       {/* Invite People Button */}
//       <Button
//         className="fixed top-4 right-4 z-30 font-semibold bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg transition-all duration-200 text-sm sm:text-base"
//         onClick={() => {
//           const meetingLink = `https://texagon.epichouse.online${pathname}`;
//           navigator.clipboard.writeText(meetingLink);
//           toast("Meeting Link Copied", {
//             duration: 3000,
//             className:
//               "!bg-gray-300 !rounded-3xl !py-4 !px-4 !justify-center !text-sm sm:!text-base",
//           });
//         }}>
//         Invite People
//       </Button>

//       {/* Main Call Area */}
//       <div className="flex-1 w-full flex items-center justify-center px-2 sm:px-4 py-4 mb-10">
//         <div className="w-full max-w-[1400px] h-full">
//           <CallLayout />
//         </div>
//       </div>

//       {/* Participants Sidebar */}
//       <div
//         className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
//           showParticipants ? "translate-x-0" : "translate-x-full"
//         }`}>
//         <CallParticipantsList onClose={() => setShowParticipants(false)} />
//       </div>

//       {/* Bottom Controls */}
//       <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0f172a]/90 py-3 px-2 sm:px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
//         <CallControls
//           className="flex flex-wrap justify-center gap-2 sm:gap-3"
//           onLeave={() => router.push("/")}
//         />
//         <DropdownMenu>
//           <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
//             <LayoutList size={18} className="text-white sm:w-5 sm:h-5" />
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="border-black bg-black text-white text-sm sm:text-base">
//             {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   className="py-1.5 sm:py-2 px-2"
//                   onClick={() =>
//                     setLayout(item.toLowerCase() as CallLayoutType)
//                   }>
//                   {item}
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator className="border-dark-1" />
//               </div>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//         <button
//           onClick={() => setShowParticipants((prev) => !prev)}
//           className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
//           <Users size={18} className="text-white sm:w-5 sm:h-5" />
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
//   SpeakerLayout,
//   useCallStateHooks,
//   useCall,
// } from "@stream-io/video-react-sdk";
// import {useState, useEffect, useCallback} from "react";
// import {useRouter, usePathname} from "next/navigation";
// import {Button} from "../ui/button";
// import {toast} from "sonner";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import {LayoutList, Users} from "lucide-react";
// import {Spinner} from "../ui/spinner";

// type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

// const MeetingRoom = () => {
//   const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [groupSize, setGroupSize] = useState(4);
//   const router = useRouter();
//   const pathname = usePathname();
//   const {data: session, status} = useSession();
//   const {useCallCallingState, useParticipantCount} = useCallStateHooks();
//   const call = useCall();
//   const callingState = useCallCallingState();
//   const participantCount = useParticipantCount?.() || 0;

//   // Set layout to grid on mobile and adjust group size
//   useEffect(() => {
//     const updateLayoutAndGroupSize = () => {
//       const width = window.innerWidth;
//       if (width < 640) {
//         setLayout("grid"); // Force grid layout on mobile
//         setGroupSize(participantCount > 50 ? 4 : 3); // Smaller group size for mobile
//       } else {
//         // Restore default or user-selected layout on larger screens
//         setLayout((prev) => (prev === "grid" ? "speaker-left" : prev));
//         setGroupSize(
//           participantCount > 100
//             ? width < 1024
//               ? 8
//               : 12
//             : participantCount > 50
//             ? width < 1024
//               ? 6
//               : 8
//             : width < 1024
//             ? 4
//             : 6
//         );
//       }
//     };

//     updateLayoutAndGroupSize();
//     window.addEventListener("resize", updateLayoutAndGroupSize);
//     return () => window.removeEventListener("resize", updateLayoutAndGroupSize);
//   }, [participantCount]);

//   // Memoized CallLayout
//   const CallLayout = useCallback(() => {
//     switch (layout) {
//       case "grid":
//         return (
//           <div className="w-full h-full overflow-hidden">
//             <PaginatedGridLayout
//               groupSize={groupSize}
//               className="custom-paginated-grid w-full h-full"
//               excludeLocalParticipant={participantCount > 50}
//               pageSize={groupSize * 2}
//             />
//           </div>
//         );
//       case "speaker-right":
//         return (
//           <SpeakerLayout
//             participantsBarPosition="left"
//             className="w-full h-full flex flex-col lg:flex-row"
//           />
//         );
//       default:
//         return (
//           <SpeakerLayout
//             participantsBarPosition="right"
//             className="w-full h-full flex flex-col lg:flex-row"
//           />
//         );
//     }
//   }, [layout, groupSize, participantCount]);

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

//   return (
//     <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white flex flex-col">
//       {/* Invite People Button */}
//       <Button
//         className="fixed top-4 right-4 z-30 font-semibold bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg transition-all duration-200 text-sm sm:text-base"
//         onClick={() => {
//           const meetingLink = `https://texagon.epichouse.online${pathname}`;
//           navigator.clipboard.writeText(meetingLink);
//           toast("Meeting Link Copied", {
//             duration: 3000,
//             className:
//               "!bg-gray-300 !rounded-3xl !py-4 !px-4 !justify-center !text-sm sm:!text-base",
//           });
//         }}>
//         Invite People
//       </Button>

//       {/* Main Call Area */}
//       <div className="flex-1 w-full flex items-center justify-center px-2 sm:px-4 py-4 mb-10">
//         <div className="w-full max-w-[1400px] h-full">
//           <CallLayout />
//         </div>
//       </div>

//       {/* Participants Sidebar */}
//       <div
//         className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
//           showParticipants ? "translate-x-0" : "translate-x-full"
//         }`}>
//         <CallParticipantsList onClose={() => setShowParticipants(false)} />
//       </div>

//       {/* Bottom Controls */}
//       <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0f172a]/90 py-3 px-2 sm:px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
//         <CallControls
//           className="flex flex-wrap justify-center gap-2 sm:gap-3"
//           onLeave={() => router.push("/")}
//         />
//         <DropdownMenu>
//           <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
//             <LayoutList size={18} className="text-white sm:w-5 sm:h-5" />
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="border-black bg-black text-white text-sm sm:text-base">
//             {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   className="py-1.5 sm:py-2 px-2"
//                   onClick={() =>
//                     setLayout(item.toLowerCase() as CallLayoutType)
//                   }>
//                   {item}
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator className="border-dark-1" />
//               </div>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//         <button
//           onClick={() => setShowParticipants((prev) => !prev)}
//           className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
//           <Users size={18} className="text-white sm:w-5 sm:h-5" />
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
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import {useState, useEffect, useCallback} from "react";
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
import {LayoutList, Users, ScreenShare} from "lucide-react";
import {Spinner} from "../ui/spinner";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [groupSize, setGroupSize] = useState(4);

  const router = useRouter();
  const pathname = usePathname();
  const {data: session, status} = useSession();

  const {
    useCallCallingState,
    useParticipantCount,
    useScreenShareState,
    useHasOngoingScreenShare,
  } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount?.() || 0;

  const {status: screenShareStatus} = useScreenShareState();
  const someoneSharing = useHasOngoingScreenShare();
  const isScreenSharing = screenShareStatus === "enabled";

  // Adjust layout & group size responsively
  useEffect(() => {
    const updateLayoutAndGroupSize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setLayout("grid");
        setGroupSize(participantCount > 50 ? 4 : 3);
      } else {
        setLayout((prev) => (prev === "grid" ? "speaker-left" : prev));
        setGroupSize(
          participantCount > 100
            ? width < 1024
              ? 8
              : 12
            : participantCount > 50
            ? width < 1024
              ? 6
              : 8
            : width < 1024
            ? 4
            : 6
        );
      }
    };

    updateLayoutAndGroupSize();
    window.addEventListener("resize", updateLayoutAndGroupSize);
    return () => window.removeEventListener("resize", updateLayoutAndGroupSize);
  }, [participantCount]);

  // Handle screen share toggle
  const handleScreenShare = async () => {
    if (!call) return;

    if (typeof navigator.mediaDevices?.getDisplayMedia === "function") {
      try {
        await call.screenShare.toggle();
      } catch (err) {
        console.error("Error toggling screen share:", err);
        toast.error("Screen sharing failed");
      }
    } else {
      toast(
        "Screen sharing not supported on this browser. Use desktop or native app.",
        {
          duration: 4000,
          className:
            "!bg-red-600 !rounded-3xl !py-4 !px-4 !justify-center !text-sm sm:!text-base",
        }
      );
    }
  };

  // Render layout based on conditions
  const CallLayout = useCallback(() => {
    if (someoneSharing) {
      return (
        <div className="w-full h-full">
          <SpeakerLayout
            participantsBarPosition="bottom"
            className="w-full h-full"
          />
        </div>
      );
    }

    switch (layout) {
      case "grid":
        return (
          <div className="w-full h-full overflow-hidden">
            <PaginatedGridLayout
              groupSize={groupSize}
              className="custom-paginated-grid w-full h-full"
              excludeLocalParticipant={participantCount > 50}
              pageSize={groupSize * 2}
            />
          </div>
        );
      case "speaker-right":
        return (
          <SpeakerLayout
            participantsBarPosition="left"
            className="w-full h-full flex flex-col lg:flex-row"
          />
        );
      default:
        return (
          <SpeakerLayout
            participantsBarPosition="right"
            className="w-full h-full flex flex-col lg:flex-row"
          />
        );
    }
  }, [layout, groupSize, participantCount, someoneSharing]);

  // Auth & state checks
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session?.user) {
    router.push(`/auth/signin?next=${encodeURIComponent(pathname)}`);
    return null;
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white flex flex-col">
      {/* Invite button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() =>
            navigator.clipboard
              .writeText(window.location.href)
              .then(() => toast("Link copied to clipboard"))
          }
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
          Invite
        </Button>
      </div>

      {/* Main video area */}
      <div className="flex-1 w-full flex items-center justify-center px-2 sm:px-4 py-4 mb-10">
        <div className="w-full max-w-[1400px] h-full">
          <CallLayout />
        </div>
      </div>

      {/* Sidebar participants */}
      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
          showParticipants ? "translate-x-0" : "translate-x-full"
        }`}>
        <CallParticipantsList onClose={() => setShowParticipants(false)} />
      </div>

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0f172a]/90 py-3 px-2 sm:px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <CallControls
          className="flex flex-wrap justify-center gap-2 sm:gap-3"
          onLeave={() => router.push("/")}
        />

        {/* Screen share */}
        <button
          onClick={handleScreenShare}
          className={`cursor-pointer rounded-2xl p-2 transition-colors ${
            isScreenSharing ? "bg-red-600" : "bg-[#19232d] hover:bg-[#4c535b]"
          }`}>
          <ScreenShare size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* Layout switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
            <LayoutList size={18} className="text-white sm:w-5 sm:h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-black bg-black text-white text-sm sm:text-base">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, idx) => (
              <div key={idx}>
                <DropdownMenuItem
                  className="py-1.5 sm:py-2 px-2"
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }>
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Participants toggle */}
        <button
          onClick={() => setShowParticipants((prev) => !prev)}
          className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
          <Users size={18} className="text-white sm:w-5 sm:h-5" />
        </button>
      </div>
    </section>
  );
};

export default MeetingRoom;
