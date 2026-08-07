"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trash2, Calendar, Video, Clock, Play, Download, X, Film, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

import { getStreamRecordingsAction } from "@/actions/stream.actions";

interface Meeting {
  id: string;
  scheduled_at: string;
  title?: string;
  description?: string;
  join_url?: string;
  recording_url?: string;
}

const CallList = ({
  type,
}: {
  type: "ended" | "upcoming" | "recordings" | "all";
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [joining, setJoining] = useState<Record<string, boolean>>({});
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken],
  );

  const currentDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        let dbMeetings: Meeting[] = [];
        try {
          const meetingResponse = await fetch("/api/teacher/live-session/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Api-Key WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8`,
              "X-Session-Token": sessionToken || "",
            },
          });

          if (meetingResponse.ok) {
            const data = await meetingResponse.json();
            dbMeetings = (data.live_sessions || []).map((meeting: any) => ({
              id: String(meeting.id),
              scheduled_at: meeting.scheduled_at,
              title: meeting.title,
              description: meeting.description || meeting.title,
              join_url: meeting.join_url,
              recording_url: meeting.recording_url,
            }));
          }
        } catch {
          // ignore DB fetch errors if offline or unsupported endpoint
        }

        let streamRecordings: Meeting[] = [];
        if (type === "recordings" || type === "all") {
          try {
            const streamRes = await getStreamRecordingsAction();
            if (streamRes.success && streamRes.recordings?.length) {
              streamRecordings = streamRes.recordings.map((rec: any, idx: number) => {
                const startTime = rec.start_time ? new Date(rec.start_time) : new Date();
                const formattedDate = startTime.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return {
                  id: rec.filename || rec.url || `stream-rec-${idx}`,
                  scheduled_at: rec.start_time || new Date().toISOString(),
                  title: rec.custom?.title || rec.custom?.description || `Recorded Meeting - ${formattedDate}`,
                  description: `Stream Cloud Recording (SD 480p) • ${rec.call_id || "Live Session"}`,
                  recording_url: rec.url,
                };
              });
            }
          } catch (err) {
            console.error("Stream recordings fetch error:", err);
          }
        }

        // Combine DB live-sessions and direct Stream API recordings
        const combined = [...dbMeetings, ...streamRecordings];
        const seenUrls = new Set<string>();
        const uniqueList: Meeting[] = [];

        for (const item of combined) {
          if (item.recording_url) {
            if (!seenUrls.has(item.recording_url)) {
              seenUrls.add(item.recording_url);
              uniqueList.push(item);
            }
          } else {
            uniqueList.push(item);
          }
        }

        const filteredList = uniqueList.filter((meeting: Meeting) => {
          const meetingDate = new Date(meeting.scheduled_at);
          if (type === "all") {
            return true;
          } else if (type === "upcoming") {
            return meetingDate >= currentDate;
          } else if (type === "ended") {
            return meetingDate < currentDate;
          } else {
            return !!meeting.recording_url;
          }
        });

        setMeetings(filteredList);
        setIsLoading(false);
      } catch (err: any) {
        toast.error(`Failed to fetch meetings: ${err.message}`, {
          duration: 4000,
          className: "bg-red-50 text-red-700 rounded-lg py-3 px-4 shadow-sm",
        });
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [sessionToken, type, currentDate]);

  const handleDeleteMeeting = async (meetingId: string) => {
    setDeleting((prev) => ({ ...prev, [meetingId]: true }));
    try {
      const response = await fetch(
        `/api/teacher/live-session/${meetingId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8`,
            "X-Session-Token": sessionToken || "",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to delete live session";
        if (response.status === 401) {
          throw new Error(`Unauthorized: Session expired`);
        } else if (response.status === 403) {
          throw new Error(`Unauthorized: ${errorMessage}`);
        } else if (response.status === 404) {
          throw new Error("Live session not found");
        } else {
          throw new Error(errorMessage);
        }
      }

      toast.success("Meeting deleted successfully", {
        duration: 3000,
        className: "bg-green-50 text-green-700 rounded-lg py-3 px-4 shadow-sm",
      });
      router.refresh();
    } catch (err: any) {
      toast.error(`Failed to delete meeting: ${err.message}`, {
        duration: 4000,
        className: "bg-red-50 text-red-700 rounded-lg py-3 px-4 shadow-sm",
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [meetingId]: false }));
    }
  };

  const handleJoin = (meeting: Meeting) => {
    setJoining((prev) => ({ ...prev, [meeting.id]: true }));
    const isUpcoming = new Date(meeting.scheduled_at) >= currentDate;
    if (!isUpcoming && meeting.recording_url) {
      setActiveVideo({
        url: meeting.recording_url,
        title: meeting.title || "Meeting Recording",
      });
      setJoining((prev) => ({ ...prev, [meeting.id]: false }));
    } else {
      router.push(meeting.join_url || `/main/meeting/${meeting.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 rounded-xl">
        <Spinner size="lg" className="text-[#ef7b55]" />
      </div>
    );
  }

  const renderNoMeetings = () => {
    let imgSrc = "/no-calls.svg";
    let title = "No Calls";
    let description = "No calls available";

    if (type === "all") {
      title = "No Live Sessions Available";
      description = "You have no upcoming or previous live sessions.";
    } else if (type === "upcoming") {
      title = "No Upcoming Calls";
      description = "Schedule a new meeting to get started!";
    } else if (type === "ended") {
      imgSrc = "/ended.svg";
      title = "No Previous Calls";
      description = "No past meetings found.";
    } else if (type === "recordings") {
      title = "No Recordings Available";
      description = "Recordings from ended meetings will appear here. Start a call and click 'Record' to generate meeting recordings.";
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="w-20 h-20 rounded-2xl bg-[#ef7b55]/10 flex items-center justify-center mb-4 text-[#ef7b55]">
          {type === "recordings" ? <Film size={36} /> : <Video size={36} />}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-2 text-sm text-center max-w-md">{description}</p>
      </div>
    );
  };

  const renderRecordingCard = (meeting: Meeting) => {
    const title = meeting.title || "Meeting Recording";
    const videoUrl = meeting.recording_url || "#";

    return (
      <div
        key={meeting.id}
        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#ef7b55]/20 flex flex-col overflow-hidden group"
      >
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 font-bold text-[11px]">
                  <Film className="w-3.5 h-3.5" />
                  Recorded Meeting
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#ef7b55] transition-colors truncate">
              {title}
            </h3>

            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {meeting.description || "Recorded video session available for playback and download."}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
            {/* Play Button */}
            <button
              onClick={() => setActiveVideo({ url: videoUrl, title })}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ef7b55] hover:bg-[#e0663f] text-white text-xs font-bold transition shadow-md shadow-[#ef7b55]/20 cursor-pointer"
            >
              <Play size={14} className="fill-current" />
              <span>Play</span>
            </button>

            {/* Download MP4 Button */}
            <a
              href={videoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              title="Download MP4 Video"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderMeetingCard = (meeting: Meeting) => {
    const isUpcoming = new Date(meeting.scheduled_at) >= currentDate;
    const buttonText = isUpcoming
      ? "Start Meeting"
      : meeting.recording_url
        ? "View Recording"
        : "View Meeting";

    return (
      <div
        key={meeting.id}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-100"
      >
        <div className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 rounded-bl-full opacity-50" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {isUpcoming ? (
                <Calendar className="w-4 h-4 text-[#ef7b55]" />
              ) : (
                <Video className="w-4 h-4 text-[#ef7b55]" />
              )}
              <span className="text-xs font-medium text-gray-600 uppercase">
                {isUpcoming ? "Upcoming" : "Ended"}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(meeting.scheduled_at).toLocaleString()}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {meeting.description || meeting.title || "No description available"}
          </p>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => handleJoin(meeting)}
              disabled={joining[meeting.id]}
              className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 disabled:opacity-50 bg-[#ef7b55]/70 hover:bg-[#ef7b55]/90"
            >
              {joining[meeting.id] ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                buttonText
              )}
            </button>

            {session?.user?.role === "teacher" && isUpcoming && (
              <button
                onClick={() => handleDeleteMeeting(meeting.id)}
                disabled={deleting[meeting.id]}
                className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                title="Delete Meeting"
              >
                {deleting[meeting.id] ? (
                  <Spinner size="sm" className="w-4 h-4 text-red-600" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (meetings.length === 0) {
    return (
      <>
        {renderNoMeetings()}
        {activeVideo && (
          <VideoModal
            videoUrl={activeVideo.url}
            title={activeVideo.title}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </>
    );
  }

  if (type === "recordings") {
    return (
      <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
          {meetings.map(renderRecordingCard)}
        </div>
        {activeVideo && (
          <VideoModal
            videoUrl={activeVideo.url}
            title={activeVideo.title}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 bg-gray-50">
        {meetings.map((meeting: Meeting) => {
          const buttonText = type === "upcoming" ? "Start Meeting" : "Ended";

          return (
            <div
              key={meeting.id}
              className="bg-white rounded-lg hover:shadow-lg transition-all duration-300 ease-in-out border border-[#ef7b55]/20"
            >
              <div className="p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[#ef7b55]/10 rounded-bl-full opacity-50" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-[#ef7b55]" />
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      {type === "upcoming" ? "Upcoming" : "Ended"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(meeting.scheduled_at).toLocaleString()}</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {meeting.title || "Untitled Meeting"}
                </h3>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {meeting.description || meeting.title || "No description available"}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  {type !== "ended" && (
                    <button
                      onClick={() => {
                        setJoining((prev) => ({ ...prev, [meeting.id]: true }));
                        if (type === "upcoming") {
                          router.push(`/main/schedule/${meeting.id}`);
                        } else {
                          router.push(meeting.join_url || `/main/meeting/${meeting.id}`);
                        }
                      }}
                      disabled={joining[meeting.id]}
                      className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 disabled:opacity-50 bg-[#ef7b55]/70 hover:bg-[#ef7b55]/90"
                    >
                      {joining[meeting.id] ? (
                        <Spinner size="sm" className="text-white" />
                      ) : type === "upcoming" ? (
                        "View Schedule"
                      ) : (
                        buttonText
                      )}
                    </button>
                  )}

                  {session?.user?.role === "teacher" && type === "upcoming" && (
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      disabled={deleting[meeting.id]}
                      className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                      title="Delete Meeting"
                    >
                      {deleting[meeting.id] ? (
                        <Spinner size="sm" className="w-4 h-4 text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {activeVideo && (
        <VideoModal
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
};

// ── In-App Video Player Modal ──
function VideoModal({
  videoUrl,
  title,
  onClose,
}: {
  videoUrl: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#18191c] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1f2024]">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-[#ef7b55]" />
            <h3 className="font-bold text-white text-base truncate max-w-md">{title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={videoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            >
              <Download size={14} />
              <span>Download MP4</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video streaming.
          </video>
        </div>
      </div>
    </div>
  );
}

export default CallList;
