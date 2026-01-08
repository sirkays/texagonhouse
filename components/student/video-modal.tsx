// // // "use client";

// // // import {useState, useRef, useEffect} from "react";
// // // import {
// // //   Dialog,
// // //   DialogContent,
// // //   DialogHeader,
// // //   DialogTitle,
// // // } from "@/components/ui/dialog";
// // // import {Button} from "@/components/ui/button";
// // // import {Play, Pause, Volume2, VolumeX, Maximize, Minimize} from "lucide-react";
// // // import {Video} from "lucide-react";

// // // interface VideoModalProps {
// // //   isOpen: boolean;
// // //   onClose: () => void;
// // //   title: string;
// // //   videoUrl?: string;
// // //   thumbnail?: string | null;
// // // }

// // // export function VideoModal({
// // //   isOpen,
// // //   onClose,
// // //   title,
// // //   videoUrl,
// // //   thumbnail,
// // // }: VideoModalProps) {
// // //   const [isPlaying, setIsPlaying] = useState(false);
// // //   const [currentTime, setCurrentTime] = useState(0);
// // //   const [duration, setDuration] = useState(0);
// // //   const [volume, setVolume] = useState(1);
// // //   const [isMuted, setIsMuted] = useState(false);
// // //   const [isFullscreen, setIsFullscreen] = useState(false);
// // //   const [showControls, setShowControls] = useState(true);
// // //   const [showContinueTooltip, setShowContinueTooltip] = useState(false);
// // //   const [posterError, setPosterError] = useState(false);
// // //   const videoRef = useRef<HTMLVideoElement>(null);
// // //   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// // //   const lastTapRef = useRef<{time: number; x: number} | null>(null);
// // //   const posterImgRef = useRef<HTMLImageElement>(null);

// // //   const validateThumbnail = async (thumbUrl: string) => {
// // //     try {
// // //       const response = await fetch(thumbUrl, {method: "HEAD"});
// // //       return response.ok;
// // //     } catch {
// // //       return false;
// // //     }
// // //   };

// // //   const getPosterUrl = async () => {
// // //     if (!thumbnail || posterError) return undefined;

// // //     try {
// // //       if (thumbnail.startsWith("http")) {
// // //         const isValid = await validateThumbnail(thumbnail);
// // //         return isValid ? thumbnail : undefined;
// // //       }

// // //       const fullUrl = `https://texagonbackend.onrender.com${thumbnail}`;
// // //       const isValid = await validateThumbnail(fullUrl);
// // //       return isValid ? fullUrl : undefined;
// // //     } catch (error) {
// // //       setPosterError(true);
// // //       return undefined;
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     let isValid = false;

// // //     const validateAndSetPoster = async () => {
// // //       if (!thumbnail) {
// // //         setPosterError(true);
// // //         return;
// // //       }

// // //       setPosterError(false);

// // //       const posterUrl = thumbnail.startsWith("http")
// // //         ? thumbnail
// // //         : `https://texagonbackend.onrender.com${thumbnail}`;

// // //       const img = new Image();
// // //       img.onload = () => {
// // //         isValid = true;
// // //         if (videoRef.current && !isPlaying) {
// // //           videoRef.current.poster = posterUrl;
// // //         }
// // //       };
// // //       img.onerror = () => {
// // //         setPosterError(true);
// // //         isValid = false;
// // //       };
// // //       img.src = posterUrl;
// // //     };

// // //     if (isOpen && videoUrl) {
// // //       validateAndSetPoster();
// // //     }

// // //     return () => {
// // //       if (posterImgRef.current) {
// // //         posterImgRef.current.onload = null;
// // //         posterImgRef.current.onerror = null;
// // //       }
// // //     };
// // //   }, [thumbnail, isOpen, videoUrl, isPlaying]);

// // //   const saveVideoProgress = () => {
// // //     if (videoRef.current && videoUrl) {
// // //       try {
// // //         localStorage.setItem(
// // //           `video-progress-${videoUrl}`,
// // //           videoRef.current.currentTime.toString()
// // //         );
// // //       } catch (e) {}
// // //     }
// // //   };

// // //   const restoreVideoProgress = () => {
// // //     if (videoRef.current && videoUrl) {
// // //       try {
// // //         const savedTime = localStorage.getItem(`video-progress-${videoUrl}`);
// // //         if (savedTime && Number.parseFloat(savedTime) > 0) {
// // //           videoRef.current.currentTime = Number.parseFloat(savedTime);
// // //           setCurrentTime(Number.parseFloat(savedTime));
// // //           setShowContinueTooltip(true);
// // //           setTimeout(() => setShowContinueTooltip(false), 2000);
// // //         }
// // //       } catch (e) {}
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (isPlaying && showControls) {
// // //       controlsTimeoutRef.current = setTimeout(() => {
// // //         setShowControls(false);
// // //       }, 3000);
// // //     }
// // //     return () => {
// // //       if (controlsTimeoutRef.current) {
// // //         clearTimeout(controlsTimeoutRef.current);
// // //       }
// // //     };
// // //   }, [isPlaying, showControls]);

// // //   useEffect(() => {
// // //     if (!isPlaying) {
// // //       saveVideoProgress();
// // //     }
// // //   }, [isPlaying]);

// // //   useEffect(() => {
// // //     if (!isOpen) {
// // //       saveVideoProgress();
// // //       setIsPlaying(false);
// // //       setShowControls(true);
// // //       setPosterError(false);
// // //     } else {
// // //       restoreVideoProgress();
// // //     }
// // //   }, [isOpen, videoUrl]);

// // //   const togglePlay = () => {
// // //     if (videoRef.current) {
// // //       if (isPlaying) {
// // //         videoRef.current.pause();
// // //       } else {
// // //         videoRef.current.play().catch(() => {});
// // //       }
// // //       setIsPlaying(!isPlaying);
// // //       setShowControls(true);
// // //       setShowContinueTooltip(false);
// // //     }
// // //   };

// // //   const toggleMute = () => {
// // //     if (videoRef.current) {
// // //       videoRef.current.muted = !isMuted;
// // //       setIsMuted(!isMuted);
// // //     }
// // //   };

// // //   const toggleFullscreen = () => {
// // //     if (!videoRef.current) return;

// // //     if (!isFullscreen) {
// // //       const requestFullscreen =
// // //         videoRef.current.requestFullscreen ||
// // //         (videoRef.current as any).webkitRequestFullscreen ||
// // //         (videoRef.current as any).mozRequestFullScreen ||
// // //         (videoRef.current as any).msRequestFullscreen;
// // //       const webkitEnterFullscreen = (videoRef.current as any)
// // //         .webkitEnterFullscreen;

// // //       if (
// // //         webkitEnterFullscreen &&
// // //         /iPhone|iPad|iPod/i.test(navigator.userAgent)
// // //       ) {
// // //         webkitEnterFullscreen.call(videoRef.current).catch(() => {});
// // //         setIsFullscreen(true);
// // //       } else if (requestFullscreen) {
// // //         requestFullscreen.call(videoRef.current).catch(() => {});
// // //         setIsFullscreen(true);
// // //       }
// // //     } else {
// // //       const exitFullscreen =
// // //         document.exitFullscreen ||
// // //         (document as any).webkitExitFullscreen ||
// // //         (document as any).mozCancelFullScreen ||
// // //         (document as any).msExitFullscreen ||
// // //         (document as any).webkitCancelFullScreen;
// // //       if (exitFullscreen) {
// // //         exitFullscreen.call(document).catch(() => {});
// // //         setIsFullscreen(false);
// // //       }
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     const handleFullscreenChange = () => {
// // //       const isCurrentlyFullscreen =
// // //         !!document.fullscreenElement ||
// // //         !!(document as any).webkitFullscreenElement ||
// // //         !!(document as any).mozFullScreenElement ||
// // //         !!(document as any).msFullscreenElement;
// // //       setIsFullscreen(isCurrentlyFullscreen);
// // //     };

// // //     document.addEventListener("fullscreenchange", handleFullscreenChange);
// // //     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
// // //     document.addEventListener("mozfullscreenchange", handleFullscreenChange);
// // //     document.addEventListener("MSFullscreenChange", handleFullscreenChange);

// // //     return () => {
// // //       document.removeEventListener("fullscreenchange", handleFullscreenChange);
// // //       document.removeEventListener(
// // //         "webkitfullscreenchange",
// // //         handleFullscreenChange
// // //       );
// // //       document.removeEventListener(
// // //         "mozfullscreenchange",
// // //         handleFullscreenChange
// // //       );
// // //       document.removeEventListener(
// // //         "MSFullscreenChange",
// // //         handleFullscreenChange
// // //       );
// // //     };
// // //   }, []);

// // //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     const newVolume = Number.parseFloat(e.target.value);
// // //     setVolume(newVolume);
// // //     if (videoRef.current) {
// // //       videoRef.current.volume = newVolume;
// // //     }
// // //   };

// // //   const handleTimeUpdate = () => {
// // //     if (videoRef.current) {
// // //       setCurrentTime(videoRef.current.currentTime);
// // //     }
// // //   };

// // //   const handleLoadedMetadata = () => {
// // //     if (videoRef.current) {
// // //       setDuration(videoRef.current.duration);
// // //       restoreVideoProgress();
// // //     }
// // //   };

// // //   const formatTime = (time: number) => {
// // //     const minutes = Math.floor(time / 60);
// // //     const seconds = Math.floor(time % 60);
// // //     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
// // //   };

// // //   const handleVideoTap = (
// // //     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
// // //   ) => {
// // //     const now = Date.now();
// // //     const tapX = "touches" in e ? e.touches[0].clientX : e.clientX;
// // //     const DOUBLE_TAP_DELAY = 300;
// // //     const videoWidth = videoRef.current?.offsetWidth || 1;
// // //     const isLeftSide = tapX < videoWidth / 3;
// // //     const isRightSide = tapX > (2 * videoWidth) / 3;

// // //     if (
// // //       lastTapRef.current &&
// // //       now - lastTapRef.current.time < DOUBLE_TAP_DELAY
// // //     ) {
// // //       if (videoRef.current) {
// // //         const newTime = isLeftSide
// // //           ? Math.max(0, videoRef.current.currentTime - 10)
// // //           : isRightSide
// // //           ? Math.min(
// // //               videoRef.current.duration,
// // //               videoRef.current.currentTime + 10
// // //             )
// // //           : videoRef.current.currentTime;
// // //         videoRef.current.currentTime = newTime;
// // //         setCurrentTime(newTime);
// // //       }
// // //       setShowControls(true);
// // //       lastTapRef.current = null;
// // //     } else {
// // //       lastTapRef.current = {time: now, x: tapX};
// // //       setTimeout(() => {
// // //         if (lastTapRef.current && now === lastTapRef.current.time) {
// // //           togglePlay();
// // //           setShowControls(true);
// // //         }
// // //         lastTapRef.current = null;
// // //       }, DOUBLE_TAP_DELAY);
// // //     }
// // //   };

// // //   const FallbackPoster = () => {
// // //     if (!thumbnail || isPlaying || posterError) return null;

// // //     const posterUrl = thumbnail.startsWith("http")
// // //       ? thumbnail
// // //       : `https://texagonbackend.onrender.com${thumbnail}`;

// // //     return (
// // //       <div
// // //         className="absolute inset-0 flex items-center justify-center bg-gray-200"
// // //         onClick={togglePlay}>
// // //         <img
// // //           ref={posterImgRef}
// // //           src={posterUrl}
// // //           alt="Video thumbnail"
// // //           className="w-full h-full object-cover"
// // //           onLoad={() => {
// // //             setPosterError(false);
// // //           }}
// // //           onError={() => {
// // //             setPosterError(true);
// // //           }}
// // //           onClick={(e) => {
// // //             e.stopPropagation();
// // //             togglePlay();
// // //           }}
// // //         />
// // //         {!posterError && (
// // //           <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
// // //             <Play className="h-16 w-16 text-white" />
// // //           </div>
// // //         )}
// // //       </div>
// // //     );
// // //   };

// // //   return (
// // //     <Dialog open={isOpen} onOpenChange={onClose}>
// // //       <DialogContent className="bg-[#00000020] w-[95vw] max-w-[1200px] h-auto max-h-[95vh] flex flex-col mx-auto p-0 border-none shadow-[#00000020] shadow-sm">
// // //         <DialogHeader className="bg-white p-2 sm:px-4 rounded-sm">
// // //           <DialogTitle className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold">
// // //             {title}
// // //           </DialogTitle>
// // //         </DialogHeader>

// // //         <div className="flex-1 overflow-y-auto">
// // //           <div className="space-y-3 sm:space-y-4">
// // //             <div className="relative bg-black rounded-lg overflow-hidden">
// // //               <video
// // //                 ref={videoRef}
// // //                 className="w-full aspect-video object-contain"
// // //                 onTimeUpdate={handleTimeUpdate}
// // //                 onLoadedMetadata={handleLoadedMetadata}
// // //                 onEnded={() => setIsPlaying(false)}
// // //                 onClick={handleVideoTap}
// // //                 onTouchStart={handleVideoTap}
// // //                 poster={thumbnail ? undefined : "/banner-1.jpg"}
// // //                 controls={false}
// // //                 preload="metadata"
// // //                 controlsList="nodownload nofullscreen noremoteplayback"
// // //                 disablePictureInPicture
// // //                 onContextMenu={(e) => e.preventDefault()}>
// // //                 <source src={videoUrl} type="video/mp4" />
// // //                 Your browser does not support the video tag.
// // //               </video>

// // //               {!isPlaying && <FallbackPoster />}

// // //               <div
// // //                 className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 xs:p-3 sm:p-4 transition-opacity duration-300 ${
// // //                   showControls ? "opacity-100" : "opacity-0 pointer-events-none"
// // //                 }`}
// // //                 onClick={(e) => e.stopPropagation()}
// // //                 onTouchStart={(e) => e.stopPropagation()}>
// // //                 {showContinueTooltip && (
// // //                   <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded">
// // //                     Continue Watching
// // //                   </div>
// // //                 )}
// // //                 <div className="bg-[#000000a4] flex flex-wrap items-center justify-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-full text-white shadow-xl">
// // //                   <Button
// // //                     variant="ghost"
// // //                     size="sm"
// // //                     onClick={togglePlay}
// // //                     className="p-1 xs:p-2 hover:bg-white/20">
// // //                     {isPlaying ? (
// // //                       <Pause className="h-3 w-3 xs:h-4 xs:w-4" />
// // //                     ) : (
// // //                       <Play className="h-3 w-3 xs:h-4 xs:w-4" />
// // //                     )}
// // //                   </Button>

// // //                   <div className="flex-1 min-w-[100px] xs:min-w-[120px] sm:min-w-[150px]">
// // //                     <input
// // //                       type="range"
// // //                       min="0"
// // //                       max={duration}
// // //                       value={currentTime}
// // //                       onChange={(e) => {
// // //                         const time = Number.parseFloat(e.target.value);
// // //                         setCurrentTime(time);
// // //                         if (videoRef.current) {
// // //                           videoRef.current.currentTime = time;
// // //                         }
// // //                         setShowControls(true);
// // //                         setShowContinueTooltip(false);
// // //                       }}
// // //                       className={`w-full h-1 xs:h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full touch-none`}
// // //                     />
// // //                   </div>

// // //                   <span className="text-white text-xs xs:text-sm whitespace-nowrap">
// // //                     {formatTime(currentTime)} / {formatTime(duration)}
// // //                   </span>

// // //                   <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
// // //                     <Button
// // //                       variant="ghost"
// // //                       size="sm"
// // //                       onClick={toggleMute}
// // //                       className="p-1 xs:p-2 hover:bg-white/20">
// // //                       {isMuted ? (
// // //                         <VolumeX className="h-3 w-3 xs:h-4 xs:w-4" />
// // //                       ) : (
// // //                         <Volume2 className="h-3 w-3 xs:h-4 xs:w-4" />
// // //                       )}
// // //                     </Button>
// // //                     <input
// // //                       type="range"
// // //                       min="0"
// // //                       max="1"
// // //                       step="0.1"
// // //                       value={volume}
// // //                       onChange={handleVolumeChange}
// // //                       className={`w-10 xs:w-12 sm:w-16 h-1 xs:h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full touch-none`}
// // //                     />
// // //                   </div>

// // //                   <Button
// // //                     variant="ghost"
// // //                     size="sm"
// // //                     onClick={toggleFullscreen}
// // //                     className="p-1 xs:p-2 hover:bg-white/20">
// // //                     {isFullscreen ? (
// // //                       <Minimize className="h-3 w-3 xs:h-4 xs:w-4" />
// // //                     ) : (
// // //                       <Maximize className="h-3 w-3 xs:h-4 xs:w-4" />
// // //                     )}
// // //                   </Button>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </DialogContent>

// // //       {/* CSS FIX TO COMPLETELY HIDE BROWSER DOWNLOAD BUTTON */}
// // //       <style jsx global>{`
// // //         video::-internal-media-controls-download-button {
// // //           display: none !important;
// // //         }
// // //         video::-webkit-media-controls-enclosure {
// // //           overflow: hidden !important;
// // //         }
// // //       `}</style>
// // //     </Dialog>
// // //   );
// // // }
// // "use client";

// // import {useState, useRef, useEffect} from "react";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {Button} from "@/components/ui/button";
// // import {Play, Pause, Volume2, VolumeX, Maximize, Minimize} from "lucide-react";

// // interface VideoModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   title: string;
// //   videoUrl?: string;
// //   thumbnail?: string | null;
// // }

// // export function VideoModal({
// //   isOpen,
// //   onClose,
// //   title,
// //   videoUrl,
// //   thumbnail,
// // }: VideoModalProps) {
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [volume, setVolume] = useState(1);
// //   const [isMuted, setIsMuted] = useState(false);
// //   const [isFullscreen, setIsFullscreen] = useState(false);
// //   const [showControls, setShowControls] = useState(true);
// //   const [showContinueTooltip, setShowContinueTooltip] = useState(false);
// //   const [posterError, setPosterError] = useState(false);

// //   const videoRef = useRef<HTMLVideoElement>(null);
// //   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// //   const lastTapRef = useRef<{time: number; x: number} | null>(null);
// //   const posterImgRef = useRef<HTMLImageElement>(null);

// //   // ------------------ Poster Handling ------------------
// //   useEffect(() => {
// //     const validateAndSetPoster = async () => {
// //       if (!thumbnail) {
// //         setPosterError(true);
// //         return;
// //       }
// //       setPosterError(false);
// //       const posterUrl = thumbnail.startsWith("http")
// //         ? thumbnail
// //         : `https://texagonbackend.onrender.com${thumbnail}`;
// //       const img = new Image();
// //       img.onload = () => {
// //         if (videoRef.current && !isPlaying) videoRef.current.poster = posterUrl;
// //       };
// //       img.onerror = () => setPosterError(true);
// //       img.src = posterUrl;
// //     };

// //     if (isOpen && videoUrl) validateAndSetPoster();

// //     return () => {
// //       if (posterImgRef.current) {
// //         posterImgRef.current.onload = null;
// //         posterImgRef.current.onerror = null;
// //       }
// //     };
// //   }, [thumbnail, isOpen, videoUrl, isPlaying]);

// //   // ------------------ Progress Save/Restore ------------------
// //   const saveVideoProgress = () => {
// //     if (videoRef.current && videoUrl) {
// //       try {
// //         localStorage.setItem(
// //           `video-progress-${videoUrl}`,
// //           videoRef.current.currentTime.toString()
// //         );
// //       } catch {}
// //     }
// //   };

// //   const restoreVideoProgress = () => {
// //     if (videoRef.current && videoUrl) {
// //       try {
// //         const savedTime = localStorage.getItem(`video-progress-${videoUrl}`);
// //         if (savedTime && Number.parseFloat(savedTime) > 0) {
// //           videoRef.current.currentTime = Number.parseFloat(savedTime);
// //           setCurrentTime(Number.parseFloat(savedTime));
// //           setShowContinueTooltip(true);
// //           setTimeout(() => setShowContinueTooltip(false), 2000);
// //         }
// //       } catch {}
// //     }
// //   };

// //   useEffect(() => {
// //     if (isPlaying && showControls) {
// //       controlsTimeoutRef.current = setTimeout(
// //         () => setShowControls(false),
// //         3000
// //       );
// //     }
// //     return () => {
// //       if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
// //     };
// //   }, [isPlaying, showControls]);

// //   useEffect(() => {
// //     if (!isPlaying) saveVideoProgress();
// //   }, [isPlaying]);

// //   useEffect(() => {
// //     if (!isOpen) {
// //       saveVideoProgress();
// //       setIsPlaying(false);
// //       setShowControls(true);
// //       setPosterError(false);
// //     } else restoreVideoProgress();
// //   }, [isOpen, videoUrl]);

// //   // ------------------ Controls ------------------
// //   const togglePlay = () => {
// //     if (!videoRef.current) return;
// //     if (isPlaying) videoRef.current.pause();
// //     else videoRef.current.play().catch(() => {});
// //     setIsPlaying(!isPlaying);
// //     setShowControls(true);
// //     setShowContinueTooltip(false);
// //   };

// //   const toggleMute = () => {
// //     if (videoRef.current) videoRef.current.muted = !isMuted;
// //     setIsMuted(!isMuted);
// //   };

// //   const toggleFullscreen = () => {
// //     if (!videoRef.current) return;
// //     if (!isFullscreen) {
// //       const requestFullscreen =
// //         videoRef.current.requestFullscreen ||
// //         (videoRef.current as any).webkitRequestFullscreen;
// //       if (requestFullscreen)
// //         requestFullscreen.call(videoRef.current).catch(() => {});
// //       setIsFullscreen(true);
// //     } else {
// //       const exitFullscreen =
// //         document.exitFullscreen || (document as any).webkitExitFullscreen;
// //       if (exitFullscreen) exitFullscreen.call(document).catch(() => {});
// //       setIsFullscreen(false);
// //     }
// //   };

// //   useEffect(() => {
// //     const handleFullscreenChange = () => {
// //       setIsFullscreen(
// //         !!document.fullscreenElement ||
// //           !!(document as any).webkitFullscreenElement
// //       );
// //     };
// //     document.addEventListener("fullscreenchange", handleFullscreenChange);
// //     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
// //     return () => {
// //       document.removeEventListener("fullscreenchange", handleFullscreenChange);
// //       document.removeEventListener(
// //         "webkitfullscreenchange",
// //         handleFullscreenChange
// //       );
// //     };
// //   }, []);

// //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const newVolume = Number.parseFloat(e.target.value);
// //     setVolume(newVolume);
// //     if (videoRef.current) videoRef.current.volume = newVolume;
// //   };

// //   const handleTimeUpdate = () => {
// //     if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
// //   };

// //   const handleLoadedMetadata = () => {
// //     if (videoRef.current) {
// //       setDuration(videoRef.current.duration);
// //       restoreVideoProgress();
// //     }
// //   };

// //   const formatTime = (time: number) => {
// //     const minutes = Math.floor(time / 60);
// //     const seconds = Math.floor(time % 60);
// //     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
// //   };

// //   const handleVideoTap = (
// //     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
// //   ) => {
// //     const now = Date.now();
// //     const tapX = "touches" in e ? e.touches[0].clientX : e.clientX;
// //     const DOUBLE_TAP_DELAY = 300;
// //     const videoWidth = videoRef.current?.offsetWidth || 1;
// //     const isLeftSide = tapX < videoWidth / 3;
// //     const isRightSide = tapX > (2 * videoWidth) / 3;

// //     if (
// //       lastTapRef.current &&
// //       now - lastTapRef.current.time < DOUBLE_TAP_DELAY
// //     ) {
// //       if (videoRef.current) {
// //         const newTime = isLeftSide
// //           ? Math.max(0, videoRef.current.currentTime - 10)
// //           : isRightSide
// //           ? Math.min(
// //               videoRef.current.duration,
// //               videoRef.current.currentTime + 10
// //             )
// //           : videoRef.current.currentTime;
// //         videoRef.current.currentTime = newTime;
// //         setCurrentTime(newTime);
// //       }
// //       setShowControls(true);
// //       lastTapRef.current = null;
// //     } else {
// //       lastTapRef.current = {time: now, x: tapX};
// //       setTimeout(() => {
// //         if (lastTapRef.current && now === lastTapRef.current.time) {
// //           togglePlay();
// //           setShowControls(true);
// //         }
// //         lastTapRef.current = null;
// //       }, DOUBLE_TAP_DELAY);
// //     }
// //   };

// //   const FallbackPoster = () => {
// //     if (!thumbnail || isPlaying || posterError) return null;
// //     const posterUrl = thumbnail.startsWith("http")
// //       ? thumbnail
// //       : `https://texagonbackend.onrender.com${thumbnail}`;
// //     return (
// //       <div
// //         className="absolute inset-0 flex items-center justify-center bg-gray-900 cursor-pointer"
// //         onClick={togglePlay}>
// //         <img
// //           ref={posterImgRef}
// //           src={posterUrl}
// //           alt="Video thumbnail"
// //           className="w-full h-full object-cover"
// //           onLoad={() => setPosterError(false)}
// //           onError={() => setPosterError(true)}
// //         />
// //         {!posterError && (
// //           <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-opacity">
// //             <Play className="h-20 w-20 text-white drop-shadow-lg" />
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   return (
// //     <Dialog open={isOpen} onOpenChange={onClose}>
// //       <DialogContent className="bg-black w-[95vw] max-w-[1200px] h-auto max-h-[95vh] flex flex-col mx-auto p-0 rounded-lg overflow-hidden shadow-lg">
// //         <DialogHeader className="bg-gray-900 px-4 py-2">
// //           <DialogTitle className="text-white font-semibold text-lg sm:text-xl">
// //             {title}
// //           </DialogTitle>
// //         </DialogHeader>

// //         <div
// //           className="flex-1 relative bg-black"
// //           onMouseEnter={() => setShowControls(true)}
// //           onMouseLeave={() => {
// //             if (isPlaying) {
// //               if (controlsTimeoutRef.current)
// //                 clearTimeout(controlsTimeoutRef.current);
// //               controlsTimeoutRef.current = setTimeout(
// //                 () => setShowControls(false),
// //                 3000
// //               );
// //             }
// //           }}>
// //           <video
// //             ref={videoRef}
// //             className="w-full aspect-video object-contain"
// //             onTimeUpdate={handleTimeUpdate}
// //             onLoadedMetadata={handleLoadedMetadata}
// //             onEnded={() => setIsPlaying(false)}
// //             onClick={handleVideoTap}
// //             onTouchStart={handleVideoTap}
// //             poster={thumbnail ? undefined : "/banner-1.jpg"}
// //             controls={false}
// //             preload="metadata"
// //             controlsList="nodownload nofullscreen noremoteplayback"
// //             disablePictureInPicture
// //             onContextMenu={(e) => e.preventDefault()}>
// //             <source src={videoUrl} type="video/mp4" />
// //             Your browser does not support the video tag.
// //           </video>

// //           {!isPlaying && <FallbackPoster />}

// //           {/* Controls */}
// //           <div
// //             className={`absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
// //               showControls ? "opacity-100" : "opacity-0 pointer-events-none"
// //             }`}>
// //             {showContinueTooltip && (
// //               <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded">
// //                 Continue Watching
// //               </div>
// //             )}

// //             <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
// //               {/* Left: Play / Pause */}
// //               <div className="flex items-center gap-2">
// //                 <Button
// //                   variant="ghost"
// //                   size="sm"
// //                   onClick={togglePlay}
// //                   className="p-2 hover:bg-white/20">
// //                   {isPlaying ? (
// //                     <Pause className="h-5 w-5 text-white" />
// //                   ) : (
// //                     <Play className="h-5 w-5 text-white" />
// //                   )}
// //                 </Button>
// //               </div>

// //               {/* Center: Progress */}
// //               <div className="flex-1 flex items-center gap-2">
// //                 <span className="text-white text-xs sm:text-sm">
// //                   {formatTime(currentTime)}
// //                 </span>
// //                 <input
// //                   type="range"
// //                   min={0}
// //                   max={duration}
// //                   value={currentTime}
// //                   onChange={(e) => {
// //                     const time = Number.parseFloat(e.target.value);
// //                     setCurrentTime(time);
// //                     if (videoRef.current) videoRef.current.currentTime = time;
// //                     setShowControls(true);
// //                     setShowContinueTooltip(false);
// //                   }}
// //                   className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
// //                 />
// //                 <span className="text-white text-xs sm:text-sm">
// //                   {formatTime(duration)}
// //                 </span>
// //               </div>

// //               {/* Right: Volume / Fullscreen */}
// //               <div className="flex items-center gap-2">
// //                 <Button
// //                   variant="ghost"
// //                   size="sm"
// //                   onClick={toggleMute}
// //                   className="p-2 hover:bg-white/20">
// //                   {isMuted ? (
// //                     <VolumeX className="h-5 w-5 text-white" />
// //                   ) : (
// //                     <Volume2 className="h-5 w-5 text-white" />
// //                   )}
// //                 </Button>
// //                 <input
// //                   type="range"
// //                   min={0}
// //                   max={1}
// //                   step={0.1}
// //                   value={volume}
// //                   onChange={handleVolumeChange}
// //                   className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
// //                 />
// //                 <Button
// //                   variant="ghost"
// //                   size="sm"
// //                   onClick={toggleFullscreen}
// //                   className="p-2 hover:bg-white/20">
// //                   {isFullscreen ? (
// //                     <Minimize className="h-5 w-5 text-white" />
// //                   ) : (
// //                     <Maximize className="h-5 w-5 text-white" />
// //                   )}
// //                 </Button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </DialogContent>

// //       {/* Hide browser download button */}
// //       <style jsx global>{`
// //         video::-internal-media-controls-download-button {
// //           display: none !important;
// //         }
// //         video::-webkit-media-controls-enclosure {
// //           overflow: hidden !important;
// //         }
// //       `}</style>
// //     </Dialog>
// //   );
// // }

// "use client";

// import {useState, useRef, useEffect} from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {Button} from "@/components/ui/button";
// import {
//   Play,
//   Pause,
//   Volume2,
//   VolumeX,
//   Maximize,
//   Minimize,
//   MoreHorizontal,
// } from "lucide-react";

// interface VideoModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   videoUrl?: string;
//   thumbnail?: string | null;
// }

// export function VideoModal({
//   isOpen,
//   onClose,
//   title,
//   videoUrl,
//   thumbnail,
// }: VideoModalProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [volume, setVolume] = useState(1);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const [showContinueTooltip, setShowContinueTooltip] = useState(false);
//   const [posterError, setPosterError] = useState(false);
//   const [showMoreMenu, setShowMoreMenu] = useState(false);
//   const [showCenterIcon, setShowCenterIcon] = useState<"play" | "pause" | null>(
//     null
//   );

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastTapRef = useRef<{time: number; x: number} | null>(null);
//   const posterImgRef = useRef<HTMLImageElement>(null);

//   // ------------------ Poster Handling ------------------
//   useEffect(() => {
//     const validateAndSetPoster = async () => {
//       if (!thumbnail) {
//         setPosterError(true);
//         return;
//       }
//       setPosterError(false);
//       const posterUrl = thumbnail.startsWith("http")
//         ? thumbnail
//         : `https://texagonbackend.onrender.com${thumbnail}`;
//       const img = new Image();
//       img.onload = () => {
//         if (videoRef.current && !isPlaying) videoRef.current.poster = posterUrl;
//       };
//       img.onerror = () => setPosterError(true);
//       img.src = posterUrl;
//     };

//     if (isOpen && videoUrl) validateAndSetPoster();

//     return () => {
//       if (posterImgRef.current) {
//         posterImgRef.current.onload = null;
//         posterImgRef.current.onerror = null;
//       }
//     };
//   }, [thumbnail, isOpen, videoUrl, isPlaying]);

//   // ------------------ Progress Save/Restore ------------------
//   const saveVideoProgress = () => {
//     if (videoRef.current && videoUrl) {
//       try {
//         localStorage.setItem(
//           `video-progress-${videoUrl}`,
//           videoRef.current.currentTime.toString()
//         );
//       } catch {}
//     }
//   };

//   const restoreVideoProgress = () => {
//     if (videoRef.current && videoUrl) {
//       try {
//         const savedTime = localStorage.getItem(`video-progress-${videoUrl}`);
//         if (savedTime && Number.parseFloat(savedTime) > 0) {
//           videoRef.current.currentTime = Number.parseFloat(savedTime);
//           setCurrentTime(Number.parseFloat(savedTime));
//           setShowContinueTooltip(true);
//           setTimeout(() => setShowContinueTooltip(false), 2000);
//         }
//       } catch {}
//     }
//   };

//   useEffect(() => {
//     if (isPlaying && showControls) {
//       controlsTimeoutRef.current = setTimeout(
//         () => setShowControls(false),
//         3000
//       );
//     }
//     return () => {
//       if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
//     };
//   }, [isPlaying, showControls]);

//   useEffect(() => {
//     if (!isPlaying) saveVideoProgress();
//   }, [isPlaying]);

//   useEffect(() => {
//     if (!isOpen) {
//       saveVideoProgress();
//       setIsPlaying(false);
//       setShowControls(true);
//       setPosterError(false);
//     } else restoreVideoProgress();
//   }, [isOpen, videoUrl]);

//   // ------------------ Controls ------------------
//   const togglePlay = () => {
//     if (!videoRef.current) return;
//     if (isPlaying) {
//       videoRef.current.pause();
//       setShowCenterIcon("pause");
//     } else {
//       videoRef.current.play().catch(() => {});
//       setShowCenterIcon("play");
//     }
//     setIsPlaying(!isPlaying);
//     setShowControls(true);
//     setShowContinueTooltip(false);

//     // Hide the big center icon after 500ms
//     setTimeout(() => setShowCenterIcon(null), 500);
//   };

//   const toggleMute = () => {
//     if (videoRef.current) videoRef.current.muted = !isMuted;
//     setIsMuted(!isMuted);
//   };

//   const toggleFullscreen = () => {
//     if (!videoRef.current) return;
//     if (!isFullscreen) {
//       const requestFullscreen =
//         videoRef.current.requestFullscreen ||
//         (videoRef.current as any).webkitRequestFullscreen;
//       if (requestFullscreen)
//         requestFullscreen.call(videoRef.current).catch(() => {});
//       setIsFullscreen(true);
//     } else {
//       const exitFullscreen =
//         document.exitFullscreen || (document as any).webkitExitFullscreen;
//       if (exitFullscreen) exitFullscreen.call(document).catch(() => {});
//       setIsFullscreen(false);
//     }
//   };

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(
//         !!document.fullscreenElement ||
//           !!(document as any).webkitFullscreenElement
//       );
//     };
//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener(
//         "webkitfullscreenchange",
//         handleFullscreenChange
//       );
//     };
//   }, []);

//   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newVolume = Number.parseFloat(e.target.value);
//     setVolume(newVolume);
//     if (videoRef.current) videoRef.current.volume = newVolume;
//   };

//   const handleTimeUpdate = () => {
//     if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
//   };

//   const handleLoadedMetadata = () => {
//     if (videoRef.current) {
//       setDuration(videoRef.current.duration);
//       restoreVideoProgress();
//     }
//   };

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
//   };

//   const handleVideoTap = (
//     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
//   ) => {
//     const now = Date.now();
//     const tapX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     const DOUBLE_TAP_DELAY = 300;
//     const videoWidth = videoRef.current?.offsetWidth || 1;
//     const isLeftSide = tapX < videoWidth / 3;
//     const isRightSide = tapX > (2 * videoWidth) / 3;

//     if (
//       lastTapRef.current &&
//       now - lastTapRef.current.time < DOUBLE_TAP_DELAY
//     ) {
//       if (videoRef.current) {
//         const newTime = isLeftSide
//           ? Math.max(0, videoRef.current.currentTime - 10)
//           : isRightSide
//           ? Math.min(
//               videoRef.current.duration,
//               videoRef.current.currentTime + 10
//             )
//           : videoRef.current.currentTime;
//         videoRef.current.currentTime = newTime;
//         setCurrentTime(newTime);
//       }
//       setShowControls(true);
//       lastTapRef.current = null;
//     } else {
//       lastTapRef.current = {time: now, x: tapX};
//       setTimeout(() => {
//         if (lastTapRef.current && now === lastTapRef.current.time) {
//           togglePlay();
//           setShowControls(true);
//         }
//         lastTapRef.current = null;
//       }, DOUBLE_TAP_DELAY);
//     }
//   };

//   const FallbackPoster = () => {
//     if (!thumbnail || isPlaying || posterError) return null;
//     const posterUrl = thumbnail.startsWith("http")
//       ? thumbnail
//       : `https://texagonbackend.onrender.com${thumbnail}`;
//     return (
//       <div
//         className="absolute inset-0 flex items-center justify-center bg-gray-900 cursor-pointer"
//         onClick={togglePlay}>
//         <img
//           ref={posterImgRef}
//           src={posterUrl}
//           alt="Video thumbnail"
//           className="w-full h-full object-cover"
//           onLoad={() => setPosterError(false)}
//           onError={() => setPosterError(true)}
//         />
//         {!posterError && (
//           <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-opacity">
//             <Play className="h-20 w-20 text-white drop-shadow-lg" />
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="bg-black w-[95vw] max-w-[1200px] h-auto max-h-[95vh] flex flex-col mx-auto p-0 rounded-lg overflow-hidden shadow-lg">
//         <DialogHeader className="bg-gray-900 px-4 py-2">
//           <DialogTitle className="text-white font-semibold text-lg sm:text-xl">
//             {title}
//           </DialogTitle>
//         </DialogHeader>

//         <div
//           className="flex-1 relative bg-black"
//           onMouseEnter={() => setShowControls(true)}
//           onMouseLeave={() => {
//             if (isPlaying) {
//               if (controlsTimeoutRef.current)
//                 clearTimeout(controlsTimeoutRef.current);
//               controlsTimeoutRef.current = setTimeout(
//                 () => setShowControls(false),
//                 3000
//               );
//             }
//           }}>
//           <video
//             ref={videoRef}
//             className="w-full aspect-video object-contain"
//             onTimeUpdate={handleTimeUpdate}
//             onLoadedMetadata={handleLoadedMetadata}
//             onEnded={() => setIsPlaying(false)}
//             onClick={handleVideoTap}
//             onTouchStart={handleVideoTap}
//             poster={thumbnail ? undefined : "/banner-1.jpg"}
//             controls={false}
//             preload="metadata"
//             controlsList="nodownload noremoteplayback"
//             disablePictureInPicture
//             onContextMenu={(e) => e.preventDefault()}>
//             <source src={videoUrl} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>

//           {!isPlaying && <FallbackPoster />}

//           {/* Big center play/pause icon */}
//           {showCenterIcon && (
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//               {showCenterIcon === "play" ? (
//                 <Play className="h-24 w-24 text-white/90 drop-shadow-lg" />
//               ) : (
//                 <Pause className="h-24 w-24 text-white/90 drop-shadow-lg" />
//               )}
//             </div>
//           )}

//           {/* Desktop controls */}
//           <div
//             className={`hidden sm:flex absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4 transition-opacity duration-300 ${
//               showControls ? "opacity-100" : "opacity-0 pointer-events-none"
//             }`}>
//             <div className="flex flex-1 items-center gap-2">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={togglePlay}
//                 className="p-1 hover:bg-white/20 text-white">
//                 {isPlaying ? (
//                   <Pause className="h-4 w-4" />
//                 ) : (
//                   <Play className="h-4 w-4" />
//                 )}
//               </Button>
//               <input
//                 type="range"
//                 min={0}
//                 max={duration}
//                 value={currentTime}
//                 onChange={(e) => {
//                   const time = Number.parseFloat(e.target.value);
//                   setCurrentTime(time);
//                   if (videoRef.current) videoRef.current.currentTime = time;
//                 }}
//                 className="flex-1 h-1 bg-white/50 rounded-full appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
//               />
//               <span className="text-white text-xs">
//                 {formatTime(currentTime)} / {formatTime(duration)}
//               </span>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={toggleMute}
//                 className="p-1 hover:bg-white/20 text-white">
//                 {isMuted ? (
//                   <VolumeX className="h-4 w-4" />
//                 ) : (
//                   <Volume2 className="h-4 w-4" />
//                 )}
//               </Button>
//               <input
//                 type="range"
//                 min={0}
//                 max={1}
//                 step={0.1}
//                 value={volume}
//                 onChange={handleVolumeChange}
//                 className="w-16 h-1 bg-white/50 rounded-full appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
//               />
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={toggleFullscreen}
//                 className="p-1 hover:bg-white/20 text-white">
//                 {isFullscreen ? (
//                   <Minimize className="h-4 w-4" />
//                 ) : (
//                   <Maximize className="h-4 w-4" />
//                 )}
//               </Button>
//             </div>
//           </div>

//           {/* Mobile controls */}
//           <div
//             className={`sm:hidden absolute bottom-0 left-0 right-0 px-2 pb-2 transition-opacity duration-300 ${
//               showControls ? "opacity-100" : "opacity-0 pointer-events-none"
//             }`}>
//             {/* Full-width progress bar */}
//             <input
//               type="range"
//               min={0}
//               max={duration}
//               value={currentTime}
//               onChange={(e) => {
//                 const time = Number.parseFloat(e.target.value);
//                 setCurrentTime(time);
//                 if (videoRef.current) videoRef.current.currentTime = time;
//                 setShowControls(true);
//               }}
//               className="w-full h-1 bg-white/50 rounded-lg appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
//             />

//             {/* Icon-only overlay */}
//             <div className="absolute bottom-3 left-2 right-2 flex justify-between items-center">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={togglePlay}
//                 className="p-2 hover:bg-white/20 rounded-full text-white">
//                 {isPlaying ? (
//                   <Pause className="h-5 w-5" />
//                 ) : (
//                   <Play className="h-5 w-5" />
//                 )}
//               </Button>

//               <div className="relative">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="p-2 hover:bg-white/20 rounded-full text-white"
//                   onClick={() => setShowMoreMenu(!showMoreMenu)}>
//                   <MoreHorizontal className="h-5 w-5" />
//                 </Button>

//                 {showMoreMenu && (
//                   <div className="absolute bottom-10 right-0 bg-black/90 text-white text-sm rounded-md p-2 flex flex-col gap-2 shadow-lg">
//                     <button
//                       onClick={toggleMute}
//                       className="flex items-center gap-2 hover:text-gray-300">
//                       {isMuted ? (
//                         <VolumeX className="h-4 w-4" />
//                       ) : (
//                         <Volume2 className="h-4 w-4" />
//                       )}{" "}
//                       Mute
//                     </button>
//                     <button
//                       onClick={toggleFullscreen}
//                       className="flex items-center gap-2 hover:text-gray-300">
//                       {isFullscreen ? (
//                         <Minimize className="h-4 w-4" />
//                       ) : (
//                         <Maximize className="h-4 w-4" />
//                       )}{" "}
//                       Fullscreen
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </DialogContent>

//       <style jsx global>{`
//         /* Only hide download button */
//         video::-internal-media-controls-download-button {
//           display: none !important;
//         }
//         video::-webkit-media-controls-enclosure {
//           overflow: visible !important;
//         }
//       `}</style>
//     </Dialog>
//   );
// }
"use client";

import {useState, useRef, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MoreHorizontal,
} from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl?: string;
  thumbnail?: string | null;
}

export function VideoModal({
  isOpen,
  onClose,
  title,
  videoUrl,
  thumbnail,
}: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showContinueTooltip, setShowContinueTooltip] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState<"play" | "pause" | null>(
    null
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedOverlay, setShowSpeedOverlay] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{time: number; x: number} | null>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const speedGestureRef = useRef<{startX: number; initialSpeed: number} | null>(
    null
  );

  // ------------------ Poster Handling ------------------
  useEffect(() => {
    const validateAndSetPoster = async () => {
      if (!thumbnail) {
        setPosterError(true);
        return;
      }
      setPosterError(false);
      const posterUrl = thumbnail.startsWith("http")
        ? thumbnail
        : `https://texagonbackend.onrender.com${thumbnail}`;
      const img = new Image();
      img.onload = () => {
        if (videoRef.current && !isPlaying) videoRef.current.poster = posterUrl;
      };
      img.onerror = () => setPosterError(true);
      img.src = posterUrl;
    };

    if (isOpen && videoUrl) validateAndSetPoster();

    return () => {
      if (posterImgRef.current) {
        posterImgRef.current.onload = null;
        posterImgRef.current.onerror = null;
      }
    };
  }, [thumbnail, isOpen, videoUrl, isPlaying]);

  // ------------------ Progress Save/Restore ------------------
  const saveVideoProgress = () => {
    if (videoRef.current && videoUrl) {
      try {
        localStorage.setItem(
          `video-progress-${videoUrl}`,
          videoRef.current.currentTime.toString()
        );
      } catch {}
    }
  };

  const restoreVideoProgress = () => {
    if (videoRef.current && videoUrl) {
      try {
        const savedTime = localStorage.getItem(`video-progress-${videoUrl}`);
        if (savedTime && Number.parseFloat(savedTime) > 0) {
          videoRef.current.currentTime = Number.parseFloat(savedTime);
          setCurrentTime(Number.parseFloat(savedTime));
          setShowContinueTooltip(true);
          setTimeout(() => setShowContinueTooltip(false), 2000);
        }
      } catch {}
    }
  };

  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        3000
      );
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showControls]);

  useEffect(() => {
    if (!isPlaying) saveVideoProgress();
  }, [isPlaying]);

  useEffect(() => {
    if (!isOpen) {
      saveVideoProgress();
      setIsPlaying(false);
      setShowControls(true);
      setPosterError(false);
    } else restoreVideoProgress();
  }, [isOpen, videoUrl]);

  // ------------------ Controls ------------------
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setShowCenterIcon("pause");
    } else {
      videoRef.current.play().catch(() => {});
      setShowCenterIcon("play");
    }
    setIsPlaying(!isPlaying);
    setShowControls(true);
    setShowContinueTooltip(false);

    setTimeout(() => setShowCenterIcon(null), 500);
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!isFullscreen) {
      const requestFullscreen =
        videoRef.current.requestFullscreen ||
        (videoRef.current as any).webkitRequestFullscreen;
      if (requestFullscreen)
        requestFullscreen.call(videoRef.current).catch(() => {});
      setIsFullscreen(true);
    } else {
      const exitFullscreen =
        document.exitFullscreen || (document as any).webkitExitFullscreen;
      if (exitFullscreen) exitFullscreen.call(document).catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement ||
          !!(document as any).webkitFullscreenElement
      );
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      restoreVideoProgress();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // ------------------ Video Tap / Double Tap ------------------
  const handleVideoTap = (
    e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
  ) => {
    const now = Date.now();
    const tapX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const DOUBLE_TAP_DELAY = 300;
    const videoWidth = videoRef.current?.offsetWidth || 1;
    const isLeftSide = tapX < videoWidth / 3;
    const isRightSide = tapX > (2 * videoWidth) / 3;

    if (
      lastTapRef.current &&
      now - lastTapRef.current.time < DOUBLE_TAP_DELAY
    ) {
      if (videoRef.current) {
        const newTime = isLeftSide
          ? Math.max(0, videoRef.current.currentTime - 10)
          : isRightSide
          ? Math.min(
              videoRef.current.duration,
              videoRef.current.currentTime + 10
            )
          : videoRef.current.currentTime;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
      setShowControls(true);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = {time: now, x: tapX};
      setTimeout(() => {
        if (lastTapRef.current && now === lastTapRef.current.time) {
          togglePlay();
          setShowControls(true);
        }
        lastTapRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  // ------------------ Click/Tap & Hold for Speed ------------------
  const handleSpeedStart = (
    e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
  ) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    speedGestureRef.current = {startX: clientX, initialSpeed: playbackSpeed};
    setShowSpeedOverlay(true);
  };

  const handleSpeedMove = (
    e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
  ) => {
    if (!speedGestureRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - speedGestureRef.current.startX;
    let newSpeed = speedGestureRef.current.initialSpeed + delta / 200;
    newSpeed = Math.min(Math.max(newSpeed, 0.25), 3);
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
  };

  const handleSpeedEnd = () => {
    speedGestureRef.current = null;
    setShowSpeedOverlay(false);
  };

  // ------------------ Keyboard Controls ------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPlaying]);

  // ------------------ Fallback Poster ------------------
  const FallbackPoster = () => {
    if (!thumbnail || isPlaying || posterError) return null;
    const posterUrl = thumbnail.startsWith("http")
      ? thumbnail
      : `https://texagonbackend.onrender.com${thumbnail}`;
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-gray-900 cursor-pointer"
        onClick={togglePlay}>
        <img
          ref={posterImgRef}
          src={posterUrl}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
          onLoad={() => setPosterError(false)}
          onError={() => setPosterError(true)}
        />
        {!posterError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-opacity">
            <Play className="h-20 w-20 text-white drop-shadow-lg" />
          </div>
        )}
      </div>
    );
  };

  // ------------------ Render ------------------
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black w-[95vw] max-w-[1200px] h-auto max-h-[95vh] flex flex-col mx-auto p-0 rounded-lg overflow-hidden shadow-lg">
        <DialogHeader className="bg-gray-900 px-4 py-2">
          <DialogTitle className="text-white font-semibold text-lg sm:text-xl">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div
          className="flex-1 relative bg-black w-full h-full"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => {
            if (isPlaying) {
              if (controlsTimeoutRef.current)
                clearTimeout(controlsTimeoutRef.current);
              controlsTimeoutRef.current = setTimeout(
                () => setShowControls(false),
                3000
              );
            }
          }}>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={handleVideoTap}
            onTouchStart={(e) => {
              handleVideoTap(e);
              handleSpeedStart(e);
            }}
            onTouchMove={handleSpeedMove}
            onTouchEnd={handleSpeedEnd}
            onMouseDown={handleSpeedStart}
            onMouseMove={handleSpeedMove}
            onMouseUp={handleSpeedEnd}
            poster={thumbnail ? undefined : "/banner-1.jpg"}
            controls={false}
            preload="metadata"
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}>
            <source src={videoUrl} type="video/mp4" />
          </video>

          {!isPlaying && <FallbackPoster />}

          {/* Big center play/pause icon */}
          {showCenterIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {showCenterIcon === "play" ? (
                <Play className="h-24 w-24 text-white/90 drop-shadow-lg" />
              ) : (
                <Pause className="h-24 w-24 text-white/90 drop-shadow-lg" />
              )}
            </div>
          )}

          {/* Playback speed overlay */}
          {showSpeedOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white text-lg px-4 py-2 rounded-lg drop-shadow-lg">
                {playbackSpeed.toFixed(2)}x
              </div>
            </div>
          )}

          {/* Desktop controls */}
          <div
            className={`hidden sm:flex absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}>
            <div className="flex flex-1 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="p-1 hover:bg-white/20 text-white">
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => {
                  const time = Number.parseFloat(e.target.value);
                  setCurrentTime(time);
                  if (videoRef.current) videoRef.current.currentTime = time;
                }}
                className="flex-1 h-1 bg-white/50 rounded-full appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="p-1 hover:bg-white/20 text-white">
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/50 rounded-full appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="p-1 hover:bg-white/20 text-white">
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile controls */}
          <div
            className={`sm:hidden absolute bottom-0 left-0 right-0 px-2 pb-2 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}>
            {/* Full-width progress bar */}
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => {
                const time = Number.parseFloat(e.target.value);
                setCurrentTime(time);
                if (videoRef.current) videoRef.current.currentTime = time;
                setShowControls(true);
              }}
              className="w-full h-1 bg-white/50 rounded-lg appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />

            {/* Icon-only overlay */}
            <div className="absolute bottom-3 left-2 right-2 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-full text-white">
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-white/20 rounded-full text-white"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>

                {showMoreMenu && (
                  <div className="absolute bottom-10 right-0 bg-black/90 text-white text-sm rounded-md p-2 flex flex-col gap-2 shadow-lg">
                    <button
                      onClick={toggleMute}
                      className="flex items-center gap-2 hover:text-gray-300">
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}{" "}
                      Mute
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="flex items-center gap-2 hover:text-gray-300">
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}{" "}
                      Fullscreen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <style jsx global>{`
        video::-internal-media-controls-download-button {
          display: none !important;
        }
        video::-webkit-media-controls-enclosure {
          overflow: hidden !important;
        }
      `}</style>
    </Dialog>
  );
}
