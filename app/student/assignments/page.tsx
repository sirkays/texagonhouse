"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Link as LinkIcon, CheckCircle, Clock, Upload, ChevronRight, ArrowLeft, Send, Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, Download } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

type ResolvedFile = { key: string; url: string; filename: string };

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [resolvedFiles, setResolvedFiles] = useState<ResolvedFile[]>([]);
  const [isResolvingFiles, setIsResolvingFiles] = useState(false);

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.results || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const { data: session } = useSession();
  const sessionToken = (session?.user as any)?.sessionToken;

  const UPLOAD_BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "s3";
  const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "https://texagon-backend.onrender.com";

  async function uploadToCloudinary(file: File): Promise<string> {
    const sig = await fetch(`${DJANGO_BASE}/learning/api/cloudinary-signature/`, {
      headers: { "X-Session-Token": sessionToken },
    }).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || j?.error || "Cloudinary signature failed");
      return j;
    });

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.api_key);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);

    const resource = file.type.startsWith("video/") || file.type.startsWith("audio/") ? "video" : "raw";
    const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resource}/upload`;

    const data = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.onload = () => {
        const json = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.error?.message || "Cloudinary upload failed"));
      };
      xhr.onerror = () => reject(new Error("Cloudinary network error"));
      xhr.send(fd);
    });

    return data.secure_url as string;
  }

  async function uploadToS3(file: File): Promise<string> {
    const pres = await fetch(`${DJANGO_BASE}/learning/api/presign-s3/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": sessionToken,
      },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type || "application/octet-stream",
      }),
    }).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || j?.error || "Failed to presign S3 upload");
      return j;
    });

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", pres.upload_url, true);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`S3 upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error during S3 upload"));
      xhr.send(file);
    });

    return pres.key as string;
  }

  const handlePlayVideo = async () => {
    if (!selectedAssignment || !selectedAssignment.lesson) return;
    setIsVideoLoading(true);
    try {
      const res = await fetch(`/api/student/lesson-media-url/${selectedAssignment.lesson}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "X-Session-Token": sessionToken },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load video");
      const data = await res.json();
      if (!data?.url) throw new Error("Media URL missing");
      setVideoUrl(data.url);
      setShowVideoPlayer(true);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    } catch (err) {
      console.error(err);
      alert("Unable to load the video. Please try again later.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const resolveAttachmentFiles = async (keys: string[]) => {
    if (!keys || keys.length === 0) { setResolvedFiles([]); return; }
    setIsResolvingFiles(true);
    try {
      const res = await fetch("/api/presign-attachment-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      if (res.ok) {
        const data = await res.json();
        setResolvedFiles(data.files || []);
      }
    } catch (err) { console.error(err); }
    finally { setIsResolvingFiles(false); }
  };

  // Resolve files when an assignment is selected
  useEffect(() => {
    if (selectedAssignment?.attachments?.length > 0) {
      resolveAttachmentFiles(selectedAssignment.attachments);
    } else {
      setResolvedFiles([]);
    }
    setShowVideoPlayer(false);
    setVideoUrl(undefined);
  }, [selectedAssignment]);

  // Video player helpers
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };
  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!isFullscreen) {
      (container.requestFullscreen || (container as any).webkitRequestFullscreen)?.call(container);
      setIsFullscreen(true);
    } else {
      (document.exitFullscreen || (document as any).webkitExitFullscreen)?.call(document);
      setIsFullscreen(false);
    }
  };
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [isPlaying, showControls]);

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    
    // Validate file sizes (10MB max)
    for (const f of attachments) {
      if (f.size > 10 * 1024 * 1024) {
        alert(`File ${f.name} exceeds the 10MB limit.`);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      // Upload files first
      const uploadedUrls: string[] = [];
      for (const file of attachments) {
        let url = "";
        if (UPLOAD_BUCKET === "cloudinary") {
          url = await uploadToCloudinary(file);
        } else {
          url = await uploadToS3(file);
        }
        uploadedUrls.push(url);
      }

      const payload = {
        assignment: selectedAssignment.id,
        text: submissionText,
        attachments: uploadedUrls,
      };
      
      const res = await fetch("/api/submissions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Submission successful!");
        setSelectedAssignment(null);
        setSubmissionText("");
        setAttachments([]);
      } else {
        alert("Failed to submit.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to safely parse description if it was saved as JSON
  const renderDescription = (desc: string) => {
    try {
      const parsed = JSON.parse(desc);
      if (parsed.type === 'steps' && Array.isArray(parsed.items)) {
        return (
          <div className="space-y-4">
            {parsed.items.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-[#EF7B55] flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                  {step}
                </div>
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
      // It's just plain text
      return <div className="text-slate-600 whitespace-pre-wrap">{desc || "No description provided."}</div>;
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" className="text-[#EF7B55]" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen pb-20">
      
      {!selectedAssignment ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Assignments Workspace</h1>
            <p className="text-slate-500 mt-1">Review your tasks, access lesson materials, and submit your work.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 min-h-[400px]">
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500 opacity-80" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">All Caught Up!</h3>
                <p className="text-sm mt-1 max-w-sm text-center">You have no pending assignments at the moment. Take a break or explore more courses.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {assignments.map(a => (
                  <div 
                    key={a.id} 
                    onClick={() => setSelectedAssignment(a)}
                    className="group relative p-6 border border-slate-100 rounded-3xl hover:border-[#EF7B55] hover:shadow-md hover:shadow-orange-100 transition-all duration-300 bg-white cursor-pointer flex flex-col justify-between h-[220px]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-orange-50 rounded-xl">
                          <FileText className="w-5 h-5 text-[#EF7B55]" />
                        </div>
                        {a.due_at && (
                          <span className="text-[10px] font-semibold px-2.5 py-1 bg-red-50 text-red-600 rounded-full flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Due {new Date(a.due_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2">{a.title}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Not Submitted</span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#EF7B55] group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={() => setSelectedAssignment(null)} variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white border shadow-sm text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Assignment Details</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Instructions Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="mb-8 pb-6 border-b border-slate-100">
                  <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-3">{selectedAssignment.title}</h2>
                  <div className="flex gap-4 items-center">
                    {selectedAssignment.due_at && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-red-50 text-red-600 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> Due: {new Date(selectedAssignment.due_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Instructions</h3>
                  {renderDescription(selectedAssignment.description)}
                </div>
              </div>

              {/* Submission Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#EF7B55]" />
                  Your Submission
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Your Answer</label>
                    <Textarea 
                      value={submissionText}
                      onChange={e => setSubmissionText(e.target.value)}
                      placeholder="Type your answer, observations, or paste project links here..." 
                      className="min-h-[150px] bg-slate-50/50 border-slate-200 focus:bg-white rounded-2xl resize-none p-4 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Attach Files (Optional)</label>
                    <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group relative">
                      <input 
                        type="file" 
                        multiple 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => {
                          if (e.target.files) {
                            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                          }
                        }}
                      />
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-[#EF7B55] transition-colors">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Click to browse files</span>
                      <span className="text-xs text-slate-400 mt-1">PDF, Images, ZIP</span>
                    </label>

                    {attachments.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl text-sm border border-slate-100">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-[#EF7B55] shrink-0" />
                              <span className="truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <span className="sr-only">Remove</span>
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || !submissionText.trim()}
                      className="w-full sm:w-auto px-8 h-12 bg-[#EF7B55] hover:bg-[#d96a44] text-white rounded-xl shadow-md text-base font-medium transition-all"
                    >
                      {isSubmitting ? <Spinner size="sm" className="text-white mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                      Submit Work
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-6">
              {/* Inline Video Player */}
              {showVideoPlayer && videoUrl && (
                <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative group" onMouseMove={() => setShowControls(true)}>
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent absolute top-0 left-0 right-0 z-10">
                    <h3 className="text-white font-semibold text-sm truncate">{selectedAssignment?.title}</h3>
                    <button onClick={() => { setShowVideoPlayer(false); setIsPlaying(false); }} className="text-white/70 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <video
                    ref={videoRef}
                    className="w-full aspect-video object-contain bg-black cursor-pointer"
                    src={videoUrl}
                    onClick={togglePlay}
                    onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
                    onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
                    onEnded={() => setIsPlaying(false)}
                    onContextMenu={e => e.preventDefault()}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    preload="metadata"
                  />

                  {/* Center play icon */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Controls bar */}
                  <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {/* Progress bar */}
                    <input
                      type="range" min="0" max={duration || 0} value={currentTime} step="0.1"
                      onChange={e => { const t = parseFloat(e.target.value); setCurrentTime(t); if (videoRef.current) videoRef.current.currentTime = t; }}
                      className="w-full h-1 mb-3 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#EF7B55] [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button onClick={togglePlay} className="text-white hover:text-[#EF7B55] transition-colors">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleMute} className="text-white hover:text-[#EF7B55] transition-colors">
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                          type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
                          onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; setIsMuted(v === 0); }}
                          className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <span className="text-white text-xs ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
                      </div>
                      <button onClick={toggleFullscreen} className="text-white hover:text-[#EF7B55] transition-colors">
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Resources Sidebar */}
              <div className="bg-slate-800 rounded-3xl shadow-sm p-8 text-white">
                <h3 className="font-semibold text-lg mb-2">Learning Resources</h3>
                <p className="text-sm text-slate-300 mb-6">Review the material before attempting the assignment.</p>
                
                {selectedAssignment.lesson ? (
                  <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600/50">
                    <div className="flex gap-3 mb-4">
                      <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 h-fit">
                        <Play className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">Lesson Guide</h4>
                        <p className="text-xs text-slate-400 mt-1">Watch the module video</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePlayVideo} 
                      disabled={isVideoLoading || showVideoPlayer}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                    >
                      {isVideoLoading ? <Spinner size="sm" className="mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {showVideoPlayer ? "Now Playing" : "Watch Video"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-700/30 rounded-2xl border border-slate-700 border-dashed">
                    <p className="text-sm text-slate-400">No specific lesson linked.</p>
                  </div>
                )}
                
                {/* Resolved downloadable files */}
                {(resolvedFiles.length > 0 || isResolvingFiles) && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="font-medium text-white text-sm mb-3 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Attached Files
                    </h4>
                    {isResolvingFiles ? (
                      <div className="flex justify-center py-4"><Spinner size="sm" className="text-slate-400" /></div>
                    ) : (
                      <div className="space-y-2">
                        {resolvedFiles.map((file, i) => (
                          <a 
                            key={i} 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600/60 rounded-xl transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                              <Download className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-sm text-slate-200 group-hover:text-white truncate">
                              {file.filename || `Attachment ${i + 1}`}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS to hide browser download button on video */}
      <style jsx global>{`
        video::-internal-media-controls-download-button { display: none !important; }
        video::-webkit-media-controls-enclosure { overflow: hidden !important; }
        video::-webkit-media-controls-panel { width: calc(100% + 30px); }
      `}</style>
    </div>
  );
}
