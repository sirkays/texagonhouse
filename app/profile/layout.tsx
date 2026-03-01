// app/profile/layout.tsx
"use client";

import {ReactNode} from "react";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function ProfileLayout({children}: {children: ReactNode}) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 py-2 sm:py-4 backdrop-blur-xl bg-[#ef7b55]/30 supports-[backdrop-filter]:bg-[#ef7b55]/20 border-b border-[#ef7b55]/30 shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0 hover:bg-white/40 focus:bg-white/40 active:bg-white/50 transition backdrop-blur-md"
            aria-label="Go back">
            <ArrowLeft className="h-5 w-5 text-slate-800" />
          </Button>

          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Profile Settings
          </h1>
        </div>
      </header>
      <main className="flex-1 p-3 xs:p-4 sm:p-6">{children}</main>
    </div>
  );
}
