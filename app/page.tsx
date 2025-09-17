"use client";

import {useEffect, useState} from "react";
import Head from "next/head";
import Image from "next/image";
import {LogIn} from "lucide-react";

export default function Home() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isBouncing, setIsBouncing] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const splashTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000);

    // Stop button bounce after 5 seconds
    const bounceTimer = setTimeout(() => {
      setIsBouncing(false);
    }, 5000);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(splashTimer);
      clearTimeout(bounceTimer);
    };
  }, []);

  return (
    <>
      <Head>
        <title>TECHXAGON E-Learning Platform</title>
        <meta
          name="description"
          content="Join TECHXAGON's modern e-learning platform with a sleek, glassy UI and engaging animations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="min-h-screen bg-[#000000] flex flex-col items-center justify-center overflow-hidden relative"
        style={{
          backgroundImage: "url(/banner_splash.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        {/* Glassy Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/60 z-10"></div>

        {/* Splash Screen */}
        {isSplashVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#11111c] backdrop-blur-lg z-50 transition-opacity duration-500">
            <Image
              src="/T2.png"
              alt="TECHXAGON Logo"
              width={846}
              height={336}
              priority
              className="animate-[easeIn_2s_ease-in-out_forwards] max-w-[90%] h-auto z-50"
            />
          </div>
        )}

        {/* Hero Section */}
        <section
          className={`w-full h-screen flex items-center justify-center transition-opacity duration-1000 relative z-20 ${
            isSplashVisible ? "opacity-0" : "opacity-100"
          }`}>
          <div className="w-full max-w-4xl mx-4 p-6 sm:p-10 backdrop-blur-xl bg-[#49555]/10 rounded-2xl shadow-2xl">
            <Image
              src="/T2.png"
              alt="TECHXAGON Logo"
              width={846}
              height={336}
              priority
              className="mx-auto mb-8 sm:mb-10 transition-transform duration-500 hover:scale-105 max-w-[80%] h-auto"
            />
            <div className="flex items-center justify-center gap-4">
              <a
                href="/login"
                className={`inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-white bg-[#1d4155]/70 backdrop-blur-md rounded-xl hover:bg-[#1d4164]/90 transition-all duration-300 shadow-lg ${
                  isBouncing ? "animate-[bounce_1s_ease-in-out_infinite]" : ""
                }`}
                aria-label="Sign in to TECHXAGON">
                Sign In
                <LogIn className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3" />
              </a>
            </div>
            <p className="mt-4 sm:mt-6 text-center text-white/80 text-sm sm:text-base font-medium">
              Welcome to the TECHXAGON community - unlock a world of learning
            </p>
          </div>
        </section>

        {/* Custom Tailwind Animations */}
        <style jsx global>{`
          @keyframes easeIn {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }
          .animate {
            will-change: transform, opacity;
          }
        `}</style>
      </div>
    </>
  );
}
