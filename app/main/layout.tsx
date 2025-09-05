import StreamProvider from "@/providers/StreamProvider";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";
import React from "react";
import {redirect} from "next/navigation";

const MainLayout = async ({children}: {children: React.ReactNode}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="flex flex-col items-center p-5 gap-10 animate-fade-in">
        <section className="flex flex-col items-center">
          <Image src="/logo.svg" width={100} height={100} alt="Logo" />
          <h1 className="text-lg font-extrabold text-sky-1 lg:text-2xl">
            Connect, Communicate, Collaborate in Real-Time
          </h1>
        </section>
        <div className="w-full max-w-[90vw] sm:max-w-md lg:max-w-lg rounded-lg border border-border bg-background shadow-md p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Image
              src="/logo.svg"
              width={24}
              height={24}
              alt="EduPlatform Logo"
            />
            <h1 className="font-semibold text-base sm:text-lg lg:text-xl">
              EduPlatform
            </h1>
            <h2 className="text-xs sm:text-sm lg:text-base text-muted-foreground">
              Sign in to your account
            </h2>
          </div>
          <form
            action="/api/auth/signin"
            method="POST"
            className="space-y-4 sm:space-y-5">
            <input type="hidden" name="callbackUrl" value="/" />
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs sm:text-sm lg:text-base">
                Email
              </label>
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-8 sm:pl-9 lg:pl-10 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs sm:text-sm lg:text-base">
                Password
              </label>
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 2-4 2-4 2 .896 2 2zM16 20H8a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2z"></path>
                </svg>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-8 sm:pl-9 lg:pl-10 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full text-xs sm:text-sm lg:text-base bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 lg:h-11 rounded-md px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="animate-fade-in">
      <StreamProvider>{children}</StreamProvider>
    </main>
  );
};

export default MainLayout;
