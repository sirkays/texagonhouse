import StreamProvider from "@/providers/StreamProvider";
import React from "react";

const MainLayout = async ({children}: {children: React.ReactNode}) => {
  return (
    <main className="animate-fade-in">
      <StreamProvider>{children}</StreamProvider>
    </main>
  );
};

export default MainLayout;
