import StreamProvider from "@/providers/StreamProvider";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";
import React, { Suspense } from "react";
import {redirect} from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

async function ProtectedContent({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  return <StreamProvider>{children}</StreamProvider>;
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="animate-fade-in">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen w-screen">
          <Spinner />
        </div>
      }>
        <ProtectedContent>{children}</ProtectedContent>
      </Suspense>
    </main>
  );
};

export default MainLayout;