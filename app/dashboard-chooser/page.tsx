"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, BookOpen } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { useBrand } from "@/hooks/use-brand";

export default function DashboardChooserPage() {
  const brand = useBrand();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100">
        <Spinner size="md" className="text-[#EF7B55]" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name || session.user.email || "User";

  const handleNavigate = (path: string) => {
    setNavigating(true);
    window.location.href = path;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 123, 85, 0.15);
          }
          50% {
            box-shadow: 0 0 40px rgba(239, 123, 85, 0.3);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .card-hover-admin:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 60px -12px rgba(239, 123, 85, 0.35),
                      0 0 0 1px rgba(239, 123, 85, 0.15);
        }
        .card-hover-teacher:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 60px -12px rgba(59, 130, 246, 0.35),
                      0 0 0 1px rgba(59, 130, 246, 0.15);
        }
        .gradient-text {
          background: linear-gradient(135deg, #EF7B55, #f59e0b, #EF7B55);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#EF7B55]/10 to-amber-200/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200/10 to-indigo-200/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-[#EF7B55]/5 to-transparent rounded-full blur-2xl" />
        </div>

        {/* Header */}
        <div
          className="text-center mb-12 relative z-10"
          style={{ animation: "slideInDown 0.6s ease-out forwards" }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src={brand.logo}
              alt={brand.logoAlt}
              width={brand.id === "nimet" ? 120 : 52}
              height={52}
              className={`object-contain ${brand.id === "techxagon" ? "rounded-xl shadow-md" : ""}`}
            />
            <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl whitespace-nowrap tracking-tight">
              {brand.fullName.toUpperCase()}
            </h6>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Welcome back,{" "}
            <span className="gradient-text capitalize">{userName}</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            You have access to multiple dashboards. Choose where you'd like to go.
          </p>
        </div>

        {navigating ? (
          <div className="flex flex-col items-center gap-4 relative z-10">
            <Spinner size="md" className="text-[#EF7B55]" />
            <p className="text-gray-500 text-sm">Redirecting...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-2xl relative z-10">
            {/* Admin Dashboard Card */}
            <button
              onClick={() => handleNavigate("/admin")}
              onMouseEnter={() => setHoveredCard("admin")}
              onMouseLeave={() => setHoveredCard(null)}
              className="card-hover-admin group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 sm:p-10 text-left transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/40 focus:ring-offset-2"
              style={{
                animation: "fadeInUp 0.5s ease-out 0.2s both",
              }}
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EF7B55] to-amber-400 rounded-t-2xl opacity-70 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col items-center text-center gap-5">
                <div
                  className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${
                      hoveredCard === "admin"
                        ? "bg-gradient-to-br from-[#EF7B55] to-amber-500 shadow-lg shadow-[#EF7B55]/30"
                        : "bg-gradient-to-br from-[#EF7B55]/10 to-amber-50"
                    }
                  `}
                >
                  <ShieldCheck
                    className={`w-10 h-10 transition-colors duration-300 ${
                      hoveredCard === "admin"
                        ? "text-white"
                        : "text-[#EF7B55]"
                    }`}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#EF7B55] transition-colors">
                    Admin Dashboard
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Manage students, teachers, classrooms, billing, and organization settings.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[#EF7B55] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  Go to Admin
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Teacher Dashboard Card */}
            <button
              onClick={() => handleNavigate("/teacher")}
              onMouseEnter={() => setHoveredCard("teacher")}
              onMouseLeave={() => setHoveredCard(null)}
              className="card-hover-teacher group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 sm:p-10 text-left transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:ring-offset-2"
              style={{
                animation: "fadeInUp 0.5s ease-out 0.4s both",
              }}
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-t-2xl opacity-70 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col items-center text-center gap-5">
                <div
                  className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${
                      hoveredCard === "teacher"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30"
                        : "bg-gradient-to-br from-blue-500/10 to-indigo-50"
                    }
                  `}
                >
                  <BookOpen
                    className={`w-10 h-10 transition-colors duration-300 ${
                      hoveredCard === "teacher"
                        ? "text-white"
                        : "text-blue-500"
                    }`}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors">
                    Instructor Dashboard
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Manage courses, upload content, grade assignments, and track student progress.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-blue-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  Go to Instructor
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Footer hint */}
        <p
          className="text-gray-400 text-xs mt-10 relative z-10"
          style={{ animation: "fadeInUp 0.5s ease-out 0.7s both" }}
        >
          You can switch dashboards anytime from the sidebar menu.
        </p>
      </div>
    </>
  );
}
