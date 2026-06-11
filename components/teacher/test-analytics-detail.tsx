"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock,
  CheckCircle,
  BarChart3,
  Target,
  BookOpen,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Spinner } from "../ui/spinner";
import type { TestDetail } from "./teacher-student-analytics";

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

function getDifficultyStyle(difficulty: string) {
  if (difficulty === "Easy")
    return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
  if (difficulty === "Medium")
    return "bg-amber-500/15 text-amber-600 border-amber-500/30";
  return "bg-rose-500/15 text-rose-600 border-rose-500/30";
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

export function TestAnalyticsDetail({ testId }: { testId: string }) {
  const router = useRouter();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(`analytics_test_${testId}`);
    if (raw) {
      try {
        setTest(JSON.parse(raw));
      } catch {
        //
      }
    }
    setLoading(false);
  }, [testId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="md" className="text-sky-500" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Test data not found.</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-sky-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const distribution = test.scoreDistribution ?? [];
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

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
          <h1 className="text-xl sm:text-2xl font-bold">{test.name}</h1>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyStyle(test.difficulty)}`}
            >
              {test.difficulty}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              {test.attempts} attempts
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {test.timeLimit}
            </span>
          </div>
        </div>
        <ScoreRing value={test.avgScore} size={80} />
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          value={test.attempts}
          label="Total Attempts"
          color="bg-sky-500/20 text-sky-500"
          bg="bg-sky-500/10 border-sky-500/20"
        />
        <StatCard
          icon={Target}
          value={`${test.avgScore}%`}
          label="Average Score"
          color="bg-emerald-500/20 text-emerald-500"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          icon={CheckCircle}
          value={`${test.passRate}%`}
          label="Pass Rate"
          color="bg-violet-500/20 text-violet-500"
          bg="bg-violet-500/10 border-violet-500/20"
        />
        <StatCard
          icon={BookOpen}
          value={test.questions}
          label="Questions"
          color="bg-orange-500/20 text-orange-500"
          bg="bg-orange-500/10 border-orange-500/20"
        />
      </div>

      {/* ── Test Configuration ── */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 text-sky-500" />
          <h2 className="font-semibold text-sm">Test Configuration</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className={`p-2 rounded-lg ${getDifficultyStyle(test.difficulty)}`}>
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Difficulty</div>
              <div className="font-semibold text-sm">{test.difficulty}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="p-2 rounded-lg bg-sky-500/15 text-sky-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Time Limit</div>
              <div className="font-semibold text-sm">{test.timeLimit}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="p-2 rounded-lg bg-violet-500/15 text-violet-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Questions</div>
              <div className="font-semibold text-sm">{test.questions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Distribution ── */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-sky-500" />
          <h2 className="font-semibold text-sm">Score Distribution</h2>
        </div>

        {distribution.length === 0 ? (
          <p className="text-sm text-muted-foreground">No distribution data available.</p>
        ) : (
          <>
            {/* Bar chart visualization */}
            <div className="flex items-end gap-2 h-32 mb-4">
              {distribution.map((d, i) => {
                const heightPct = (d.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{d.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-sky-500 to-sky-400 transition-all duration-700"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Labels */}
            <div className="flex gap-2">
              {distribution.map((d, i) => (
                <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground truncate">
                  {d.range}%
                </div>
              ))}
            </div>

            {/* Table row */}
            <div className="mt-5 space-y-2">
              {distribution.map((d, i) => {
                const pct = test.attempts
                  ? ((d.count / test.attempts) * 100).toFixed(1)
                  : "0.0";
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-16 text-right text-muted-foreground shrink-0">
                      {d.range}%
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400"
                        style={{
                          width: `${test.attempts ? (d.count / test.attempts) * 100 : 0}%`,
                          transition: "width 0.7s ease",
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                      {d.count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
