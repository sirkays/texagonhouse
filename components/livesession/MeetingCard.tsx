"use client"; // Ensures this component runs on the client-side in Next.js

import Image from "next/image";

import {cn} from "@/lib/utils"; // Utility function for conditional classNames
import {Button} from "../ui/button"; // UI Button component
import type {Call} from "@stream-io/video-react-sdk"; // Import Call type from Stream Video SDK
import {toast} from "sonner";
import Members from "./Members";

// Define the props expected by the MeetingCard component
interface MeetingCardProps {
  title: string; // Meeting title
  date: string; // Meeting date
  icon: string; // Icon representing the meeting
  isPreviousMeeting?: boolean; // Flag to check if it's a past meeting
  buttonIcon1?: string; // Optional button icon
  buttonText?: string; // Optional button text
  call: Call; // Call object from Stream SDK
  type: string; // Meeting type (e.g., 'ended' or 'active')
  handleClick: () => void; // Function triggered on button click
  link: string; // Meeting link to copy
}

// MeetingCard component
const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  type,
  call,
  buttonText,
}: MeetingCardProps) => {
  return (
    // Main container for the card with styling
    <section className="">
      {/* Section for meeting members and action buttons */}
      <article className={cn("", {})}>
        <div>
          {/* Show meeting members only if the meeting has ended */}
          {type === "ended" && <Members call={call} />}
        </div>

        {/* Show action buttons only if it's an active meeting */}
        {!isPreviousMeeting && (
          <div className="">
            {/* Button to copy meeting link */}
            <Button
              className="bg-transparent hover:bg-transparent text-slate-600 hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(link); // Copy link to clipboard
                toast("Link Copied", {
                  duration: 3000,
                  className:
                    "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
                });
              }}>
              {/* Copy icon */}
              <Image src="/copy.svg" alt="copy" width={20} height={20} />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
