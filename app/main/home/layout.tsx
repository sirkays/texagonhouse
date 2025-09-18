import NavBar from "@/components/livesession/Navbar";
import React from "react";

const HomeLayout = async ({ children, loading = false }: { children: React.ReactNode; loading?: boolean }) => {
  return (
    <main className="relative">
      <NavBar />
      <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 sm:pt-28 max-md:pb-14 sm:px-14">
        <div className="w-full">{children}</div>
      </section>
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <Spinner className="w-10 h-10 xs:w-12 xs:h-12 text-[#EF7B55] self-center" />
        </div>
      )}
    </main>
  );
};

export default HomeLayout;