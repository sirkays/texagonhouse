"use client";

import MainMenu from "@/components/livesession/MainMenu";
import StatusBar from "@/components/livesession/StatusBar";
import {Button} from "@/components/ui/button";

import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {useEffect, useState, useMemo} from "react";
import {ArrowLeft} from "lucide-react";

interface Meeting {
  id: string;
  scheduled_at: string;
  title?: string;
  description?: string;
  join_url?: string;
}

const HomePage = () => {
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
  const handleBackToDashboard = () => {
    if (session?.user?.role) {
      router.push(`/${session.user.role}`);
    } else {
      router.push("/"); // Fallback if role is not available
    }
  };
  return (
    <>
      <Button
        onClick={handleBackToDashboard}
        className="w-full sm:w-auto px-4 py-2 flex items-center gap-2 font-semibold text-sm sm:text-base text-slate-700 bg-transparent hover:bg-slate-50 hover:text-slate-900 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-transform duration-300 ease-in-out cursor-pointer"
        aria-label="Return to dashboard">
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        Back to Dashboard
      </Button>
      <div className="flex flex-col-reverse sm:flex-col gap-32 pt-10 pb-10 sm:pb-0 sm:pt-0 sm:pl-10 items-center justify-evenly max-md:gap-10 md:flex-row animate-fade-in">
        <MainMenu />
        <StatusBar />
      </div>
    </>
  );
};

export default HomePage;
