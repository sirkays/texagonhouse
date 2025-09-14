"use client";

import {useEffect, useState, useMemo,} from "react";
import Loading from "./Loading";
import Alert from "./Alert";
import {useRouter} from "next/navigation";
import MeetingCard from "./MeetingCard";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {Trash2} from "lucide-react";

interface Meeting {
  id: string;
  scheduled_at: string;
  title?: string;
  description?: string;
  join_url?: string;
}

const CallList = ({type}: {type: "ended" | "upcoming" | "recordings"}) => {
  const router = useRouter();
  const {data: session} = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sessionToken = useMemo(() => session?.user?.sessionToken || null, [session?.user?.sessionToken])

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!session?.user || type !== "upcoming") {
        setIsLoading(false);
        return;
      }

      try {
        const meetingResponse = await fetch("/api/teacher/live-session/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!meetingResponse.ok) {
          const errorData = await meetingResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || "Failed to fetch upcoming meetings";
          throw new Error(errorMessage);
        }

        const data = await meetingResponse.json();
        const currentDate = new Date();
        const meetings: Meeting[] = (data.live_sessions || []).map((meeting: any) => ({
          id: meeting.id,
          scheduled_at: meeting.scheduled_at,
          title: meeting.title,
          description: meeting.description || meeting.title,
          join_url: meeting.join_url,
        })).filter((meeting: Meeting) => new Date(meeting.scheduled_at) > currentDate);

        setMeetings(meetings);
        setIsLoading(false);
      } catch (err: any) {
        toast.error(`Failed to fetch meetings: ${err.message}`, {
          duration: 4000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
        console.error("[CallList] Error fetching meetings:", err);
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [sessionToken, type]);

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/teacher/live-session/${meetingId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      router.refresh(); // Refresh to update the UI
    } catch (err: any) {
      toast.error(`Failed to delete meeting: ${err.message}`, {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[CallList] Error deleting meeting:", err);
    }
  };

  if (isLoading) return <Loading />;

  if (type !== "upcoming" && meetings.length < 0) {
    return (
      <Alert
        title="No calls available"
        iconUrl="/no-calls.svg"
      />
    );
  }

  if (meetings.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {meetings.map((meeting: Meeting) => (
          <div key={meeting.id} className="flex flex-col gap-3">
            <MeetingCard
              call={{ id: meeting.id, state: { custom: { description: meeting.description || meeting.title || "No Description" }, startsAt: new Date(meeting.scheduled_at) } } as any}
              type={type}
              icon="/upcoming.svg"
              title={meeting.description || meeting.title || "No Description"}
              date={new Date(meeting.scheduled_at).toLocaleString()}
              isPreviousMeeting={false}
              link={meeting.join_url || `${process.env.NEXT_PUBLIC_BASE_URL}/main/meeting/${meeting.id}`}
              buttonText="Start"
              handleClick={() => router.push(meeting.join_url || `/main/meeting/${meeting.id}`)}
            />
            {session?.user?.role === "teacher" && (
              <Button
                onClick={() => handleDeleteMeeting(meeting.id)}
                className="w-full font-extrabold text-sm text-white rounded-xl bg-red-600 py-2 px-4 hover:bg-red-800 hover:scale-105 transition ease-in-out duration-500 cursor-pointer">
                <Trash2 className="inline-block mr-2" size={16} />
                Delete Meeting
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Alert
      title="No calls available"
      iconUrl="/no-calls.svg"
    />
  );
};

export default CallList;