import NavBar from "@/components/livesession/Navbar";
import React from "react";
import {Spinner} from "@/components/ui/spinner";

const HomeLayout = async ({
  children,
  loading = false,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) => {
  return (
    <main className="relative">
      <NavBar />
      <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 sm:pt-28 max-md:pb-14 sm:px-14">
        <div className="w-full">{children}</div>
      </section>
    </main>
  );
};

export default HomeLayout;
