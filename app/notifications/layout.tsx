

// app/notifications/layout.tsx
"use client";

import {ReactNode} from "react";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function NotificationsLayout({children}: {children: ReactNode}) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 py-4 bg-white border-b">
        <div className="flex items-center gap-3 px-3 xs:px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-transparent focus:bg-transparent active:bg-transparent">
            <ArrowLeft className="h-4 w-4 xs:h-5 xs:w-5 text-slate-800" />
          </Button>
          <h1 className="text-base xs:text-lg font-semibold text-slate-800">
            Notifications
          </h1>
        </div>
      </header>
      <main className="flex-1 p-3 xs:p-4 sm:p-6">{children}</main>
    </div>
  );
}
