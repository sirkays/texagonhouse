"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Star,
  CheckCircle,
  BookOpen,
  TrendingUp,
  ArrowLeft,
  Award,
  AlertTriangle,
  Target,
} from "lucide-react";
import { Spinner } from "../ui/spinner";
import type { CourseDetail } from "./teacher-student-analytics";

function ScoreRing({ value, size = 72 }: { value: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color =
    value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-dashoffset 0.8s ease",
        }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size / 4}
        fontWeight="700"
        fill={color}
      >
        {value}%
      </text>
    </svg>
  );
}

function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  bg,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${bg} backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function CourseAnalyticsDetail({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(`analytics_course_${courseId}`);
    if (raw) {
      try {
        setCourse(JSON.parse(raw));
      } catch {
        //
      }
    }
    setLoading(false);
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Course data not found.</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-orange-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const topPerformers = course.topPerformers ?? [];
  const struggling = course.strugglingStudents ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* ── Back + Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Analytics
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{course.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {course.students} student{course.students !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <ScoreRing value={course.avgScore} size={80} />
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          value={course.students}
          label="Total Students"
          color="bg-sky-500/20 text-sky-500"
          bg="bg-sky-500/10 border-sky-500/20"
        />
        <StatCard
          icon={Star}
          value={`${course.avgScore}%`}
          label="Average Score"
          color="bg-amber-500/20 text-amber-500"
          bg="bg-amber-500/10 border-amber-500/20"
        />

        <StatCard
          icon={Target}
          value={`${(course.passRate ?? 0).toFixed(1)}%`}
          label="Pass Rate"
          color="bg-emerald-500/20 text-emerald-500"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
        {course.totalLessons != null && (
          <StatCard
            icon={BookOpen}
            value={course.totalLessons}
            label="Total Lessons"
            color="bg-violet-500/20 text-violet-500"
            bg="bg-violet-500/10 border-violet-500/20"
          />
        )}
        {course.rating != null && (
          <StatCard
            icon={Award}
            value={`${course.rating}/5`}
            label="Course Rating"
            color="bg-orange-500/20 text-orange-500"
            bg="bg-orange-500/10 border-orange-500/20"
          />
        )}
      </div>

      {/* ── Progress Overview ── */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          <h2 className="font-semibold text-sm">Performance Metrics</h2>
        </div>
        <MetricBar label="Average Score" value={course.avgScore} color="bg-amber-500" />
        <MetricBar label="Pass Rate" value={course.passRate ?? 0} color="bg-emerald-500" />

        {course.avgProgress != null && (
          <MetricBar label="Avg Progress" value={course.avgProgress} color="bg-violet-500" />
        )}
      </div>

      {/* ── Top Performers + Struggling ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/15">
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-sm text-emerald-700">Top Performers</h2>
          </div>

          {topPerformers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No top performer data available.</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((student, i) => (
                <div
                  key={`${student.name}-${i}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-700">
                      {i + 1}
                    </div>
                    <span className="font-medium text-sm">{student.name}</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold text-emerald-600">{student.score}% score</div>
                    <div className="text-muted-foreground">{student.progress}% progress</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Struggling Students */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/15">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <h2 className="font-semibold text-sm text-rose-700">Students Needing Help</h2>
          </div>

          {struggling.length === 0 ? (
            <p className="text-sm text-muted-foreground">No struggling student data available.</p>
          ) : (
            <div className="space-y-3">
              {struggling.map((student, i) => (
                <div
                  key={`${student.name}-${i}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20"
                >
                  <div>
                    <div className="font-medium text-sm">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Last active: {student.lastActive}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold text-rose-600">{student.score}% score</div>
                    <div className="text-muted-foreground">{student.progress}% progress</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
