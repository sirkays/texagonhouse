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
// import {LayoutList, Users, ScreenShare} from "lucide-react";
// import {Spinner} from "../ui/spinner";

// type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

// const MeetingRoom = () => {
//   const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [groupSize, setGroupSize] = useState(4);

//   const router = useRouter();
//   const pathname = usePathname();
//   const {data: session, status} = useSession();

//   const {
//     useCallCallingState,
//     useParticipantCount,
//     useScreenShareState,
//     useHasOngoingScreenShare,
//   } = useCallStateHooks();
//   const call = useCall();
//   const callingState = useCallCallingState();
//   const participantCount = useParticipantCount?.() || 0;

//   const {status: screenShareStatus} = useScreenShareState();
//   const someoneSharing = useHasOngoingScreenShare();
//   const isScreenSharing = screenShareStatus === "enabled";

//   // Adjust layout & group size responsively
//   useEffect(() => {
//     const updateLayoutAndGroupSize = () => {
//       const width = window.innerWidth;

//       if (width < 640) {
//         setLayout("grid");
//         setGroupSize(participantCount > 50 ? 4 : 3);
//       } else {
//         setLayout((prev) => (prev === "grid" ? "speaker-left" : prev));
//         setGroupSize(
//           participantCount > 100
//             ? width < 1024
//               ? 8
//               : 12
//             : participantCount > 50
//               ? width < 1024
//                 ? 6
//                 : 8
//               : width < 1024
//                 ? 4
//                 : 6,
//         );
//       }
//     };

//     updateLayoutAndGroupSize();
//     window.addEventListener("resize", updateLayoutAndGroupSize);
//     return () => window.removeEventListener("resize", updateLayoutAndGroupSize);
//   }, [participantCount]);

//   // Handle screen share toggle
//   const handleScreenShare = async () => {
//     if (!call) return;

//     if (typeof navigator.mediaDevices?.getDisplayMedia === "function") {
//       try {
//         await call.screenShare.toggle();
//       } catch (err) {
//         console.error("Error toggling screen share:", err);
//         toast.error("Screen sharing failed");
//       }
//     } else {
//       toast(
//         "Screen sharing not supported on this browser. Use desktop or native app.",
//         {
//           duration: 4000,
//           className:
//             "!bg-red-600 !rounded-3xl !py-4 !px-4 !justify-center !text-sm sm:!text-base",
//         },
//       );
//     }
//   };

//   // Render layout based on conditions
//   const CallLayout = useCallback(() => {
//     if (someoneSharing) {
//       return (
//         <div className="w-full h-full">
//           <SpeakerLayout
//             participantsBarPosition="bottom"
//             className="w-full h-full"
//           />
//         </div>
//       );
//     }

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
//   }, [layout, groupSize, participantCount, someoneSharing]);

//   // Auth & state checks
//   if (status === "loading") {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Spinner size="lg" />
//       </div>
//     );
//   }

//   if (!session?.user) {
//     router.push(`/auth/signin?next=${encodeURIComponent(pathname)}`);
//     return null;
//   }

//   if (callingState !== CallingState.JOINED) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Spinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white flex flex-col">
//       {/* Invite button */}
//       <div className="absolute top-4 right-4 z-10">
//         <Button
//           onClick={() =>
//             navigator.clipboard
//               .writeText(window.location.href)
//               .then(() => toast("Link copied to clipboard"))
//           }
//           className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
//           Invite
//         </Button>
//       </div>

//       {/* Main video area */}
//       <div className="flex-1 w-full flex items-center justify-center px-2 sm:px-4 py-4 mb-10">
//         <div className="w-full max-w-[1400px] h-full">
//           <CallLayout />
//         </div>
//       </div>

//       {/* Sidebar participants */}
//       <div
//         className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-[#111827] transition-transform duration-300 ease-in-out z-20 ${
//           showParticipants ? "translate-x-0" : "translate-x-full"
//         }`}>
//         <CallParticipantsList onClose={() => setShowParticipants(false)} />
//       </div>

//       {/* Bottom controls */}
//       <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0f172a]/90 py-3 px-2 sm:px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
//         <CallControls
//           className="flex flex-wrap justify-center gap-2 sm:gap-3"
//           onLeave={() => router.push("/")}
//         />

//         {/* Layout switcher */}
//         <DropdownMenu>
//           <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b] transition-colors">
//             <LayoutList size={18} className="text-white sm:w-5 sm:h-5" />
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="border-black bg-black text-white text-sm sm:text-base">
//             {["Grid", "Speaker-Left", "Speaker-Right"].map((item, idx) => (
//               <div key={idx}>
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

//         {/* Participants toggle */}
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
import {LayoutList, Users} from "lucide-react";
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

  // Helper to determine dashboard path based on role
  const getDashboardPath = () => {
    if (!session?.user) return "/";

    const role = session.user.role?.toLowerCase() ?? "";

    if (
      role.includes("teacher") ||
      role.includes("instructor") ||
      role === "tutor"
    ) {
      return "/teacher";
    }

    if (
      role.includes("student") ||
      role === "learner" ||
      role === "pupil" ||
      role === "parent"
    ) {
      return "/student";
    }

    if (role.includes("admin")) {
      return "/admin/dashboard";
    }

    return "/dashboard";
  };

  // Responsive layout & group size
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
                : 6,
        );
      }
    };

    updateLayoutAndGroupSize();
    window.addEventListener("resize", updateLayoutAndGroupSize);
    return () => window.removeEventListener("resize", updateLayoutAndGroupSize);
  }, [participantCount]);

  // Layout renderer
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
          <div className="w-full h-full overflow-hidden custom-paginated-grid">
            <PaginatedGridLayout
              groupSize={groupSize}
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

  // Loading / auth checks
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

      {/* Participants sidebar */}
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
          onLeave={async () => {
            if (call) {
              try {
                // Explicitly disable camera & mic before leaving
                // This helps ensure tracks are stopped and camera light turns off
                await call.camera.disable();
                await call.microphone.disable();

                // Optional: stop screen share too if active
                if (call.screenShare.isEnabled) {
                  await call.screenShare.disable();
                }

                // Now leave the call (this also triggers internal cleanup)
                await call.leave();
              } catch (err) {
                console.error("Error during leave cleanup:", err);
              }
            }

            // Redirect to correct dashboard
            router.push(getDashboardPath());
          }}
        />

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
                  onClick={() => {
                    const newLayout = item
                      .toLowerCase()
                      .replace("-", "") as CallLayoutType;
                    setLayout(newLayout);
                  }}>
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
