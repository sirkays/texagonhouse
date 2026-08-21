"use client";

import { useState, useEffect, useRef } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { useSession } from "next-auth/react";
import { Send, User } from "lucide-react";
import { toast } from "sonner";

interface LivestreamChatProps {
  isHost?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  role: string;
  timestamp: number;
}

export default function LivestreamChat({ isHost = false }: LivestreamChatProps) {
  const call = useCall();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!call) return;

    // 1. Initial sync from room custom data
    const roomHistory = call.state?.custom?.chat_history;
    if (Array.isArray(roomHistory) && roomHistory.length > 0) {
      setMessages((prev) => {
        const map = new Map<string, ChatMessage>();
        prev.forEach((m) => map.set(m.id, m));
        roomHistory.forEach((m: any) => {
          if (m?.id && !map.has(m.id)) {
            map.set(m.id, {
              id: m.id,
              text: m.text || "",
              senderName: m.sender || m.senderName || "Participant",
              senderId: m.senderId || "unknown",
              role: m.role || "viewer",
              timestamp: Number(m.timestamp || Date.now()),
            });
          }
        });
        return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
      });
    }

    // 2. Request chat history from peers
    const timer = setTimeout(() => {
      const myId = String(session?.user?.id || "viewer");
      call.sendCustomEvent({
        type: "request_chat_history",
        requestedBy: myId,
      } as any).catch(() => {});
    }, 500);

    const handleCustomEvent = (event: any) => {
      const eventType = event.custom?.type;
      if (eventType === "chat-message" || eventType === "chat_message") {
        const data = event.custom.data || {
          id: event.custom.id || Math.random().toString(36).substring(7),
          text: event.custom.text || "",
          senderName: event.custom.sender || event.custom.senderName || event.user?.name || "Anonymous",
          senderId: event.custom.senderId || event.user?.id || "unknown",
          role: event.custom.role || "viewer",
          timestamp: event.custom.timestamp || Date.now(),
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data as ChatMessage];
        });
      } else if (eventType === "request_chat_history") {
        const requestedBy = event.custom?.requestedBy;
        const myId = String(session?.user?.id || "");
        if (requestedBy && requestedBy !== myId && messagesRef.current.length > 0) {
          call.sendCustomEvent({
            type: "chat_history_sync",
            targetUserId: requestedBy,
            messages: messagesRef.current.map((m) => ({
              id: m.id,
              sender: m.senderName,
              senderName: m.senderName,
              senderId: m.senderId,
              text: m.text,
              role: m.role,
              timestamp: m.timestamp,
            })),
          } as any).catch(() => {});
        }
      } else if (eventType === "chat_history_sync") {
        const targetUserId = event.custom?.targetUserId;
        const myId = String(session?.user?.id || "");
        if (!targetUserId || targetUserId === myId || targetUserId === "all") {
          const incomingList = event.custom?.messages;
          if (Array.isArray(incomingList) && incomingList.length > 0) {
            setMessages((prev) => {
              const map = new Map<string, ChatMessage>();
              prev.forEach((m) => map.set(m.id, m));
              incomingList.forEach((m: any) => {
                if (m?.id && !map.has(m.id)) {
                  map.set(m.id, {
                    id: m.id,
                    text: m.text || "",
                    senderName: m.senderName || m.sender || "Participant",
                    senderId: m.senderId || "unknown",
                    role: m.role || "viewer",
                    timestamp: Number(m.timestamp || Date.now()),
                  });
                }
              });
              return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
            });
          }
        }
      }
    };

    const unsubscribe = call.on("custom", handleCustomEvent);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [call, session?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !call) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      text: inputText.trim(),
      senderName: session?.user?.name || "Anonymous",
      senderId: session?.user?.id || "unknown",
      role: isHost ? "host" : "viewer",
      timestamp: Date.now(),
    };

    try {
      await call.sendCustomEvent({
        type: "chat_message",
        id: newMessage.id,
        sender: newMessage.senderName,
        senderId: newMessage.senderId,
        text: newMessage.text,
        role: newMessage.role,
        timestamp: newMessage.timestamp,
        data: newMessage,
      });
      // Add to local state since sender might not receive their own custom event
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      setInputText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/95 border-l border-white/12 backdrop-blur-2xl">
      <div className="p-4 border-b border-white/12">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Live Chat
          {isHost && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Host</span>}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
            <User className="w-8 h-8 opacity-50" />
            <p className="text-sm text-center">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === session?.user?.id;
            return (
              <div key={msg.id || idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isMe ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                  {msg.senderName.charAt(0).toUpperCase()}
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-400">{msg.senderName}</span>
                    {msg.role === "host" && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        HOST
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-600">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-zinc-800/80 text-zinc-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/12 bg-zinc-950">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex-shrink-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
