// texagon_academy\texagonui\components\livesession\MainMenu.tsx
"use client";

import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
// import MenuItemCard from "./MenuItemCard";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {Textarea} from "../ui/textarea";
import {useEffect, useMemo, useState} from "react";
import {Input} from "../ui/input";
import DatePicker from "react-datepicker";
import Loading from "./Loading";
import {useStreamVideoClient} from "@stream-io/video-react-sdk";
import {createStreamCallServer} from "@/actions/stream.actions";
import {toast} from "sonner";
import DateAndTime from "./DateAndTime";
import Image from "next/image";
import {Spinner} from "../ui/spinner";
import {PlusCircle, Users, CalendarDays, Trash2} from "lucide-react";

interface Course {
  id: number | string;
  name: string;
  subject: string;
  classroom: string;
  description: string;
  isActive?: boolean;
}

interface Meeting {
  id: string;
  scheduled_at: string;
  title?: string;
  description?: string;
  join_url?: string;
}

interface MenuItemCardProps {
  title: string;
  Icon: any;
  color: string;
}

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
  courseId: null as number | null,
  title: "",
  duration: 60,
};

const MenuItemCard = ({title, Icon, color}: MenuItemCardProps) => {
  return (
    <div
      className="group flex flex-col items-center justify-center 
      rounded-2xl p-6 cursor-pointer transition-all duration-300
      bg-white border hover:shadow-lg hover:scale-105"
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}33`, // 20% opacity
      }}>
      <div className="p-4 rounded-xl mb-3 transition">
        <Icon size={28} style={{color}} />
      </div>

      <p
        className="text-sm sm:text-base font-semibold text-gray-800 transition"
        style={{
          color: "#1f2937",
        }}>
        {title}
      </p>
    </div>
  );
};

const MainMenu = () => {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [values, setValues] = useState(initialValues);
  const [meetingState, setMeetingState] = useState<
    "Schedule" | "Instant" | undefined
  >(undefined);
  const [courses, setCourses] = useState<Course[]>([]);
  const client = useStreamVideoClient();
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken],
  );
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isJoinMeetingOpen, setIsJoinMeetingOpen] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);

  // Fetch courses from the endpoint
  useEffect(() => {
    const fetchCourses = async () => {
      if (!session?.user?.sessionToken) {
        return;
      }

      try {
        const response = await fetch("/api/teacher/courses/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            sessionToken: session.user.sessionToken,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch courses");
        }

        const data = await response.json();

        // Handle case where data is an array directly
        const fetchedCourses = (
          Array.isArray(data) ? data : data.courses || []
        ).map((course: any) => ({
          ...course,
          id: Number(course.id), // Convert id to number
        }));

        setCourses(fetchedCourses);
      } catch (err: any) {
        toast.error(`Failed to fetch courses: ${err.message}`, {
          duration: 4000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
        console.error("[MainMenu] Error fetching courses:", err);
      }
    };

    if (session?.user) {
      fetchCourses();
    }
  }, [session?.user]);

  const createMeeting = async () => {
    if (status !== "authenticated" || !session?.user)
      return router.push("/login");

    const currentMeetingState = meetingState;

    try {
      if (!values.dateTime || !values.courseId || !values.title) {
        toast.error(
          "Please provide all required fields: date, course, and title",
          {
            duration: 3000,
            className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
          },
        );
        setIsCreatingMeeting(false);
        setMeetingState(undefined);
        return;
      }

      const id = crypto.randomUUID();
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "No Description";

      // 1. Create Stream call via server action (REST API - bypasses browser WebSocket initial connection failures)
      try {
        await createStreamCallServer(id, startsAt, description);
      } catch (srvErr) {
        console.warn("[MainMenu] Server call creation error:", srvErr);
      }

      // 2. Try frontend Stream client initialization if client exists
      if (client) {
        try {
          const call = client.call("default", id);
          if (call) {
            await call.getOrCreate({
              data: {
                starts_at: startsAt,
                custom: {
                  description,
                },
              },
            });
          }
        } catch (wsErr) {
          console.warn("[MainMenu] Frontend WS call creation non-fatal error:", wsErr);
        }
      }

      // API call to create live session
      const response = await fetch("/api/teacher/live-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: values.courseId,
          title: values.title,
          scheduled_at: startsAt,
          duration_minutes: values.duration,
          join_url: `main/meeting/${id}`,
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

      setIsNewMeetingOpen(false);
      setIsScheduleMeetingOpen(false);
      setMeetingState(undefined);
      setValues(initialValues);

      if (currentMeetingState === "Instant") {
        toast.success("Setting up your meeting", {
          duration: 3000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
        router.push(`/main/meeting/${id}`);
      }

      if (currentMeetingState === "Schedule") {
        toast.success(`Your meeting is scheduled`, {
          duration: 5000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
        router.push("/main/home/upcoming");
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      toast.error(`Failed to create meeting: ${errorMessage}`, {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[MainMenu] Error creating meeting:", err);
      setMeetingState(undefined);
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const joinMeeting = () => {
    if (!values.link) {
      toast.error("Please enter a meeting link", {
        duration: 3000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      setIsJoining(false);
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

    setIsJoinMeetingOpen(false);
    router.push(meetingPath);

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
            (meeting: Meeting) => new Date(meeting.scheduled_at) > currentDate,
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
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
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
      setIsDeleting(false);
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
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });

      setUpcomingMeetings((prev) =>
        prev.filter((meeting) => meeting.id !== nearestUpcomingMeeting.id),
      );
      router.refresh();
    } catch (err: any) {
      toast.error(`Failed to delete meeting: ${err.message}`, {
        duration: 4000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
      console.error("[StatusBar] Error deleting meeting:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!client || status !== "authenticated" || !session?.user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );

  const isTeacher = session.user.role === "teacher";

  return (
    <div>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
        {/* Next Meeting */}
        <div className="flex flex-col gap-3 items-center justify-center md:items-start menu-item-card">
          {isLoading ? (
            <p>Loading meetings...</p>
          ) : nearestUpcomingMeeting ? (
            <>
              <h2
                className="w-full max-w-[300px] sm:max-w-[273px] rounded-2xl p-3 sm:p-4 text-center text-sm sm:text-base font-light
                bg-[#f7b55]/15 border border-[#f7b55]/30 text-gray-800">
                Next Meeting: {nearestUpcomingMeeting.title} at {formattedDate}
              </h2>

              <div className="flex gap-2 sm:gap-3">
                {nearestUpcomingMeeting.join_url &&
                  (isTeacher ? (
                    <a
                      href="/main/home/upcoming"
                      className="text-[#f7b55] hover:text-[#e0a94d] text-sm sm:text-base font-medium">
                      View More
                    </a>
                  ) : (
                    <a
                      href="/main/home/upcoming"
                      className="text-[#f7b55] hover:text-[#e0a94d] text-sm sm:text-base font-medium">
                      Join Meeting
                    </a>
                  ))}

                <button
                  onClick={() => {
                    handleDeleteMeeting();
                  }}
                  disabled={isDeleting}
                  className="bg-transparent flex text-destructive items-center gap-2 py-0 text-sm sm:text-base">
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" className="text-destructive" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="text-[#f7b55]" /> Delete
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <p>No upcoming meetings</p>
          )}
        </div>

        {/* 1. Instant New Meeting */}
        {isTeacher && (
          <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
            <DialogTrigger asChild>
              <div>
                <MenuItemCard
                  title="New Meeting"
                  Icon={PlusCircle}
                  color="#EF7B55"
                />
              </div>
            </DialogTrigger>

            <DialogContent className="bg-white text-slate-900 w-[95vw] sm:w-full max-w-[520px] rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden border border-slate-100">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#EF7B55] to-[#f98a66] p-6 text-white shrink-0 relative">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-extrabold text-white text-left">
                        Start an Instant Meeting 🤝
                      </DialogTitle>
                      <DialogDescription className="text-orange-50/90 text-xs sm:text-sm text-left mt-0.5">
                        Fill in the session details to jump right in
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Meeting Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Python Advanced Q&A"
                    value={values.title}
                    onChange={(e) =>
                      setValues({ ...values, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/20 transition-all outline-none"
                  />
                </div>

                {/* Course */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={values.courseId || ""}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        courseId: Number(e.target.value),
                      })
                    }
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/20 transition-all outline-none"
                    required
                  >
                    <option value="" disabled>
                      Select a course
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.classroom})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Description
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Optional meeting goals or context..."
                    value={values.description}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/20 transition-all outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Duration (Minutes)
                  </label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={values.duration}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        duration: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <Button
                  className={`w-full bg-gradient-to-r from-[#EF7B55] to-[#f98a66] hover:from-[#e0663f] hover:to-[#EF7B55] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#EF7B55]/20 hover:shadow-[#EF7B55]/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${
                    isCreatingMeeting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    setIsCreatingMeeting(true);
                    setMeetingState("Instant");
                  }}
                  disabled={isCreatingMeeting}
                >
                  {isCreatingMeeting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span>Creating Meeting...</span>
                    </div>
                  ) : (
                    "Create & Join Instant Meeting"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 2. Join Meeting */}
        <Dialog open={isJoinMeetingOpen} onOpenChange={setIsJoinMeetingOpen}>
          <DialogTrigger asChild>
            <div>
              <MenuItemCard title="Join Meeting" Icon={Users} color="#55C1EF" />
            </div>
          </DialogTrigger>

          <DialogContent className="bg-white text-slate-900 w-[95vw] sm:w-full max-w-[480px] rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden border border-slate-100">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white shrink-0">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-extrabold text-white text-left">
                      Join a Meeting 🚀
                    </DialogTitle>
                    <DialogDescription className="text-sky-50/90 text-xs sm:text-sm text-left mt-0.5">
                      Enter the meeting link or ID provided by your host
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Meeting Link or ID
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 8c755281-dc2d-42bd-9354-238f8669386d"
                  value={values.link}
                  onChange={(e) => setValues({ ...values, link: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <Button
                className={`w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${
                  isJoining ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  setIsJoining(true);
                  joinMeeting();
                }}
                disabled={isJoining}
              >
                {isJoining ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span>Joining Meeting...</span>
                  </div>
                ) : (
                  "Join Meeting Now"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 3. Schedule Meeting */}
        {isTeacher && (
          <Dialog open={isScheduleMeetingOpen} onOpenChange={setIsScheduleMeetingOpen}>
            <DialogTrigger asChild>
              <div>
                <MenuItemCard
                  title="Schedule Meeting"
                  Icon={CalendarDays}
                  color="#4F46E5"
                />
              </div>
            </DialogTrigger>

            <DialogContent className="bg-white text-slate-900 w-[95vw] sm:w-full max-w-[520px] rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden border border-slate-100">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shrink-0">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-extrabold text-white text-left">
                        Schedule a Future Session 📅
                      </DialogTitle>
                      <DialogDescription className="text-indigo-50/90 text-xs sm:text-sm text-left mt-0.5">
                        Set date and details for an upcoming live class
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Meeting Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Weekly Live Revision"
                    value={values.title}
                    onChange={(e) =>
                      setValues({ ...values, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>

                {/* Course */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={values.courseId || ""}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        courseId: Number(e.target.value),
                      })
                    }
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    required
                  >
                    <option value="" disabled>
                      Select a course
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.classroom})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Description
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Add agenda or details..."
                    value={values.description}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>

                {/* Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Select Date & Time <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    preventOpenOnFocus
                    selected={values.dateTime}
                    onChange={(date) => setValues({ ...values, dateTime: date! })}
                    showTimeSelect
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Duration (Minutes)
                  </label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={values.duration}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        duration: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <Button
                  className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${
                    isCreatingMeeting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    setIsCreatingMeeting(true);
                    setMeetingState("Schedule");
                  }}
                  disabled={isCreatingMeeting}
                >
                  {isCreatingMeeting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span>Scheduling Meeting...</span>
                    </div>
                  ) : (
                    "Schedule Live Session"
                  )}
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
