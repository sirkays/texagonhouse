import StreamProvider from "@/providers/StreamProvider";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";
import React from "react";
import {redirect} from "next/navigation";

const MainLayout = async ({children}: {children: React.ReactNode}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  return (
    <main className="animate-fade-in">
      <StreamProvider>{children}</StreamProvider>
    </main>
  );
};

export default MainLayout;
