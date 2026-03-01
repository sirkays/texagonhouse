// export default CallList;

"use client";

import {useEffect, useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Trash2, Calendar, Video, Clock} from "lucide-react";
import {toast} from "sonner";
import {Spinner} from "../ui/spinner";

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
  const {data: session} = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [joining, setJoining] = useState<Record<string, boolean>>({});
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
        const meetingResponse = await fetch("/api/teacher/live-session/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
            "X-Session-Token": sessionToken || "",
          },
        });

        if (!meetingResponse.ok) {
          const errorData = await meetingResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || "Failed to fetch meetings";
          throw new Error(errorMessage);
        }

        const data = await meetingResponse.json();
        const meetings: Meeting[] = (data.live_sessions || [])
          .map((meeting: any) => ({
            id: meeting.id,
            scheduled_at: meeting.scheduled_at,
            title: meeting.title,
            description: meeting.description || meeting.title,
            join_url: meeting.join_url,
            recording_url: meeting.recording_url,
          }))
          .filter((meeting: Meeting) => {
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

        setMeetings(meetings);
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
    setDeleting((prev) => ({...prev, [meetingId]: true}));
    try {
      const response = await fetch(
        `/api/teacher/live-session/${meetingId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
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
      setDeleting((prev) => ({...prev, [meetingId]: false}));
    }
  };

  const handleJoin = (meeting: Meeting) => {
    setJoining((prev) => ({...prev, [meeting.id]: true}));
    const isUpcoming = new Date(meeting.scheduled_at) >= currentDate;
    if (!isUpcoming && meeting.recording_url) {
      window.location.href = meeting.recording_url;
    } else {
      router.push(meeting.join_url || `/main/meeting/${meeting.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
      description = "No recordings available at the moment.";
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg p-6 shadow-sm">
        <img
          src={imgSrc}
          alt="No calls"
          className="w-20 h-20 mb-4 opacity-80"
        />
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        <p className="text-gray-500 mt-2 text-sm">{description}</p>
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
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-100">
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

          {/* Meeting Title */}
          {/* <h3 className="text-base font-semibold text-gray-800 truncate">
            {meeting.title || "Untitled Meeting"}
          </h3> */}

          {/* Meeting Description */}
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {meeting.description || meeting.title || "No description available"}
          </p>

          {/* Action Buttons */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => handleJoin(meeting)}
              disabled={joining[meeting.id]}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 disabled:opacity-50 ${
                isUpcoming
                  ? "bg-[#ef7b55]/70 text-slate-100 hover:bg-[#ef7b55]/90"
                  : "bg-[#ef7b55]/70 text-slate-100 hover:bg-[#ef7b55]/90"
              }`}>
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
                title="Delete Meeting">
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
    return renderNoMeetings();
  }

  if (type === "all") {
    const upcoming = meetings
      .filter((m) => new Date(m.scheduled_at) >= currentDate)
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime(),
      );

    const previous = meetings
      .filter((m) => new Date(m.scheduled_at) < currentDate)
      .sort(
        (a, b) =>
          new Date(b.scheduled_at).getTime() -
          new Date(a.scheduled_at).getTime(),
      );

    return (
      <div className="p-4 bg-gray-50">
        {upcoming.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Upcoming Live Sessions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {upcoming.map(renderMeetingCard)}
            </div>
          </>
        )}
        {previous.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 mt-8">
              Previous Live Sessions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {previous.map(renderMeetingCard)}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 bg-gray-50">
      {meetings.map((meeting: Meeting) => {
        const isUpcoming = type === "upcoming";
        const buttonText = type === "upcoming" ? "Start Meeting" : "Ended";

        return (
          <div
            key={meeting.id}
            className="bg-white rounded-lg hover:shadow-lg transition-all duration-300 ease-in-out border border-[#ef7b55]/20">
            <div className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-[#ef7b55]/10 rounded-bl-full opacity-50" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {type === "ended" || type === "recordings" ? (
                    <Video className="w-4 h-4 text-[#ef7b55]" />
                  ) : (
                    <Calendar className="w-4 h-4 text-[#ef7b55]" />
                  )}
                  <span className="text-xs font-medium text-gray-600 uppercase">
                    {type === "upcoming"
                      ? "Upcoming"
                      : type === "ended"
                        ? "Ended"
                        : "Recording"}
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
                {meeting.description ||
                  meeting.title ||
                  "No description available"}
              </p>

              <div className="mt-4 flex justify-between items-center">
                {/* Hide button completely if meeting is ended */}
                {type !== "ended" && (
                  <button
                    onClick={() => {
                      setJoining((prev) => ({...prev, [meeting.id]: true}));

                      // If meeting is scheduled/upcoming → redirect to schedule link
                      if (type === "upcoming") {
                        router.push(`/main/schedule/${meeting.id}`); // 👈 change to your actual schedule route
                      } else {
                        // Otherwise normal join behavior
                        router.push(
                          meeting.join_url || `/main/meeting/${meeting.id}`,
                        );
                      }
                    }}
                    disabled={joining[meeting.id]}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 disabled:opacity-50 bg-[#ef7b55]/70 hover:bg-[#ef7b55]/90">
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
                    title="Delete Meeting">
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
  );
};

export default CallList;
