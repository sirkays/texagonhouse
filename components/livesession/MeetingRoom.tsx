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
  MessageCircle,
  Send,
} from "lucide-react";
import {Spinner} from "../ui/spinner";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [groupSize, setGroupSize] = useState(4);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

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
    useLocalParticipant,
    useHasPermissions,
  } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount?.() || 0;
  const localParticipant = useLocalParticipant();

  const {isMuted: isMicMuted, isEnabled: isMicEnabled} = useMicrophoneState();
  const {isMuted: isCamMuted, isEnabled: isCamEnabled} = useCameraState();
  const isMicOff = isMicMuted || isMicEnabled === false;
  const isCamOff = isCamMuted || isCamEnabled === false;
  const {status: screenShareStatus} = useScreenShareState();
  const isScreenSharing = screenShareStatus === "enabled";
  const someoneSharing = useHasOngoingScreenShare();

  const hasMicPermission = useHasPermissions("send-audio");
  const hasCamPermission = useHasPermissions("send-video");
  const hasScreenSharePermission = useHasPermissions("screen-share");

  const isHost = session?.user?.role === "teacher" || session?.user?.role === "admin";

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

  // Send Reaction Emoji with floating animation
  const handleSendReaction = async (emoji: string) => {
    if (!call) return;
    try {
      await call.sendReaction({
        type: "reaction",
        emoji: {unicode: emoji},
      });
      // Add floating reaction
      const id = crypto.randomUUID();
      const x = 20 + Math.random() * 60; // random horizontal position 20-80%
      setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
      // Remove after animation completes
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2500);
    } catch (err) {
      console.error("Error sending reaction:", err);
    }
  };

  // Send chat message
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    // Resolve user name: Check NextAuth session first, then Stream localParticipant name, fallback to "Guest"
    const userName = session?.user?.name || localParticipant?.name || localParticipant?.user?.name || "Guest";
    const textToSend = chatInput.trim();
    setChatInput("");
    
    // Send via call custom events if available (Stream broadcasts to all clients including sender)
    if (call) {
      try {
        call.sendCustomEvent({
          type: "chat_message",
          sender: userName,
          text: textToSend,
        });
      } catch (err) {
        console.error("Failed to send chat:", err);
      }
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
    try {
      sessionStorage.clear();
    } catch {
      // non-fatal
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

  // Listen for incoming custom chat events
  useEffect(() => {
    if (!call) return;
    const handler = (event: any) => {
      if (event.custom?.type === "chat_message") {
        const incoming: ChatMessage = {
          id: crypto.randomUUID(),
          sender: event.custom.sender || "Unknown",
          text: event.custom.text || "",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, incoming]);
      }
    };
    call.on("custom", handler);
    return () => {
      call.off("custom", handler);
    };
  }, [call]);

  // Restore chat messages from sessionStorage on mount
  useEffect(() => {
    if (!call?.id) return;
    try {
      const stored = sessionStorage.getItem(`techxagon_chat_${call.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setChatMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      }
    } catch {
      // non-fatal
    }
  }, [call?.id]);

  // Save chat messages to sessionStorage on change
  useEffect(() => {
    if (!call?.id || chatMessages.length === 0) return;
    try {
      sessionStorage.setItem(`techxagon_chat_${call.id}`, JSON.stringify(chatMessages));
    } catch {
      // non-fatal
    }
  }, [chatMessages, call?.id]);

  // Listen for incoming reactions from other participants
  useEffect(() => {
    if (!call) return;
    const handler = (event: any) => {
      const emoji = event.reaction?.emoji?.unicode;
      if (emoji) {
        const id = crypto.randomUUID();
        const x = 20 + Math.random() * 60;
        setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
        setTimeout(() => {
          setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
        }, 2500);
      }
    };
    call.on("call.reaction_new", handler);
    return () => {
      call.off("call.reaction_new", handler);
    };
  }, [call]);

  // Clean up camera & mic hardware when unmounting (turns off laptop camera light)
  useEffect(() => {
    return () => {
      if (call) {
        call.camera.disable().catch(() => {});
        call.microphone.disable().catch(() => {});
      }
    };
  }, [call]);

  // Prevent ghost participants on reload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Synchronously notify Stream that the user is leaving to prevent ghost participants
      if (call) {
        call.leave().catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [call]);

  // Loading / auth checks
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-950 text-white flex flex-col">
      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between backdrop-blur-xl bg-slate-950/70 border-b border-white/10 gap-2">
        {/* Left: Brand & Live Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-ping" />
            <span>LIVE</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/15 shrink-0" />
          <h1 className="hidden sm:block text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-[350px]">
            Techxagon Meeting Room
          </h1>
        </div>

        {/* Center: Security Badge (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 shrink-0">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>End-to-End Encrypted Session</span>
        </div>

        {/* Right: Invite & Participants Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Button
            onClick={() =>
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => toast.success("Invite link copied to clipboard!"))
            }
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <Send size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Invite</span>
          </Button>

          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
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

      {/* Main Video Stage */}
      <div className="flex-1 min-h-0 w-full flex items-stretch justify-center p-2 sm:p-3 pb-28">
        <div className="w-full max-w-[1440px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950/60 backdrop-blur-md">
          <CallLayout />
        </div>
      </div>

      {/* ── Floating Reactions Overlay ── */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-32 text-4xl sm:text-5xl"
            style={{
              left: `${r.x}%`,
              animation: "floatUp 2.5s ease-out forwards",
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Inline CSS for float animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-200px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-400px) scale(0.8);
          }
        }
      `}} />

      {/* Slide-over Participants Drawer */}
      <div
        className={`fixed top-[57px] right-0 bottom-24 w-[min(320px,90vw)] sm:w-80 bg-zinc-950/96 border-l border-white/10 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-30 shadow-2xl flex flex-col ${
          showParticipants ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#EF7B55]" />
            <h2 className="font-bold text-white text-sm">Participants ({participantCount})</h2>
          </div>
          <button
            onClick={() => setShowParticipants(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2">
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* ── Chat Drawer ── */}
      <div
        className={`fixed top-[57px] right-0 bottom-24 w-[min(360px,90vw)] sm:w-[380px] bg-zinc-950/96 border-l border-white/10 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-30 shadow-2xl flex flex-col ${
          showChat ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Chat Header */}
        <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#EF7B55]" />
            <h2 className="font-bold text-white text-sm">Meeting Chat</h2>
          </div>
          <button
            onClick={() => setShowChat(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
              <MessageCircle className="w-8 h-8 opacity-30" />
              <p className="text-xs">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#EF7B55]">{msg.sender}</span>
                  <span className="text-[10px] text-zinc-600">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-zinc-200 bg-white/5 rounded-xl px-3 py-2">
                  {msg.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Chat Input */}
        <div className="flex-none p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#EF7B55]/50 focus:ring-1 focus:ring-[#EF7B55]/20 transition"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
              className="p-2.5 rounded-xl bg-[#EF7B55] hover:bg-[#e0663f] text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Floating Bottom Control Dock ─── */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex items-end justify-center px-3">
        <div className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-2xl bg-zinc-950/95 border border-white/12 shadow-2xl rounded-2xl px-3 sm:px-4 py-2.5 max-w-[calc(100vw-24px)] overflow-x-auto">

          {/* ── Microphone ── */}
          {hasMicPermission && (
            <button
              onClick={() => call?.microphone.toggle()}
              title={isMicOff ? "Unmute" : "Mute"}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
                isMicOff
                  ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:shadow-red-500/20"
                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-emerald-500/20"
              }`}
            >
              {isMicOff ? <MicOff size={20} strokeWidth={2.5} /> : <Mic size={20} strokeWidth={2.5} />}
              <span className="text-[10px] font-bold tracking-wide">
                {isMicOff ? "Muted" : "Mic"}
              </span>
            </button>
          )}

          {/* ── Camera ── */}
          {hasCamPermission && (
            <button
              onClick={() => call?.camera.toggle()}
              title={isCamOff ? "Start Camera" : "Stop Camera"}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
                isCamOff
                  ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:shadow-red-500/20"
                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-emerald-500/20"
              }`}
            >
              {isCamOff ? <VideoOff size={20} strokeWidth={2.5} /> : <Video size={20} strokeWidth={2.5} />}
              <span className="text-[10px] font-bold tracking-wide">
                {isCamOff ? "Stopped" : "Cam"}
              </span>
            </button>
          )}

          {/* ── Screen Share (desktop only) ── */}
          {hasScreenSharePermission && (
            <button
              onClick={handleScreenShare}
              title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              className={`hidden sm:flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
                isScreenSharing
                  ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/40 border border-sky-400"
                  : "bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10 hover:shadow-white/10"
              }`}
            >
              <Monitor size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-wide">
                {isScreenSharing ? "Sharing" : "Share"}
              </span>
            </button>
          )}

          {/* ── Reactions ── */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10"
              title="Send Reaction"
            >
              <Smile size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-wide">React</span>
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

          {/* ── Chat ── */}
          <button
            onClick={() => { setShowChat((prev) => !prev); if (showParticipants) setShowParticipants(false); }}
            title="Chat"
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
              showChat
                ? "bg-[#EF7B55] hover:bg-[#e0663f] border border-[#EF7B55] text-white shadow-[#EF7B55]/30"
                : "bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white hover:shadow-white/10"
            }`}
          >
            <MessageCircle size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">Chat</span>
          </button>

          {/* ── Host Tools (Mute All & Stop Video) ── */}
          {isHost && (
            <>
              <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />
              <button
                onClick={() => {
                  call?.muteAllUsers('audio').then(() => {
                    toast.success("Muted all participants");
                  });
                }}
                title="Mute All Guests"
                className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20"
              >
                <MicOff size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wide">Mute All</span>
              </button>
              <button
                onClick={() => {
                  call?.muteAllUsers('video').then(() => {
                    toast.success("Stopped video for all participants");
                  });
                }}
                title="Stop Video for All Guests"
                className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20"
              >
                <VideoOff size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wide">Stop All</span>
              </button>
            </>
          )}

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
