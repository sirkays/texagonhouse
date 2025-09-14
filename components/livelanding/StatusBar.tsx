"use client";

import Image from "next/image";
import DateAndTime from "@/components/livesession/DateAndTime";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Trash2} from "lucide-react";
import {useEffect, useState, useMemo} from "react";

interface Meeting {
  id: string;
  scheduled_at: string;
  title?: string;
  description?: string;
  join_url?: string;
}

const StatusBar = () => {
  const {data: session} = useSession();
  const router = useRouter();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  // Fetch meetings directly
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!session?.user) return;

      try {
        const meetingResponse = await fetch("/api/teacher/live-session/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!meetingResponse.ok) {
          const errorData = await meetingResponse.json().catch(() => ({}));
          const errorMessage =
            errorData.error || "Failed to fetch upcoming meetings";
          throw new Error(errorMessage);
        }

        const data = await meetingResponse.json();
        const currentDate = new Date();
        const meetings: Meeting[] = (data.live_sessions || [])
          .map((meeting: any) => ({
            id: meeting.id,
            scheduled_at: meeting.scheduled_at,
            title: meeting.title,
            description: meeting.description || meeting.title,
            join_url: meeting.join_url,
          }))
          .filter(
            (meeting: Meeting) => new Date(meeting.scheduled_at) > currentDate
          );

        setUpcomingMeetings(meetings);
        setIsLoading(false);
      } catch (err: any) {
        toast.error(`Failed to fetch meetings: ${err.message}`, {
          duration: 4000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
        console.error("[StatusBar] Error fetching meetings:", err);
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchMeetings();
    }
  }, [sessionToken]);

  const nearestUpcomingMeeting = upcomingMeetings
    ?.filter((meeting) => meeting?.scheduled_at)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )[0];

  const formattedDate = nearestUpcomingMeeting?.scheduled_at
    ? new Date(nearestUpcomingMeeting.scheduled_at).toLocaleString()
    : null;

  const handleBackToDashboard = () => {
    if (session?.user?.role) {
      router.push(`/${session.user.role}`);
    } else {
      router.push("/"); // Fallback if role is not available
    }
  };

  const handleDeleteMeeting = async () => {
    if (!nearestUpcomingMeeting?.id) {
      toast.error("No meeting selected for deletion", {
        duration: 3000,
        className: "bg-gray-300 rounded-3xl py-8 px-5 justify-center",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/live-session/${nearestUpcomingMeeting.id}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      setUpcomingMeetings((prev) =>
        prev.filter((meeting) => meeting.id !== nearestUpcomingMeeting.id)
      ); // Update state to reflect deletion
    } catch (err: any) {
      toast.error(`Failed to delete meeting: ${err.message}`, {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[StatusBar] Error deleting meeting:", err);
    }
  };

  if (isLoading) {
    return (
      <section className="flex flex-col gap-5 text-black items-center md:items-start">
        <h2 className="bg-blue-100 max-w-[273px] rounded-2xl p-4 text-center text-base font-light">
          Loading meetings...
        </h2>
        <DateAndTime />
        <Image
          src="/liveBanner.png"
          width={400}
          height={400}
          alt="home image"
          className="max-md:hidden -ml-16"
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 text-black items-center md:items-start">
      {nearestUpcomingMeeting ? (
        <div className="flex flex-col gap-3 items-center md:items-start">
          <h2 className="bg-blue-100 max-w-[273px] rounded-2xl p-4 text-center text-base font-light">
            Next Meeting: {nearestUpcomingMeeting.title} at {formattedDate}
          </h2>
          {nearestUpcomingMeeting.join_url && (
            <Button
              onClick={() =>
                window.open(nearestUpcomingMeeting.join_url, "_blank")
              }
              className="bg-blue-500 text-white hover:bg-blue-600">
              Join Meeting
            </Button>
          )}
          <Button
            onClick={handleDeleteMeeting}
            variant="destructive"
            className="flex items-center gap-2">
            <Trash2 size={16} />
            Delete Meeting
          </Button>
        </div>
      ) : (
        <h2 className="bg-blue-100 max-w-[273px] rounded-2xl p-4 text-center text-base font-light">
          No Upcoming Meetings
        </h2>
      )}
      <DateAndTime />
      <Image
        src="/liveBanner.png"
        width={400}
        height={400}
        alt="home image"
        className="max-md:hidden -ml-16"
      />
    </section>
  );
};

export default StatusBar;
