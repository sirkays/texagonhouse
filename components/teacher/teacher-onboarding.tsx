"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import type { CallBackProps, Step, TooltipRenderProps } from "react-joyride";
import { STATUS, ACTIONS } from "react-joyride";
import {
  Sparkles,
  TestTube,
  Video,
  GraduationCap,
  BarChart3,
  FileText,
  Bell,
  Rocket,
  LayoutDashboard,
  Zap,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronRight,
} from "lucide-react";

// ── Lazy-load Joyride (SSR-safe) ─────────────────────────────────────────────
const Joyride = dynamic(
  () => import("react-joyride").then((mod) => mod.Joyride),
  { ssr: false },
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStorageKey = (userId: string, page: string) =>
  `teacher_onboarding_complete_${page}_${userId}`;

// ── Step metadata for custom styling ─────────────────────────────────────────

interface StepMeta {
  icon: React.ElementType;
  accent: string;
  accentLight: string;
  gradient: string;
}

const STEP_META: StepMeta[] = [
  {
    icon: Sparkles,
    accent: "#f97316",
    accentLight: "#fff7ed",
    gradient: "linear-gradient(135deg, #f97316, #fb923c, #fdba74)",
  },
  {
    icon: LayoutDashboard,
    accent: "#3b82f6",
    accentLight: "#eff6ff",
    gradient: "linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd)",
  },
  {
    icon: Zap,
    accent: "#f59e0b",
    accentLight: "#fffbeb",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d)",
  },
  {
    icon: TestTube,
    accent: "#8b5cf6",
    accentLight: "#f5f3ff",
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)",
  },
  {
    icon: Video,
    accent: "#06b6d4",
    accentLight: "#ecfeff",
    gradient: "linear-gradient(135deg, #06b6d4, #22d3ee, #67e8f9)",
  },
  {
    icon: GraduationCap,
    accent: "#10b981",
    accentLight: "#ecfdf5",
    gradient: "linear-gradient(135deg, #10b981, #34d399, #6ee7b7)",
  },
  {
    icon: BarChart3,
    accent: "#ec4899",
    accentLight: "#fdf2f8",
    gradient: "linear-gradient(135deg, #ec4899, #f472b6, #f9a8d4)",
  },
  {
    icon: FileText,
    accent: "#6366f1",
    accentLight: "#eef2ff",
    gradient: "linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)",
  },
  {
    icon: Bell,
    accent: "#ef4444",
    accentLight: "#fef2f2",
    gradient: "linear-gradient(135deg, #ef4444, #f87171, #fca5a5)",
  },
  {
    icon: Rocket,
    accent: "#f97316",
    accentLight: "#fff7ed",
    gradient: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)",
  },
];

// ── Tour Steps ───────────────────────────────────────────────────────────────

const TOUR_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to Your Teaching Hub!",
    content:
      "Techxagon gives you a powerful suite of tools to create engaging lessons, manage your students, and track their growth — all in one place.",
  },
  {
    target: "#tour-stats",
    placement: "bottom",
    disableBeacon: true,
    title: "Your Dashboard at a Glance",
    content:
      "These cards show your key numbers — total students, active courses, tests created, and materials uploaded. They update in real time as you work.",
  },
  {
    target: "#tour-quick-actions",
    placement: "right",
    disableBeacon: true,
    title: "Quick Actions",
    content:
      "Jump straight into your most common tasks: create a CBT test, build a learning module, or check how your students are performing.",
  },
  {
    target: "#tour-nav-cbt-creator",
    placement: "right",
    disableBeacon: true,
    title: "Manage CBT Tests",
    content:
      "Build computer-based tests with multiple question types and auto-grading. Your students can take them anytime, from any device.",
  },
  {
    target: "#tour-nav-live-sessions",
    placement: "right",
    disableBeacon: true,
    title: "Live Sessions",
    content:
      "Schedule and host live interactive classes. Engage your students in real time beyond the physical classroom.",
  },
  {
    target: "#tour-nav-modules",
    placement: "right",
    disableBeacon: true,
    title: "Learning Modules",
    content:
      "Organize your curriculum into structured, self-paced modules. Add readings, quizzes, and resources students work through independently.",
  },
  {
    target: "#tour-nav-tutoring-booking",
    placement: "right",
    disableBeacon: true,
    title: "Tutoring Booking",
    content:
      "Manage and schedule 1-on-1 or group tutoring sessions with your students to provide personalized guidance.",
  },
  {
    target: "#tour-nav-attendance",
    placement: "right",
    disableBeacon: true,
    title: "Attendance",
    content:
      "Keep track of student attendance for both your physical classrooms and virtual live sessions.",
  },
  {
    target: "#tour-nav-analytics",
    placement: "right",
    disableBeacon: true,
    title: "Student Analytics",
    content:
      "Get deep insights into student performance. Identify who needs help, celebrate top achievers, and adapt your teaching strategy.",
  },
  {
    target: "#tour-nav-code-submission",
    placement: "right",
    disableBeacon: true,
    title: "Code Submission",
    content:
      "Review, run, and grade students' programming assignments and coding challenges in a dedicated workspace.",
  },
  {
    target: "#tour-nav-assignments",
    placement: "right",
    disableBeacon: true,
    title: "Assignments Workspace",
    content:
      "Create, distribute, and grade assignments. Students submit their work and you can review, annotate, and provide feedback.",
  },
  {
    target: "#tour-nav-certs",
    placement: "right",
    disableBeacon: true,
    title: "Student Certifications",
    content:
      "Issue and manage certificates to reward students who successfully complete your modules and courses.",
  },
  {
    target: "#tour-nav-reports",
    placement: "right",
    disableBeacon: true,
    title: "Reports",
    content:
      "Generate and export comprehensive reports covering attendance, grades, and overall classroom performance.",
  },
  {
    target: "#tour-notifications",
    placement: "bottom",
    disableBeacon: true,
    title: "Notifications",
    content:
      "Stay on top of student submissions, messages, and important updates. The badge shows how many unread notifications you have.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "You're All Set!",
    content:
      "That's the tour! Explore at your own pace. You can replay this anytime by clicking the ✨ Take the Tour button on your dashboard.",
  },
];

// ── Custom Tooltip Component ─────────────────────────────────────────────────

function CustomTooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size,
  isLastStep,
}: TooltipRenderProps) {
  const meta = STEP_META[index % STEP_META.length];
  const Icon = meta.icon;
  const progress = ((index + 1) / size) * 100;
  const isFirst = index === 0;
  const isLast = isLastStep;
  const isCentered = step.target === "body";
  const { onComplete } = useOnboarding();

  return (
    <div
      {...tooltipProps}
      style={{
        width: isCentered ? 440 : 380,
        fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
        animation: "tourTooltipIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* ── Card container ── */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05), 0 0 0 4px ${meta.accent}20`,
        }}
      >
        {/* ── Gradient header strip ── */}
        <div
          style={{
            background: meta.gradient,
            padding: "20px 24px 16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -15,
              left: 40,
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />

          {/* Top row: step count + skip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Step {index + 1} of {size}
            </div>
            <button
              {...closeProps}
              onClick={(e) => {
                console.log("[Onboarding] Close (X) clicked — calling onComplete");
                onComplete();
                if (closeProps.onClick) closeProps.onClick(e);
              }}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background =
                  "rgba(255,255,255,0.4)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background =
                  "rgba(255,255,255,0.2)")
              }
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Icon + title row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Icon size={22} color="#fff" strokeWidth={2} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: isCentered ? 20 : 17,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.3,
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {step.title as string}
            </h3>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ height: 3, background: "#f1f5f9" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: meta.gradient,
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>

        {/* ── Body content ── */}
        <div style={{ padding: "20px 24px 8px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            {step.content as string}
          </p>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "12px 24px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: size }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 20 : 6,
                  height: 6,
                  borderRadius: 99,
                  background:
                    i === index
                      ? meta.accent
                      : i < index
                        ? meta.accent + "55"
                        : "#e2e8f0",
                  transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isFirst && (
              <button
                {...backProps}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "9px 16px",
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#cbd5e1";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#f8fafc";
                  (e.currentTarget as HTMLButtonElement).style.color = "#334155";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#e2e8f0";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#fff";
                  (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                }}
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}

            {isFirst && (
              <button
                {...skipProps}
                onClick={(e) => {
                  console.log("[Onboarding] Skip tour clicked — calling onComplete");
                  onComplete();
                  if (skipProps.onClick) skipProps.onClick(e);
                }}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "color 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "#64748b")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "#94a3b8")
                }
              >
                Skip tour
              </button>
            )}

            <button
              {...primaryProps}
              onClick={(e) => {
                if (isLast) {
                  console.log("[Onboarding] Last step 'Let's Go!' clicked — calling onComplete");
                  onComplete();
                }
                if (primaryProps.onClick) primaryProps.onClick(e);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                borderRadius: 12,
                border: "none",
                background: meta.gradient,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: `0 4px 14px ${meta.accent}44`,
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${meta.accent}55`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${meta.accent}44`;
              }}
            >
              {isLast ? (
                <>
                  <Sparkles size={14} />
                  Let&apos;s Go!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Joyride overlay styles (minimal — tooltip is fully custom) ───────────────

const joyrideStyles = {
  options: {
    overlayColor: "rgba(0, 0, 0, 0.55)",
    zIndex: 9999,
  },
};

// ── Context ──────────────────────────────────────────────────────────────────

interface OnboardingContextValue {
  startTour: () => void;
  setReady: (ready: boolean) => void;
  onComplete: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  startTour: () => {},
  setReady: () => {},
  onComplete: () => {},
});

/** Call inside any child of TeacherOnboardingGate to replay the tour. */
export function useOnboarding() {
  return useContext(OnboardingContext);
}

// ── Gate Component ────────────────────────────────────────────────────────────

/**
 * Fetches the teacher's onboarding status from the backend.
 * Uses the session token for authentication.
 */
async function fetchOnboardingStatus(page: string): Promise<boolean> {
  console.log("[Onboarding] GET /api/teacher/onboarding?page=" + page);
  const res = await fetch(`/api/teacher/onboarding?page=${page}`);
  console.log("[Onboarding] GET response status:", res.status);
  if (!res.ok) {
    console.log("[Onboarding] GET not ok, returning false");
    return false;
  }
  const data = await res.json();
  console.log("[Onboarding] GET response data:", JSON.stringify(data));
  return Boolean(data.has_seen_onboarding);
}

/**
 * Persists onboarding completion to the backend.
 */
async function markOnboardingComplete(page: string): Promise<void> {
  console.log("[Onboarding] POST /api/teacher/onboarding, page=" + page);
  const res = await fetch("/api/teacher/onboarding", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page })
  });
  console.log("[Onboarding] POST response status:", res.status);
  try {
    const data = await res.json();
    console.log("[Onboarding] POST response data:", JSON.stringify(data));
  } catch (e) {
    console.log("[Onboarding] POST response not JSON");
  }
}

export function TeacherOnboardingGate({
  children,
  page = "dashboard",
}: {
  children: React.ReactNode;
  page?: string;
}) {
  const { data: session, status } = useSession();
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  // `checkedUserId` is set once the backend check has resolved for the current user.
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [needsTour, setNeedsTour] = useState(false);

  // Resolve stable identity values from the session.
  const resolvedUserId =
    status === "authenticated"
      ? ((session?.user as { id?: string })?.id ||
          session?.user?.email ||
          null)
      : null;
  const sessionToken = (session?.user as { sessionToken?: string })?.sessionToken;

  console.log("[Onboarding] Render — status:", status, "resolvedUserId:", resolvedUserId, "sessionToken:", sessionToken ? "YES" : "NO", "checkedUserId:", checkedUserId, "needsTour:", needsTour, "run:", run, "isReady:", isReady);

  // Check onboarding status — backend is the source of truth.
  // localStorage is used as a fast-path optimistic cache to avoid flicker.
  useEffect(() => {
    console.log("[Onboarding] Effect — resolvedUserId:", resolvedUserId, "sessionToken:", sessionToken ? "YES" : "NO", "checkedUserId:", checkedUserId);
    if (!resolvedUserId || !sessionToken) {
      console.log("[Onboarding] Effect — skipping, missing resolvedUserId or sessionToken");
      return;
    }
    if (resolvedUserId === checkedUserId) {
      console.log("[Onboarding] Effect — skipping, already checked for this user");
      return;
    }

    const localKey = getStorageKey(resolvedUserId, page);
    const cachedDone = localStorage.getItem(localKey) === "true";
    console.log("[Onboarding] Effect — localKey:", localKey, "cachedDone:", cachedDone);

    if (cachedDone) {
      // Fast path: local cache says done — mark checked immediately, skip API call.
      console.log("[Onboarding] Effect — FAST PATH: localStorage says done, skipping tour");
      setCheckedUserId(resolvedUserId);
      return;
    }

    // Slow path: ask the backend.
    console.log("[Onboarding] Effect — SLOW PATH: asking backend...");
    fetchOnboardingStatus(page).then((hasSeenOnboarding) => {
      console.log("[Onboarding] Effect — Backend returned hasSeenOnboarding:", hasSeenOnboarding);
      if (hasSeenOnboarding) {
        // Sync the local cache so future loads are instant.
        localStorage.setItem(localKey, "true");
      } else {
        console.log("[Onboarding] Effect — Setting needsTour=true");
        setNeedsTour(true);
      }
      setCheckedUserId(resolvedUserId);
    });
  }, [resolvedUserId, sessionToken, checkedUserId, page]);

  // Start tour automatically once data is loaded and DOM is ready
  useEffect(() => {
    if (needsTour && isReady) {
      console.log("[Onboarding] Auto-start tour (needsTour && isReady)");
      setTimeout(() => setRun(true), 600);
      setNeedsTour(false);
    }
  }, [needsTour, isReady]);

  /** Mark complete on both backend and localStorage */
  const handleComplete = useCallback(() => {
    if (!resolvedUserId) return;
    const key = getStorageKey(resolvedUserId, page);
    console.log("[Onboarding] handleComplete — saving to localStorage key:", key);
    // Update localStorage immediately for instant future loads.
    localStorage.setItem(key, "true");
    // Persist to backend so the flag survives device/browser changes.
    if (sessionToken) markOnboardingComplete(page);
    setRun(false);
  }, [resolvedUserId, sessionToken, page]);

  /** Joyride callback handler */
  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, type } = data;
      console.log("[Onboarding] Joyride callback — status:", status, "action:", action, "type:", type);

      if (
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED ||
        action === ACTIONS.CLOSE ||
        action === "skip" ||
        type === "tour:end"
      ) {
        console.log("[Onboarding] Joyride — tour ended, calling handleComplete");
        handleComplete();
      }
    },
    [handleComplete],
  );

  /** Exposed via context — replays from step 0 every time */
  const startTour = useCallback(() => {
    setTourKey((k) => k + 1);
    setRun(true);
  }, []);

  // While we're waiting for the backend check, render children unblocked.
  if (!checkedUserId && resolvedUserId) return <>{children}</>;

  return (
    <OnboardingContext.Provider value={{ startTour, setReady: setIsReady, onComplete: handleComplete }}>
      <style>{`
        @keyframes tourTooltipIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .react-joyride__spotlight {
          border-radius: 14px !important;
        }
      `}</style>
      <Joyride
        key={tourKey}
        steps={TOUR_STEPS}
        run={run}
        callback={handleCallback}
        continuous
        showSkipButton
        disableScrolling={false}
        scrollToFirstStep
        scrollOffset={120}
        styles={joyrideStyles}
        tooltipComponent={CustomTooltip}
        floaterProps={{
          styles: {
            arrow: {
              length: 8,
              spread: 16,
            },
          },
          hideArrow: false,
        }}
      />
      {children}
    </OnboardingContext.Provider>
  );
}
