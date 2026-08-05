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
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  LayoutList,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Smile,
} from "lucide-react";
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
    useMicrophoneState,
    useCameraState,
  } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount?.() || 0;

  const {isMuted: isMicMuted} = useMicrophoneState();
  const {isMuted: isCamMuted} = useCameraState();
  const {status: screenShareStatus} = useScreenShareState();
  const isScreenSharing = screenShareStatus === "enabled";
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

  // Toggle Screen Share
  const handleScreenShare = async () => {
    if (!call) return;
    try {
      await call.screenShare.toggle();
    } catch (err) {
      console.error("Error toggling screen share:", err);
      toast.error("Screen sharing error");
    }
  };

  // Send Reaction Emoji
  const handleSendReaction = async (emoji: string) => {
    if (!call) return;
    try {
      await call.sendReaction({
        type: "reaction",
        emoji: {unicode: emoji},
      });
      toast.success(`Reaction ${emoji} sent`, {duration: 1500});
    } catch (err) {
      console.error("Error sending reaction:", err);
    }
  };

  // Leave Call cleanly
  const handleLeaveCall = async () => {
    if (call) {
      try {
        await call.camera.disable();
        await call.microphone.disable();
        if (call.screenShare.isEnabled) {
          await call.screenShare.disable();
        }
        await call.leave();
      } catch (err) {
        console.error("Error during leave cleanup:", err);
      }
    }
    router.push(getDashboardPath());
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
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-950 text-white flex flex-col">
      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
        {/* Left: Brand & Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>LIVE</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/15" />
          <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-[350px]">
            Techxagon Meeting Room
          </h1>
        </div>

        {/* Center: Security Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>End-to-End Encrypted Session</span>
        </div>

        {/* Right: Invite & Participants Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() =>
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => toast.success("Invite link copied to clipboard!"))
            }
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition flex items-center gap-2 cursor-pointer"
          >
            <span>Invite</span>
          </Button>

          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
              showParticipants
                ? "bg-[#EF7B55] border-[#EF7B55] text-white"
                : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
            }`}
          >
            <Users size={16} />
            <span className="hidden sm:inline">People</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-black/40">
              {participantCount}
            </span>
          </button>
        </div>
      </header>

      {/* Main Video Stage — flex-1 fills remaining height, pb-28 clears the dock */}
      <div className="flex-1 min-h-0 w-full flex items-stretch justify-center p-2 sm:p-3 pb-28">
        <div className="w-full max-w-[1440px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950/60 backdrop-blur-md">
          <CallLayout />
        </div>
      </div>

      {/* Slide-over Participants Drawer — fixed to header bottom, ends at dock */}
      <div
        className={`fixed top-[57px] right-0 bottom-24 w-[min(320px,90vw)] sm:w-80 bg-zinc-950/96 border-l border-white/10 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-30 shadow-2xl flex flex-col ${
          showParticipants ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#EF7B55]" />
            <h2 className="font-bold text-white text-sm">Participants ({participantCount})</h2>
          </div>
          <button
            onClick={() => setShowParticipants(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition text-sm"
          >
            ✕
          </button>
        </div>
        {/* Scrollable list — takes remaining height */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2">
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* ─── Floating Bottom Control Dock ─── */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex items-end justify-center px-3">
        <div className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-2xl bg-zinc-950/95 border border-white/12 shadow-2xl rounded-2xl px-3 sm:px-4 py-2.5 max-w-[calc(100vw-24px)] overflow-x-auto">

          {/* ── Microphone ── */}
          <button
            onClick={() => call?.microphone.toggle()}
            title={isMicMuted ? "Unmute" : "Mute"}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 min-w-[52px] ${
              isMicMuted
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40"
                : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25"
            }`}
          >
            {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
            <span className="text-[9px] font-semibold leading-none">
              {isMicMuted ? "Muted" : "Mic On"}
            </span>
          </button>

          {/* ── Camera ── */}
          <button
            onClick={() => call?.camera.toggle()}
            title={isCamMuted ? "Start Camera" : "Stop Camera"}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 min-w-[52px] ${
              isCamMuted
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40"
                : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25"
            }`}
          >
            {isCamMuted ? <VideoOff size={18} /> : <Video size={18} />}
            <span className="text-[9px] font-semibold leading-none">
              {isCamMuted ? "Cam Off" : "Cam On"}
            </span>
          </button>

          {/* ── Screen Share (desktop only) ── */}
          <button
            onClick={handleScreenShare}
            title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
            className={`hidden sm:flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 min-w-[52px] ${
              isScreenSharing
                ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/40"
                : "bg-white/8 hover:bg-white/14 text-zinc-300 border border-white/10"
            }`}
          >
            <Monitor size={18} />
            <span className="text-[9px] font-semibold leading-none">
              {isScreenSharing ? "Sharing" : "Share"}
            </span>
          </button>

          {/* ── Reactions ── */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 min-w-[52px]"
              title="Send Reaction"
            >
              <Smile size={18} />
              <span className="text-[9px] font-semibold leading-none">React</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border border-white/15 bg-zinc-900/98 backdrop-blur-xl text-white rounded-2xl p-2 shadow-2xl flex flex-wrap gap-1 max-w-[200px]">
              {["👍", "👏", "❤️", "🎉", "✋", "🔥"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="p-2 text-lg hover:bg-white/15 rounded-xl transition cursor-pointer hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 mx-0.5 shrink-0" />

          {/* ── Layout Switcher ── */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 min-w-[52px]"
              title="Change Layout"
            >
              <LayoutList size={18} />
              <span className="text-[9px] font-semibold leading-none capitalize">
                {layout === "speakerleft" ? "Speaker" : layout === "speakerright" ? "Speaker" : "Grid"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border border-white/15 bg-zinc-900/98 backdrop-blur-xl text-white text-xs sm:text-sm rounded-xl p-1 shadow-2xl min-w-[150px]">
              {["Grid", "Speaker-Left", "Speaker-Right"].map((item, idx) => (
                <DropdownMenuItem
                  key={idx}
                  className={`py-2.5 px-3 rounded-lg cursor-pointer transition flex items-center gap-2 ${
                    layout === item.toLowerCase().replace("-", "")
                      ? "bg-[#EF7B55] text-white font-bold"
                      : "hover:bg-white/10 text-zinc-300"
                  }`}
                  onClick={() => {
                    const newLayout = item
                      .toLowerCase()
                      .replace("-", "") as CallLayoutType;
                    setLayout(newLayout);
                  }}
                >
                  {layout === item.toLowerCase().replace("-", "") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  )}
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 mx-0.5 shrink-0" />

          {/* ── Leave ── */}
          <button
            onClick={handleLeaveCall}
            title="Leave Meeting"
            className="flex flex-col items-center gap-1 bg-gradient-to-b from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-3 py-2 rounded-xl font-bold shadow-lg shadow-red-600/30 hover:scale-105 transition-all cursor-pointer shrink-0 min-w-[52px]"
          >
            <PhoneOff size={18} />
            <span className="text-[9px] font-semibold leading-none">Leave</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
