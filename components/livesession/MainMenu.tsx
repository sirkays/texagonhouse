"use client";

import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import MenuItemCard from "./MenuItemCard";
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
import {useEffect, useState} from "react";
import {Input} from "../ui/input";
import DatePicker from "react-datepicker";
import Loading from "./Loading";
import {useStreamVideoClient} from "@stream-io/video-react-sdk";
import {toast} from "sonner";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

const MainMenu = () => {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [meetingState, setMeetingState] = useState<
    "Schedule" | "Instant" | undefined
  >(undefined);
  const client = useStreamVideoClient();

  const createMeeting = async () => {
    if (status !== "authenticated" || !session?.user)
      return router.push("/login");
    if (!client) return router.push("/");

    try {
      if (!values.dateTime) {
        toast("Please select a date and time", {
          duration: 3000,
          className: "bg-gray-300 rounded-3xl py-8 px-5 justify-center",
        });
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
        update_members: [{user_id: String(session.user.id)}],
      });

      if (meetingState === "Instant") {
        router.push(`/main/meeting/${call.id}`);
        toast("Setting up your meeting", {
          duration: 3000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
      }

      if (meetingState === "Schedule") {
        router.push("/main/home/upcoming");
        toast(`Your meeting is scheduled at ${values.dateTime}`, {
          duration: 5000,
          className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
        });
      }
    } catch (err: any) {
      toast(`Failed to create Meeting ${err.message}`, {
        duration: 3000,
        className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
      });
    }
  };

  const joinMeeting = () => {
    if (!values.link) {
      toast("Please enter a meeting link", {
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
    toast("Joining meeting...", {
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
    return <Loading />;

  const isTeacher = session.user.role === "teacher";

  return (
    <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <DialogContent className="bg-gray-200 w-[95%] sm:w-[90%] md:w-[600px] px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 text-gray-900 rounded-2xl sm:rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-black leading-relaxed text-center">
                Start an Instant Meeting 🤝
              </DialogTitle>
              <DialogDescription className="flex flex-col items-center gap-3 sm:gap-4 mt-4">
                <span className="text-xs sm:text-sm md:text-base">
                  Add a meeting description
                </span>
                <Textarea
                  className="inputs w-full p-2 sm:p-3 md:p-5"
                  rows={4}
                  onChange={(e) =>
                    setValues({...values, description: e.target.value})
                  }
                />
                <Button
                  className="mt-3 sm:mt-5 w-full sm:w-auto font-extrabold text-sm sm:text-base md:text-lg text-white rounded-xl bg-blue-700 py-2 sm:py-3 md:py-5 px-4 sm:px-6 md:px-10 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
                  onClick={() => setMeetingState("Instant")}>
                  Create Meeting
                </Button>
              </DialogDescription>
            </DialogHeader>
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
        <DialogContent className="bg-gray-200 w-[95%] sm:w-[90%] md:w-[600px] px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 text-gray-900 rounded-2xl sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-black text-center mb-3 sm:mb-4 md:mb-5">
              Type the Meeting link here
            </DialogTitle>
            <DialogDescription className="flex flex-col gap-3 sm:gap-4 items-center w-full">
              <Input
                type="text"
                placeholder="Meeting Link or Meeting ID"
                onChange={(e) => setValues({...values, link: e.target.value})}
                className="inputs w-full"
              />
              <Button
                className="mt-3 sm:mt-5 w-full sm:w-auto font-extrabold text-sm sm:text-base md:text-lg text-white rounded-xl bg-blue-700 py-2 sm:py-3 md:py-5 px-4 sm:px-6 md:px-10 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
                onClick={joinMeeting}>
                Join Meeting
              </Button>
            </DialogDescription>
          </DialogHeader>
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
          <DialogContent className="bg-gray-200 w-[95%] sm:w-[90%] md:w-[600px] px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 text-gray-900 rounded-2xl sm:rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-black text-center mb-3 sm:mb-4 md:mb-5">
                Schedule Meeting
              </DialogTitle>
              <DialogDescription className="flex flex-col gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm md:text-base">
                  Add a meeting description
                </span>
                <Textarea
                  className="inputs w-full p-2 sm:p-3 md:p-5"
                  rows={4}
                  onChange={(e) =>
                    setValues({...values, description: e.target.value})
                  }
                />
              </DialogDescription>
              <div className="flex w-full flex-col gap-2.5 mt-4">
                <label className="text-xs sm:text-sm md:text-base font-normal text-sky-2">
                  Select Date and Time
                </label>
                <DatePicker
                  preventOpenOnFocus
                  selected={values.dateTime}
                  onChange={(date) => setValues({...values, dateTime: date!})}
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="inputs w-full rounded p-2 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <Button
                className="mt-3 sm:mt-5 w-full sm:w-auto font-extrabold text-sm sm:text-base md:text-lg text-white rounded-xl bg-blue-700 py-2 sm:py-3 md:py-5 px-4 sm:px-6 md:px-10 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
                onClick={() => setMeetingState("Schedule")}>
                Submit
              </Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      {/* Recordings */}
      <MenuItemCard
        img="/recordings2.svg"
        title="Recordings"
        bgColor="bg-blue-600"
        hoverColor="hover:bg-blue-800"
        handleClick={() => router.push("/main/home/recordings")}
      />
    </section>
  );
};

export default MainMenu;
