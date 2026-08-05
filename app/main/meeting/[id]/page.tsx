"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

/**
 * Legacy redirect: /main/meeting/[id] → /meeting/[id]
 * Meeting pages now live outside /main to allow guest (unauthenticated) access.
 */
const MeetingRedirectPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/meeting/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
      <Spinner size="lg" className="text-[#EF7B55]" />
    </div>
  );
};

export default MeetingRedirectPage;
