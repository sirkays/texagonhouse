"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MenuItemCard from "./MenuItemCard";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import DatePicker from "react-datepicker";
import Loading from "./Loading";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import DateAndTime from "./DateAndTime";
import Image from "next/image";
import { Spinner } from "../ui/spinner";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
  courseId: "",
  courseName: "",
  title: "",
  duration: 60,
};

interface Meeting {
  id: string;
  scheduled_at: string;
  title?: string;
  description?: string;
  join_url?: string;
}

const MainMenu = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [values, setValues] = useState(initialValues);
  const [meetingState, setMeetingState] = useState<
    "Schedule" | "Instant" | undefined
  >(undefined);
  const client = useStreamVideoClient();
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const createMeeting = async () => {
    if (status !== "authenticated" || !session?.user)
      return router.push("/login");
    if (!client) return router.push("/");

    try {
      if (
        !values.dateTime ||
        !values.courseId ||
        !values.title ||
        !values.courseName
      ) {
        toast.error(
          "Please provide all required fields: date, course ID, course name, and title",
          {
            duration: 3000,
            className: "bg-gray-300 rounded-3xl py-8 px-5 justify-center",
          }
        );
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "No Description";
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      await call.updateCallMembers({
        update_members: [{ user_id: String(session.user.id) }],
      });

      // API call to create live session
      const response = await fetch("/api/teacher/live-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: parseInt(values.courseId),
          title: values.title,
          scheduled_at: startsAt,
          duration_minutes: values.duration,
          join_url: `https://texagon.epichouse.online/main/meeting/${call.id}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.detail || "Failed to create live session";
        if (response.status === 403) {
          throw new Error(`Unauthorized: ${errorMessage}`);
        } else if (response.status === 400) {
          throw new Error(`Invalid input: ${errorMessage}`);
        } else if (response.status === 404) {
          throw new Error("Live session endpoint not found");
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      console.log("[MainMenu] Live session created:", data);

      if (meetingState === "Instant") {
        router.push(`/main/meeting/${call.id}`);
        toast.success("Setting up your meeting", {
          duration: 3000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
      }

      if (meetingState === "Schedule") {
        router.push("/main/home/upcoming");
        toast.success(`Your meeting is scheduled at ${values.dateTime}`, {
          duration: 5000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
      }

      // Reset meeting state to allow subsequent creations
      setMeetingState(undefined);
      setValues(initialValues); // Reset form
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      toast.error(`Failed to create meeting: ${errorMessage}`, {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[MainMenu] Error creating meeting:", err);
      setMeetingState(undefined); // Reset even on error
    }
  };

  const joinMeeting = () => {
    if (!values.link) {
      toast.error("Please enter a meeting link", {
        duration: 3000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      return;
    }

    let meetingPath = values.link;
    if (values.link.includes("/meeting/")) {
      meetingPath = values.link;
    } else if (values.link.includes("/main/meeting/")) {
      meetingPath = values.link;
    } else {
      meetingPath = `/main/meeting/${values.link}`;
    }

    router.push(meetingPath);
    toast.success("Joining meeting...", {
      duration: 3000,
      className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
    });
  };

  useEffect(() => {
    if (meetingState) {
      createMeeting();
    }
  }, [meetingState]);

  if (!client || status !== "authenticated" || !session?.user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );

  const isTeacher = session.user.role === "teacher";

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
      );
      // Update state to reflect deletion
      router.refresh(); // Refresh to update the UI
    } catch (err: any) {
      toast.error(`Failed to delete meeting: ${err.message}`, {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[StatusBar] Error deleting meeting:", err);
    }
  };

  return (
    <div>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 items-center justify-center md:items-start menu-item-card">
          {isLoading ? (
            <p>Loading meetings...</p>
          ) : nearestUpcomingMeeting ? (
            <>
              <h2 className="bg-blue-100 w-full max-w-[300px] sm:max-w-[273px] rounded-2xl p-3 sm:p-4 text-center text-sm sm:text-base font-light">
                Next Meeting: {nearestUpcomingMeeting.title} at {formattedDate}
              </h2>
              <div className="flex gap-2 sm:gap-3">
                {nearestUpcomingMeeting.join_url &&
                  (isTeacher === isTeacher ? (
                    <a
                      href="/main/home/upcoming"
                      className="text-blue-700 text-sm sm:text-base"
                    >
                      View More
                    </a>
                  ) : (
                    <a
                      href="/main/home/upcoming"
                      className="text-blue-700 text-sm sm:text-base"
                    >
                      Join Meeting
                    </a>
                  ))}
                <button
                  onClick={handleDeleteMeeting}
                  className="bg-transparent flex text-destructive items-center gap-2 py-0 text-sm sm:text-base"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </>
          ) : (
            <p>No upcoming meetings</p>
          )}
        </div>

        {/* New Meeting */}
        {isTeacher && (
          <Dialog>
            <DialogTrigger>
              <MenuItemCard
                img="/new-meeting.svg"
                title="New Meeting"
                bgColor="bg-orange-500"
                hoverColor="hover:bg-orange-800"
              />
            </DialogTrigger>
            <DialogContent className="bg-gray-200 w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 text-gray-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl font-black leading-relaxed text-center">
                  Start an Instant Meeting 🤝
                </DialogTitle>
                <DialogDescription className="text-center text-xs sm:text-sm">
                  Fill in the details to start an instant meeting
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 sm:gap-4 mt-4">
                <span className="text-xs sm:text-sm">Meeting Title</span>
                <Input
                  type="text"
                  placeholder="Enter meeting title"
                  value={values.title}
                  onChange={(e) =>
                    setValues({ ...values, title: e.target.value })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <span className="text-xs sm:text-sm">Course ID</span>
                <Input
                  type="text"
                  placeholder="Enter course ID"
                  value={values.courseId}
                  onChange={(e) =>
                    setValues({ ...values, courseId: e.target.value })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <span className="text-xs sm:text-sm">Course Name</span>
                <Input
                  type="text"
                  placeholder="Enter course name"
                  value={values.courseName}
                  onChange={(e) =>
                    setValues({ ...values, courseName: e.target.value })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <span className="text-xs sm:text-sm">
                  Add a meeting description
                </span>
                <Textarea
                  className="inputs w-full p-2 sm:p-3 text-sm sm:text-base"
                  rows={4}
                  value={values.description}
                  onChange={(e) =>
                    setValues({ ...values, description: e.target.value })
                  }
                />
                <span className="text-xs sm:text-sm">Duration (minutes)</span>
                <Input
                  type="number"
                  placeholder="Enter duration in minutes"
                  value={values.duration}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <Button
                  className="mt-3 sm:mt-5 w-full font-extrabold text-sm sm:text-base text-white rounded-xl bg-blue-700 py-2 sm:py-3 px-4 sm:px-6 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
                  onClick={() => setMeetingState("Instant")}
                >
                  Create Meeting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Join Meeting */}
        <Dialog>
          <DialogTrigger>
            <MenuItemCard
              img="/join-meeting.svg"
              title="Join Meeting"
              bgColor="bg-blue-600"
              hoverColor="hover:bg-blue-800"
            />
          </DialogTrigger>
          <DialogContent className="bg-gray-200 w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 text-gray-900 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl font-black text-center mb-3 sm:mb-4">
                Type the Meeting link here
              </DialogTitle>
              <DialogDescription className="text-center text-xs sm:text-sm">
                Enter the meeting link or ID to join
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 sm:gap-4">
              <Input
                type="text"
                placeholder="Meeting Link or Meeting ID"
                value={values.link}
                onChange={(e) => setValues({ ...values, link: e.target.value })}
                className="inputs w-full text-sm sm:text-base"
              />
              <Button
                className="mt-3 sm:mt-5 w-full font-extrabold text-sm sm:text-base text-white rounded-xl bg-blue-700 py-2 sm:py-3 px-4 sm:px-6 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
                onClick={joinMeeting}
              >
                Join Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule */}
        {isTeacher && (
          <Dialog>
            <DialogTrigger>
              <MenuItemCard
                img="/calendar.svg"
                title="Schedule"
                bgColor="bg-blue-600"
                hoverColor="hover:bg-blue-800"
              />
            </DialogTrigger>
            <DialogContent className="bg-gray-200 w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 text-gray-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl font-black text-center mb-3 sm:mb-4">
                  Schedule Meeting
                </DialogTitle>
                <DialogDescription className="text-center text-xs sm:text-sm">
                  Fill in the details to schedule a meeting
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm">Meeting Title</span>
                <Input
                  type="text"
                  placeholder="Enter meeting title"
                  value={values.title}
                  onChange={(e) =>
                    setValues({ ...values, title: e.target.value })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <span className="text-xs sm:text-sm">Course ID</span>
                <Input
                  type="text"
                  placeholder="Enter course ID"
                  value={values.courseId}
                  onChange={(e) =>
                    setValues({ ...values, courseId: e.target.value })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <span className="text-xs sm:text-sm">Course Name</span>
                <Input
                  type="text"
                  placeholder="Enter course name"
                  value={values.courseName}
                  onChange={(e) =>
                    setValues({ ...values, courseName: e.target.value })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <span className="text-xs sm:text-sm">
                  Add a meeting description
                </span>
                <Textarea
                  className="inputs w-full p-2 sm:p-3 text-sm sm:text-base"
                  rows={4}
                  value={values.description}
                  onChange={(e) =>
                    setValues({ ...values, description: e.target.value })
                  }
                />
                <span className="text-xs sm:text-sm">Duration (minutes)</span>
                <Input
                  type="number"
                  placeholder="Enter duration in minutes"
                  value={values.duration}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                  className="inputs w-full text-sm sm:text-base"
                />
                <span className="text-xs sm:text-sm">Select Date and Time</span>
                <DatePicker
                  preventOpenOnFocus
                  selected={values.dateTime}
                  onChange={(date) => setValues({ ...values, dateTime: date! })}
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="inputs w-full rounded p-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <Button
                  className="mt-3 sm:mt-5 w-full font-extrabold text-sm sm:text-base text-white rounded-xl bg-blue-700 py-2 sm:py-3 px-4 sm:px-6 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
                  onClick={() => setMeetingState("Schedule")}
                >
                  Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </section>
    </div>
  );
};

export default MainMenu;
