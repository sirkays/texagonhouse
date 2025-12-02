// "use client";

// import {useEffect, useState, useMemo} from "react";
// import Loading from "./Loading";
// import Alert from "./Alert";
// import {useRouter} from "next/navigation";
// import MeetingCard from "./MeetingCard";
// import {Button} from "@/components/ui/button";
// import {toast} from "sonner";
// import {useSession} from "next-auth/react";
// import {Trash2} from "lucide-react";
// import {Spinner} from "../ui/spinner";

// interface Meeting {
//   id: string;
//   scheduled_at: string;
//   title?: string;
//   description?: string;
//   join_url?: string;
//   recording_url?: string;
// }

// const CallList = ({type}: {type: "ended" | "upcoming" | "recordings"}) => {
//   const router = useRouter();
//   const {data: session} = useSession();
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const sessionToken = useMemo(
//     () => session?.user?.sessionToken || null,
//     [session?.user?.sessionToken]
//   );

//   useEffect(() => {
//     const fetchMeetings = async () => {
//       if (!session?.user) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const meetingResponse = await fetch("/api/teacher/live-session/", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
//             "X-Session-Token": sessionToken || "",
//           },
//         });

//         if (!meetingResponse.ok) {
//           const errorData = await meetingResponse.json().catch(() => ({}));
//           const errorMessage = errorData.error || "Failed to fetch meetings";
//           throw new Error(errorMessage);
//         }

//         const data = await meetingResponse.json();
//         console.log("[CallList] Fetched meetings:", data);
//         const currentDate = new Date();
//         currentDate.setHours(0, 0, 0, 0); // Start of today in local time (WAT)
//         const meetings: Meeting[] = (data.live_sessions || [])
//           .map((meeting: any) => ({
//             id: meeting.id,
//             scheduled_at: meeting.scheduled_at,
//             title: meeting.title,
//             description: meeting.description || meeting.title,
//             join_url: meeting.join_url,
//             recording_url: meeting.recording_url,
//           }))
//           .filter((meeting: Meeting) => {
//             const meetingDate = new Date(meeting.scheduled_at);
//             if (type === "upcoming") {
//               return meetingDate >= currentDate;
//             } else if (type === "ended") {
//               return meetingDate < currentDate;
//             } else {
//               return !!meeting.recording_url; // For recordings
//             }
//           });

//         console.log("[CallList] Filtered meetings:", meetings);
//         setMeetings(meetings);
//         setIsLoading(false);
//       } catch (err: any) {
//         toast.error(`Failed to fetch meetings: ${err.message}`, {
//           duration: 4004,
//           className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
//         });
//         console.error("[CallList] Error fetching meetings:", err);
//         setIsLoading(false);
//       }
//     };

//     fetchMeetings();
//   }, [sessionToken, type]);

//   const handleDeleteMeeting = async (meetingId: string) => {
//     try {
//       const response = await fetch(
//         `/api/teacher/live-session/${meetingId}/delete`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
//             "X-Session-Token": sessionToken || "",
//           },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         const errorMessage = errorData.error || "Failed to delete live session";
//         if (response.status === 401) {
//           throw new Error(`Unauthorized: Session expired`);
//         } else if (response.status === 403) {
//           throw new Error(`Unauthorized: ${errorMessage}`);
//         } else if (response.status === 404) {
//           throw new Error("Live session not found");
//         } else {
//           throw new Error(errorMessage);
//         }
//       }

//       toast.success("Meeting deleted successfully", {
//         duration: 3000,
//         className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
//       });
//       router.refresh();
//     } catch (err: any) {
//       toast.error(`Failed to delete meeting: ${err.message}`, {
//         duration: 4000,
//         className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
//       });
//       console.error("[CallList] Error deleting meeting:", err);
//     }
//   };

//   if (isLoading)
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-background">
//         <Spinner size="lg" className="text-black" />
//       </div>
//     );

//   if (meetings.length === 0) {
//     return (
//       <Alert
//         title={
//           type === "upcoming"
//             ? "No upcoming calls available"
//             : type === "ended"
//             ? "No previous calls available"
//             : "No recordings available"
//         }
//         iconUrl="/no-calls.svg"
//       />
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
//       {meetings.map((meeting: Meeting) => (
//         <div key={meeting.id} className="flex flex-col gap-3">
//           <MeetingCard
//             call={
//               {
//                 id: meeting.id,
//                 state: {
//                   custom: {
//                     description:
//                       meeting.description || meeting.title || "No Description",
//                   },
//                   startsAt: new Date(meeting.scheduled_at),
//                 },
//               } as any
//             }
//             type={type}
//             icon={type === "ended" ? "/ended.svg" : "/upcoming.svg"}
//             title={meeting.description || meeting.title || "No Description"}
//             date={new Date(meeting.scheduled_at).toLocaleString()}
//             isPreviousMeeting={type === "ended"}
//             link={
//               type === "ended" && meeting.recording_url
//                 ? meeting.recording_url
//                 : meeting.join_url ||
//                   `${process.env.NEXT_PUBLIC_BASE_URL}/main/meeting/${meeting.id}`
//             }
//             buttonText={type === "ended" ? "View" : "Start"}
//             handleClick={() => {
//               if (type === "ended" && meeting.recording_url) {
//                 window.location.href = meeting.recording_url;
//               } else {
//                 router.push(meeting.join_url || `/main/meeting/${meeting.id}`);
//               }
//             }}
//           />

//           {/* Delete Button */}
//           {session?.user?.role === "teacher" && type === "upcoming" && (
//             <Button
//               onClick={() => handleDeleteMeeting(meeting.id)}
//               className="w-full font-extrabold text-sm text-white rounded-xl bg-red-600 py-2 px-4 hover:bg-red-800 hover:scale-105 transition ease-in-out duration-500 cursor-pointer">
//               <Trash2 className="inline-block mr-2" size={16} />
//               Delete Meeting
//             </Button>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CallList;

"use client";

import {useEffect, useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Trash2, Calendar, Video, Clock} from "lucide-react";
import {toast} from "sonner";
import {Spinner} from "../ui/spinner";
import MeetingCard from "./MeetingCard";

interface Meeting {
  id: string;
  scheduled_at: string;
  title?: string;
  description?: string;
  join_url?: string;
  recording_url?: string;
}

const CallList = ({type}: {type: "ended" | "upcoming" | "recordings"}) => {
  const router = useRouter();
  const {data: session} = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

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
            Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
            "X-Session-Token": sessionToken || "",
          },
        });

        if (!meetingResponse.ok) {
          const errorData = await meetingResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || "Failed to fetch meetings";
          throw new Error(errorMessage);
        }

        const data = await meetingResponse.json();
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
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
            if (type === "upcoming") {
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
  }, [sessionToken, type]);

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/live-session/${meetingId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
            "X-Session-Token": sessionToken || "",
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
        className: "bg-green-50 text-green-700 rounded-lg py-3 px-4 shadow-sm",
      });
      router.refresh();
    } catch (err: any) {
      toast.error(`Failed to delete meeting: ${err.message}`, {
        duration: 4000,
        className: "bg-red-50 text-red-700 rounded-lg py-3 px-4 shadow-sm",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg p-6 shadow-sm">
        <img
          src={type === "ended" ? "/ended.svg" : "/no-calls.svg"}
          alt="No calls"
          className="w-20 h-20 mb-4 opacity-80"
        />
        <h2 className="text-xl font-semibold text-gray-700">
          {type === "upcoming"
            ? "No Upcoming Calls"
            : type === "ended"
            ? "No Previous Calls"
            : "No Recordings Available"}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {type === "upcoming"
            ? "Schedule a new meeting to get started!"
            : type === "ended"
            ? "No past meetings found."
            : "No recordings available at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 bg-gray-50">
      {meetings.map((meeting: Meeting) => (
        <div
          key={meeting.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-100">
          <div className="p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 rounded-bl-full opacity-50" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {type === "ended" ? (
                  <Video className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Calendar className="w-4 h-4 text-indigo-500" />
                )}
                <span className="text-xs font-medium text-gray-600 uppercase">
                  {type === "ended" ? "Ended" : "Upcoming"}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(meeting.scheduled_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Meeting TItle */}

            <h3 className="text-base font-semibold text-gray-800 truncate">
              {meeting.title || "Untitled Meeting"}
            </h3>

            {/* Meeting Description */}

            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {meeting.description ||
                meeting.title ||
                "No description available"}
            </p>

            {/* Action Buttions */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => {
                  if (type === "ended" && meeting.recording_url) {
                    window.location.href = meeting.recording_url;
                  } else {
                    router.push(
                      meeting.join_url || `/main/meeting/${meeting.id}`
                    );
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 ${
                  type === "ended"
                    ? "bg-blue-700 text-slate-100 hover:bg-blue-800"
                    : "bg-blue-700 text-slate-100 hover:bg-blue-800"
                }`}>
                {type === "ended" ? "View Recording" : "Start Meeting"}
              </button>

              <MeetingCard
                call={
                  {
                    id: meeting.id,
                    state: {
                      custom: {
                        description:
                          meeting.description ||
                          meeting.title ||
                          "No Description",
                      },
                      startsAt: new Date(meeting.scheduled_at),
                    },
                  } as any
                }
                type={type}
                icon={type === "ended" ? "/ended.svg" : "/upcoming.svg"}
                title={meeting.description || meeting.title || "No Description"}
                date={new Date(meeting.scheduled_at).toLocaleString()}
                isPreviousMeeting={type === "ended"}
                link={
                  type === "ended" && meeting.recording_url
                    ? meeting.recording_url
                    : meeting.join_url ||
                      `${process.env.NEXT_PUBLIC_BASE_URL}/main/meeting/${meeting.id}`
                }
                buttonText={type === "ended" ? "View" : "Start"}
                handleClick={() => {
                  if (type === "ended" && meeting.recording_url) {
                    window.location.href = meeting.recording_url;
                  } else {
                    router.push(
                      meeting.join_url || `/main/meeting/${meeting.id}`
                    );
                  }
                }}
              />

              {session?.user?.role === "teacher" && type === "upcoming" && (
                <button
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                  title="Delete Meeting">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CallList;
