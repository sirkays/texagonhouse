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
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!call) return;

    const handleCustomEvent = (event: any) => {
      if (event.custom?.type === "chat-message") {
        setMessages((prev) => [...prev, event.custom.data as ChatMessage]);
      }
    };

    const unsubscribe = call.on("custom", handleCustomEvent);
    return () => {
      unsubscribe();
    };
  }, [call]);

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
      await call.sendCustomEvent({ type: "chat-message", data: newMessage });
      // Add to local state since sender might not receive their own custom event
      setMessages((prev) => [...prev, newMessage]);
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
