"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, FileText, Video, Film, ClipboardList, Code } from "lucide-react";
import { VideoModal } from "@/components/student/video-modal";

export default function ReportPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Video Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({ title: "", url: "" });

  useEffect(() => {
    if (!reportId) return;
    
    fetch(`/api/teacher/reports/${reportId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reportId]);

  const handlePlayVideo = (title: string, rawUrl: string) => {
    // Resolve the URL to include the backend domain if it's relative
    const resolvedUrl = rawUrl.startsWith("http") 
      ? rawUrl 
      : `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL || ""}${rawUrl}`;
      
    setSelectedVideo({ title: title || "Video", url: resolvedUrl });
    setVideoModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF7B55] mb-4" />
          <p className="text-sm text-slate-500">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-slate-500 mb-4">Failed to load report.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#EF7B55] text-white rounded-lg text-sm font-medium hover:bg-[#d86b4a] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 truncate">{data.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            <span className="text-[#EF7B55] font-semibold">{data.course?.name || data.course_name || "Course Report"}</span>
            {data.period_start && data.period_end && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-600 bg-slate-100/75 px-2.5 py-0.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(data.period_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} — {new Date(data.period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </>
            )}
            <span className="text-slate-300">•</span>
            <span className="capitalize bg-orange-50 text-[#EF7B55] px-2.5 py-0.5 rounded-full text-xs font-bold border border-orange-100">
              {data.recipient_mode === "selected" ? "Selected Students" : data.recipient_mode === "course" ? "All in Course" : "All in Classroom"}
            </span>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
        {/* Description */}
        {data.description && (
          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#EF7B55]" /> Teacher Notes
            </h2>
            <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {data.description}
              </p>
            </div>
          </section>
        )}

        {/* CBT Tests */}
        {data.cbt_items && data.cbt_items.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#EF7B55]" /> Included CBT Tests
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.cbt_items.map((item: any) => (
                <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/40 flex items-center justify-between shadow-sm">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{item.test_title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Test Assessment</p>
                  </div>
                  <span className="text-xs font-bold text-[#EF7B55] bg-orange-50 border border-orange-100/50 px-2.5 py-1 rounded-full shrink-0">
                    {item.total_marks} Marks
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Coding Lessons */}
        {data.coding_items && data.coding_items.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#EF7B55]" /> Included Coding Projects
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.coding_items.map((item: any) => (
                <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/40 flex items-center gap-2.5 shadow-sm">
                  <div className="p-1.5 bg-orange-50 border border-orange-100/50 rounded-lg shrink-0">
                    <Code className="w-4 h-4 text-[#EF7B55]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{item.lesson_title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Coding Lesson</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Off-Practical Work */}
        {data.offline_items && data.offline_items.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#EF7B55]" /> Included Off-Practical Work
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.offline_items.map((item: any) => (
                <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/40 flex items-center justify-between shadow-sm">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{item.opw_title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Off-Practical Assessment</p>
                  </div>
                  <span className="text-xs font-bold text-[#EF7B55] bg-orange-50 border border-orange-100/50 px-2.5 py-1 rounded-full shrink-0">
                    {item.max_score} Marks
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Activities */}
        {data.activities && data.activities.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#EF7B55]" /> Class Activities
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {data.activities.map((a: any, i: number) => (
                <div key={i} className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800">{a.title}</h3>
                    {a.activity_date && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {new Date(a.activity_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {a.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {data.videos && data.videos.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#EF7B55]" /> Attached Videos
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.videos.map((v: any, i: number) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm group">
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                    <Film className="w-10 h-10 text-slate-700" />
                    <button
                      onClick={() => handlePlayVideo(v.title, v.video_url)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <div className="bg-[#EF7B55] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                        <Video className="w-4 h-4" /> Watch Video
                      </div>
                    </button>
                  </div>
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                    <h4 className="font-medium text-sm text-slate-800 truncate">
                      {v.title || `Video ${i + 1}`}
                    </h4>
                    <button
                      onClick={() => handlePlayVideo(v.title, v.video_url)}
                      className="text-[#EF7B55] text-xs font-medium hover:underline"
                    >
                      Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!data.activities?.length && !data.videos?.length && !data.description) && (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">Report is Empty</h3>
            <p className="text-sm text-slate-500">No notes, activities, or videos were added to this report.</p>
          </div>
        )}
      </div>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={selectedVideo.title}
        videoUrl={selectedVideo.url}
      />
    </div>
  );
}
