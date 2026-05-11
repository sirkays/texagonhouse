"use client";

import { useState, useEffect } from "react";
import { FileText, BookOpen, Calendar, ArrowRight, Users } from "lucide-react";

type Report = { id: number; title: string; course_name: string; published_at: string; recipients_count: number };

export default function StudentReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/reports").then(r => r.json()).then(d => setReports(d.results || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Activity reports from your teachers</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF7B55]" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No reports available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map(r => (
            <a key={r.id} href={`/student/reports/${r.id}`} className="block bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-[#EF7B55] transition-colors">{r.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{r.course_name}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(r.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#EF7B55] transition-colors" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
