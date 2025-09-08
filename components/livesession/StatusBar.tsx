"use client";

import Image from "next/image";
import DateAndTime from "@/components/livesession/DateAndTime";
import {useGetCalls} from "@/hooks/useGetCalls";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

const StatusBar = () => {
  const {upcomingCalls} = useGetCalls() || {upcomingCalls: []};
  const {data: session} = useSession();
  const router = useRouter();

  const nearestUpcomingCall = upcomingCalls
    ?.filter((call) => call?.state?.startsAt)
    .sort(
      (a, b) =>
        new Date(a.state.startsAt!).getTime() -
        new Date(b.state.startsAt!).getTime()
    )[0];

  const startsAt = nearestUpcomingCall?.state?.startsAt;
  const formattedDate = startsAt
    ? new Date(startsAt).toLocaleString()
    : "No upcoming meetings";

  const handleBackToDashboard = () => {
    if (session?.user?.role) {
      router.push(`/${session.user.role}`);
    } else {
      router.push("/"); // Fallback if role is not available
    }
  };

  if (formattedDate === "No upcoming meetings") {
    return (
      <section className="flex flex-col gap-5 text-black items-center md:items-start">
        <h2 className="bg-blue-100 max-w-[273px] rounded-2xl p-4 text-center text-base font-light">
          No Upcoming Meetings
        </h2>
        <DateAndTime />
        <Button
          onClick={handleBackToDashboard}
          className="w-full sm:w-auto font-extrabold text-sm sm:text-base text-white rounded-xl bg-blue-700 py-2 sm:py-3 px-4 sm:px-6 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
        >
          Back to Dashboard
        </Button>
        <Image
          src="/home-image.svg"
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
      <h2 className="bg-blue-100 max-w-[273px] rounded-2xl p-4 text-center text-base font-light">
        Upcoming Meeting at:
        <p className="text-lg font-semibold text-gray-800">{formattedDate}</p>
      </h2>
      <DateAndTime />
      <Button
        onClick={handleBackToDashboard}
        className="w-full sm:w-auto font-extrabold text-sm sm:text-base text-white rounded-xl bg-blue-700 py-2 sm:py-3 px-4 sm:px-6 hover:bg-blue-900 hover:scale-105 transition ease-in-out duration-500 cursor-pointer"
      >
        Back to Dashboard
      </Button>
      <Image
        src="/home-image.svg"
        width={400}
        height={400}
        alt="home image"
        className="max-md:hidden -ml-16"
      />
    </section>
  );
};

export default StatusBar;