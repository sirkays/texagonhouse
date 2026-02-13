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

// // //       const fullUrl = `process.env.BASE_URL${thumbnail}`;
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
// // //         : `process.env.BASE_URL${thumbnail}`;

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
// // //       : `process.env.BASE_URL${thumbnail}`;

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
//   const [playbackSpeed, setPlaybackSpeed] = useState(1);
//   const [showSpeedOverlay, setShowSpeedOverlay] = useState(false);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastTapRef = useRef<{time: number; x: number} | null>(null);
//   const posterImgRef = useRef<HTMLImageElement>(null);
//   const speedGestureRef = useRef<{startX: number; initialSpeed: number} | null>(
//     null
//   );

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
//         : `process.env.BASE_URL${thumbnail}`;
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

//   // ------------------ Video Tap / Double Tap ------------------
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

//   // ------------------ Click/Tap & Hold for Speed ------------------
//   const handleSpeedStart = (
//     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
//   ) => {
//     const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     speedGestureRef.current = {startX: clientX, initialSpeed: playbackSpeed};
//     setShowSpeedOverlay(true);
//   };

//   const handleSpeedMove = (
//     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>
//   ) => {
//     if (!speedGestureRef.current) return;
//     const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     const delta = clientX - speedGestureRef.current.startX;
//     let newSpeed = speedGestureRef.current.initialSpeed + delta / 200;
//     newSpeed = Math.min(Math.max(newSpeed, 0.25), 3);
//     setPlaybackSpeed(newSpeed);
//     if (videoRef.current) videoRef.current.playbackRate = newSpeed;
//   };

//   const handleSpeedEnd = () => {
//     speedGestureRef.current = null;
//     setShowSpeedOverlay(false);
//   };

//   // ------------------ Keyboard Controls ------------------
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!isOpen) return;
//       if (e.code === "Space") {
//         e.preventDefault();
//         togglePlay();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, [isOpen, isPlaying]);

//   // ------------------ Fallback Poster ------------------
//   const FallbackPoster = () => {
//     if (!thumbnail || isPlaying || posterError) return null;
//     const posterUrl = thumbnail.startsWith("http")
//       ? thumbnail
//       : `process.env.BASE_URL${thumbnail}`;
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

//   // ------------------ Render ------------------
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="bg-black w-[95vw] max-w-[1200px] h-auto max-h-[95vh] flex flex-col mx-auto p-0 rounded-lg overflow-hidden shadow-lg">
//         <DialogHeader className="bg-gray-900 px-4 py-2">
//           <DialogTitle className="text-white font-semibold text-lg sm:text-xl">
//             {title}
//           </DialogTitle>
//         </DialogHeader>

//         <div
//           className="flex-1 relative bg-black w-full h-full"
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
//             className="w-full h-full object-contain"
//             onTimeUpdate={handleTimeUpdate}
//             onLoadedMetadata={handleLoadedMetadata}
//             onEnded={() => setIsPlaying(false)}
//             onClick={handleVideoTap}
//             onTouchStart={(e) => {
//               handleVideoTap(e);
//               handleSpeedStart(e);
//             }}
//             onTouchMove={handleSpeedMove}
//             onTouchEnd={handleSpeedEnd}
//             onMouseDown={handleSpeedStart}
//             onMouseMove={handleSpeedMove}
//             onMouseUp={handleSpeedEnd}
//             poster={thumbnail ? undefined : ""}
//             controls={false}
//             preload="metadata"
//             controlsList="nodownload noremoteplayback"
//             disablePictureInPicture
//             onContextMenu={(e) => e.preventDefault()}>
//             <source src={videoUrl} type="video/mp4" />
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

//           {/* Playback speed overlay */}
//           {showSpeedOverlay && (
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//               <div className="bg-black/70 text-white text-lg px-4 py-2 rounded-lg drop-shadow-lg">
//                 {playbackSpeed.toFixed(2)}x
//               </div>
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
//         video::-internal-media-controls-download-button {
//           display: none !important;
//         }
//         video::-webkit-media-controls-enclosure {
//           overflow: hidden !important;
//         }
//       `}</style>
//     </Dialog>
//   );
// }

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
//     null,
//   );
//   const [playbackSpeed, setPlaybackSpeed] = useState(1);
//   const [showSpeedOverlay, setShowSpeedOverlay] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastTapRef = useRef<{time: number; x: number} | null>(null);
//   const posterImgRef = useRef<HTMLImageElement>(null);
//   const speedGestureRef = useRef<{startX: number; initialSpeed: number} | null>(
//     null,
//   );
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
//         : `process.env.BASE_URL${thumbnail}`;
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
//           videoRef.current.currentTime.toString(),
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
//         3000,
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
//           !!(document as any).webkitFullscreenElement,
//       );
//     };
//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener(
//         "webkitfullscreenchange",
//         handleFullscreenChange,
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
//   // ------------------ Video Tap / Double Tap ------------------
//   const handleVideoTap = (
//     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>,
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
//             ? Math.min(
//                 videoRef.current.duration,
//                 videoRef.current.currentTime + 10,
//               )
//             : videoRef.current.currentTime;
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
//   // ------------------ Click/Tap & Hold for Speed ------------------
//   const handleSpeedStart = (
//     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>,
//   ) => {
//     const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     speedGestureRef.current = {startX: clientX, initialSpeed: playbackSpeed};
//     setShowSpeedOverlay(true);
//   };
//   const handleSpeedMove = (
//     e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>,
//   ) => {
//     if (!speedGestureRef.current) return;
//     const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     const delta = clientX - speedGestureRef.current.startX;
//     let newSpeed = speedGestureRef.current.initialSpeed + delta / 200;
//     newSpeed = Math.min(Math.max(newSpeed, 0.25), 3);
//     setPlaybackSpeed(newSpeed);
//     if (videoRef.current) videoRef.current.playbackRate = newSpeed;
//   };
//   const handleSpeedEnd = () => {
//     speedGestureRef.current = null;
//     setShowSpeedOverlay(false);
//   };
//   // ------------------ Keyboard Controls ------------------
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!isOpen) return;
//       if (e.code === "Space") {
//         e.preventDefault();
//         togglePlay();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, [isOpen, isPlaying]);
//   // ------------------ Fallback Poster ------------------
//   const FallbackPoster = () => {
//     if (isPlaying) return null;
//     return (
//       <div
//         className="absolute inset-0 flex items-center justify-center bg-black cursor-pointer"
//         onClick={togglePlay}>
//         <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-opacity">
//           <Play className="h-20 w-20 text-white drop-shadow-lg" />
//         </div>
//       </div>
//     );
//   };
//   // ------------------ Render ------------------
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="bg-white w-[95vw] max-w-[1200px] h-auto max-h-[95vh] flex flex-col mx-auto p-0 rounded-lg overflow-hidden shadow-lg">
//         <DialogHeader className="bg-white px-4 py-2">
//           <DialogTitle className="text-slate-800 font-semibold text-lg sm:text-xl">
//             {title}
//           </DialogTitle>
//         </DialogHeader>
//         <div
//           className="flex-1 relative bg-black w-full h-full"
//           onMouseEnter={() => setShowControls(true)}
//           onMouseLeave={() => {
//             if (isPlaying) {
//               if (controlsTimeoutRef.current)
//                 clearTimeout(controlsTimeoutRef.current);
//               controlsTimeoutRef.current = setTimeout(
//                 () => setShowControls(false),
//                 3000,
//               );
//             }
//           }}>
//           <video
//             ref={videoRef}
//             className="w-full h-full object-contain"
//             onTimeUpdate={handleTimeUpdate}
//             onLoadedMetadata={handleLoadedMetadata}
//             onEnded={() => setIsPlaying(false)}
//             onClick={handleVideoTap}
//             onTouchStart={(e) => {
//               handleVideoTap(e);
//               handleSpeedStart(e);
//             }}
//             onTouchMove={handleSpeedMove}
//             onTouchEnd={handleSpeedEnd}
//             onMouseDown={handleSpeedStart}
//             onMouseMove={handleSpeedMove}
//             onMouseUp={handleSpeedEnd}
//             poster={thumbnail ? undefined : ""}
//             controls={false}
//             preload="metadata"
//             controlsList="nodownload noremoteplayback"
//             disablePictureInPicture
//             onContextMenu={(e) => e.preventDefault()}>
//             <source src={videoUrl} type="video/mp4" />
//           </video>
//           <FallbackPoster />
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
//           {/* Playback speed overlay */}
//           {showSpeedOverlay && (
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//               <div className="bg-black/70 text-white text-lg px-4 py-2 rounded-lg drop-shadow-lg">
//                 {playbackSpeed.toFixed(2)}x
//               </div>
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
//         video::-internal-media-controls-download-button {
//           display: none !important;
//         }
//         video::-webkit-media-controls-enclosure {
//           overflow: hidden !important;
//         }
//       `}</style>
//     </Dialog>
//   );
// }

"use client";

import {useReducer, useRef, useEffect, useCallback, useMemo} from "react";
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
  Maximize2,
  Minimize2,
  Settings,
  Volume1,
  SkipBack,
  SkipForward,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

// Types
type PlaybackState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
};

type UIState = {
  showControls: boolean;
  showSettings: boolean;
  showVolumeSlider: boolean;
  showPlaybackSpeedSubmenu: boolean;
  theaterMode: boolean;
  isFullscreen: boolean;
  showCenterIcon: "play" | "pause" | null;
  hoverTime: number;
  progressHover: boolean;
};

type InteractionState = {
  controlsTimeout: NodeJS.Timeout | null;
  animationFrame: number | null;
  lastActivity: number;
  doubleClickTimer: NodeJS.Timeout | null;
  lastClick: {
    time: number;
    x: number;
    side: "left" | "right" | "center";
  } | null;
  dragStart: number | null;
};

type PlayerState = PlaybackState & UIState & InteractionState;

type PlayerAction =
  | {type: "PLAY_TOGGLE"; payload?: {icon?: "play" | "pause"}}
  | {type: "SET_PLAYING"; payload: boolean}
  | {type: "SET_TIME"; payload: number}
  | {type: "SET_DURATION"; payload: number}
  | {type: "SET_VOLUME"; payload: number}
  | {type: "TOGGLE_MUTE"}
  | {type: "SET_SPEED"; payload: number}
  | {type: "SHOW_CONTROLS"; payload: boolean}
  | {type: "TOGGLE_SETTINGS"}
  | {type: "TOGGLE_VOLUME_SLIDER"}
  | {type: "TOGGLE_SPEED_SUBMENU"}
  | {type: "TOGGLE_THEATER"}
  | {type: "SET_FULLSCREEN"; payload: boolean}
  | {type: "SET_CENTER_ICON"; payload: "play" | "pause" | null}
  | {type: "SET_HOVER_TIME"; payload: number}
  | {type: "SET_PROGRESS_HOVER"; payload: boolean}
  | {type: "CLEAR_TIMEOUTS"}
  | {type: "SET_ANIMATION_FRAME"; payload: number | null}
  | {type: "UPDATE_LAST_ACTIVITY"}
  | {
      type: "SET_DOUBLE_CLICK";
      payload: {time: number; x: number; side: "left" | "right" | "center"};
    }
  | {type: "CLEAR_DOUBLE_CLICK"}
  | {type: "SET_DRAG_START"; payload: number | null};

const initialState: PlayerState = {
  // Playback
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  playbackSpeed: 1,
  // UI
  showControls: true,
  showSettings: false,
  showVolumeSlider: false,
  showPlaybackSpeedSubmenu: false,
  theaterMode: false,
  isFullscreen: false,
  showCenterIcon: null,
  hoverTime: 0,
  progressHover: false,
  // Interaction
  controlsTimeout: null,
  animationFrame: null,
  lastActivity: Date.now(),
  doubleClickTimer: null,
  lastClick: null,
  dragStart: null,
};

const playerReducer = (
  state: PlayerState,
  action: PlayerAction,
): PlayerState => {
  switch (action.type) {
    case "PLAY_TOGGLE":
      return {
        ...state,
        isPlaying: !state.isPlaying,
        showCenterIcon:
          action.payload?.icon || (!state.isPlaying ? "play" : "pause"),
      };
    case "SET_PLAYING":
      return {...state, isPlaying: action.payload};
    case "SET_TIME":
      return {...state, currentTime: action.payload};
    case "SET_DURATION":
      return {...state, duration: action.payload};
    case "SET_VOLUME":
      const newVolume = action.payload;
      return {
        ...state,
        volume: newVolume,
        isMuted: newVolume === 0,
      };
    case "TOGGLE_MUTE":
      return {
        ...state,
        isMuted: !state.isMuted,
        volume: state.isMuted ? state.volume || 1 : 0,
      };
    case "SET_SPEED":
      return {...state, playbackSpeed: action.payload};
    case "SHOW_CONTROLS":
      if (state.controlsTimeout) clearTimeout(state.controlsTimeout);
      return {...state, showControls: action.payload};
    case "TOGGLE_SETTINGS":
      return {...state, showSettings: !state.showSettings};
    case "TOGGLE_VOLUME_SLIDER":
      return {...state, showVolumeSlider: !state.showVolumeSlider};
    case "TOGGLE_SPEED_SUBMENU":
      return {
        ...state,
        showPlaybackSpeedSubmenu: !state.showPlaybackSpeedSubmenu,
      };
    case "TOGGLE_THEATER":
      return {...state, theaterMode: !state.theaterMode};
    case "SET_FULLSCREEN":
      return {...state, isFullscreen: action.payload};
    case "SET_CENTER_ICON":
      return {...state, showCenterIcon: action.payload};
    case "SET_HOVER_TIME":
      return {...state, hoverTime: action.payload};
    case "SET_PROGRESS_HOVER":
      return {...state, progressHover: action.payload};
    case "CLEAR_TIMEOUTS":
      if (state.controlsTimeout) clearTimeout(state.controlsTimeout);
      if (state.doubleClickTimer) clearTimeout(state.doubleClickTimer);
      return {...state, controlsTimeout: null, doubleClickTimer: null};
    case "SET_ANIMATION_FRAME":
      if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
      return {...state, animationFrame: action.payload};
    case "UPDATE_LAST_ACTIVITY":
      return {...state, lastActivity: Date.now()};
    case "SET_DOUBLE_CLICK":
      return {...state, lastClick: action.payload};
    case "CLEAR_DOUBLE_CLICK":
      return {...state, lastClick: null};
    case "SET_DRAG_START":
      return {...state, dragStart: action.payload};
    default:
      return state;
  }
};

// ProgressBar Component
interface ProgressBarProps {
  currentTime: number;
  duration: number;
  bufferedRanges: TimeRanges | null;
  onSeek: (time: number) => void;
  onHover: (time: number, hover: boolean) => void;
  hoverTime: number;
  progressHover: boolean;
}

function ProgressBar({
  currentTime,
  duration,
  bufferedRanges,
  onSeek,
  onHover,
  hoverTime,
  progressHover,
}: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const bufferedPercent = useMemo(() => {
    if (!bufferedRanges || bufferedRanges.length === 0) return 0;
    let buffered = 0;
    for (let i = 0; i < bufferedRanges.length; i++) {
      buffered += bufferedRanges.end(i) - bufferedRanges.start(i);
    }
    return (buffered / duration) * 100;
  }, [bufferedRanges, duration]);

  const playedPercent = useMemo(
    () => (currentTime / duration) * 100,
    [currentTime, duration],
  );
  const hoverPercent = useMemo(
    () => (hoverTime / duration) * 100,
    [hoverTime, duration],
  );

  const formatTime = useCallback((time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = Math.max(0, Math.min(duration, percent * duration));
      onHover(time, true);
    },
    [duration, onHover],
  );

  const handleMouseLeave = useCallback(() => onHover(0, false), [onHover]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = Math.max(0, Math.min(duration, percent * duration));
      onSeek(time);
    },
    [duration, onSeek],
  );

  return (
    <div
      ref={progressRef}
      className="relative h-1 w-full cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}>
      {/* Background */}
      <div className="absolute inset-0 h-full bg-gray-600 rounded-full" />
      {/* Buffered */}
      <div
        className="absolute inset-y-0 left-0 bg-gray-400 rounded-full"
        style={{width: `${bufferedPercent}%`}}
      />
      {/* Played */}
      <div
        className="absolute inset-y-0 left-0 bg-red-600 rounded-full"
        style={{width: `${playedPercent}%`}}
      />
      {/* Hover Preview */}
      {progressHover && (
        <div
          className="absolute inset-y-0 left-0 bg-red-800 rounded-full transition-all duration-100"
          style={{width: `${hoverPercent}%`}}
        />
      )}
      {/* Hover Timestamp */}
      {progressHover && (
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(hoverTime)}
        </div>
      )}
      {/* Thumb (hidden, use custom if needed) */}
      <div
        className="absolute inset-y-0 left-0 w-0 h-0"
        style={{left: `${playedPercent}%`}}
      />
    </div>
  );
}

// SettingsMenu Component
interface SettingsMenuProps {
  playbackSpeed: number;
  onSetSpeed: (speed: number) => void;
  showPlaybackSpeedSubmenu: boolean;
  onToggleSpeedSubmenu: () => void;
  onClose: () => void;
}

const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function SettingsMenu({
  playbackSpeed,
  onSetSpeed,
  showPlaybackSpeedSubmenu,
  onToggleSpeedSubmenu,
  onClose,
}: SettingsMenuProps) {
  return (
    <div className="absolute bottom-16 right-0 w-56 bg-black/90 text-white rounded-lg shadow-lg overflow-hidden border border-gray-700 animate-slide-in">
      {/* Playback Speed */}
      <button
        onClick={onToggleSpeedSubmenu}
        className="flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-white/10 transition-colors">
        Playback speed
        <span className="flex items-center gap-1">
          {playbackSpeed}x{" "}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showPlaybackSpeedSubmenu ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {showPlaybackSpeedSubmenu && (
        <div className="animate-slide-down bg-black/95">
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => {
                onSetSpeed(speed);
                onToggleSpeedSubmenu();
                onClose();
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${playbackSpeed === speed ? "bg-red-600" : ""}`}>
              {speed}x
            </button>
          ))}
        </div>
      )}
      {/* Quality (Stub) */}
      <button className="w-full px-4 py-3 text-sm hover:bg-white/10 transition-colors">
        Quality ▶
      </button>
    </div>
  );
}

// Controls Component
interface ControlsProps {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  formatTime: (time: number) => string;
  videoWidth: number;
}

function Controls({
  state,
  dispatch,
  onSeek,
  onVolumeChange,
  formatTime,
  videoWidth,
}: ControlsProps) {
  const handlePlayToggle = () => dispatch({type: "PLAY_TOGGLE"});
  const handleMuteToggle = () => dispatch({type: "TOGGLE_MUTE"});
  const handleVolumeHover = () => dispatch({type: "TOGGLE_VOLUME_SLIDER"});
  const handleSettingsToggle = () => dispatch({type: "TOGGLE_SETTINGS"});
  const handleTheaterToggle = () => dispatch({type: "TOGGLE_THEATER"});
  const handleFullscreenToggle = () => {
    // Fullscreen handled in main component
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 text-white">
      {/* Left Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayToggle}
          className="p-2 hover:bg-white/20 rounded-full">
          {state.isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMuteToggle}
            onMouseEnter={handleVolumeHover}
            className="p-2 hover:bg-white/20 rounded-full">
            {state.volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : state.volume < 0.5 ? (
              <Volume1 className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          {state.showVolumeSlider && (
            <div className="absolute left-0 bottom-8 w-24 animate-slide-in">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={state.volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/50 rounded-full appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          )}
        </div>
        <span className="text-sm">
          {formatTime(state.currentTime)} / {formatTime(state.duration)}
        </span>
      </div>
      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSettingsToggle}
          className="p-2 hover:bg-white/20 rounded-full relative">
          <Settings className="h-5 w-5" />
          {state.showSettings && (
            <SettingsMenu
              playbackSpeed={state.playbackSpeed}
              onSetSpeed={(speed) =>
                dispatch({type: "SET_SPEED", payload: speed})
              }
              showPlaybackSpeedSubmenu={state.showPlaybackSpeedSubmenu}
              onToggleSpeedSubmenu={() =>
                dispatch({type: "TOGGLE_SPEED_SUBMENU"})
              }
              onClose={() => dispatch({type: "TOGGLE_SETTINGS"})}
            />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTheaterToggle}
          className="p-2 hover:bg-white/20 rounded-full">
          {state.theaterMode ? "Exit theater mode" : "Theater mode"}
          {/* Icon stub */}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFullscreenToggle}
          className="p-2 hover:bg-white/20 rounded-full">
          {state.isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Main VideoModal Component
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
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Video width for double click
  const videoWidth = useMemo(
    () => containerRef.current?.clientWidth || 0,
    [isOpen],
  );

  // Format time utility
  const formatTime = useCallback((time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Smooth progress update with rAF
  useEffect(() => {
    let frame: number;
    const updateProgress = () => {
      if (videoRef.current && state.isPlaying) {
        dispatch({type: "SET_TIME", payload: videoRef.current.currentTime});
        frame = requestAnimationFrame(updateProgress);
        dispatch({type: "SET_ANIMATION_FRAME", payload: frame});
      }
    };
    if (state.isPlaying) {
      updateProgress();
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
      dispatch({type: "SET_ANIMATION_FRAME", payload: null});
    };
  }, [state.isPlaying]);

  // Auto-hide controls
  useEffect(() => {
    if (!isOpen) return;
    const handleActivity = () => {
      dispatch({type: "SHOW_CONTROLS", payload: true});
      dispatch({type: "UPDATE_LAST_ACTIVITY"});
      if (state.isPlaying && !state.showSettings) {
        const timeout = setTimeout(
          () => dispatch({type: "SHOW_CONTROLS", payload: false}),
          3000,
        );
        dispatch({type: "CLEAR_TIMEOUTS"});
        dispatch({type: "SHOW_CONTROLS", payload: true}); // Placeholder to avoid invalid dispatch
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleActivity);
      container.addEventListener("touchstart", handleActivity);
    }

    handleActivity();

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleActivity);
        container.removeEventListener("touchstart", handleActivity);
      }
      dispatch({type: "CLEAR_TIMEOUTS"});
    };
  }, [isOpen, state.isPlaying, state.showSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          dispatch({type: "PLAY_TOGGLE"});
          break;
        case "KeyJ":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 10,
          );
          break;
        case "KeyL":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(
            state.duration,
            videoRef.current.currentTime + 10,
          );
          break;
        case "ArrowLeft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 5,
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(
            state.duration,
            videoRef.current.currentTime + 5,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          const volUp = Math.min(1, state.volume + 0.1);
          dispatch({type: "SET_VOLUME", payload: volUp});
          break;
        case "ArrowDown":
          e.preventDefault();
          const volDown = Math.max(0, state.volume - 0.1);
          dispatch({type: "SET_VOLUME", payload: volDown});
          break;
        case "KeyM":
          e.preventDefault();
          dispatch({type: "TOGGLE_MUTE"});
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyT":
          e.preventDefault();
          dispatch({type: "TOGGLE_THEATER"});
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, state.volume, state.duration]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (!state.isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, [state.isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS =
        !!document.fullscreenElement ||
        !!(document as any).webkitFullscreenElement;
      dispatch({type: "SET_FULLSCREEN", payload: isFS});
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      dispatch({type: "SET_DURATION", payload: videoRef.current.duration});
    }
  }, []);

  const handlePlay = useCallback(() => {
    dispatch({type: "SET_PLAYING", payload: true});
    dispatch({type: "SET_CENTER_ICON", payload: "play"});
    setTimeout(() => dispatch({type: "SET_CENTER_ICON", payload: null}), 500);
  }, []);

  const handlePause = useCallback(() => {
    dispatch({type: "SET_PLAYING", payload: false});
    dispatch({type: "SET_CENTER_ICON", payload: "pause"});
    setTimeout(() => dispatch({type: "SET_CENTER_ICON", payload: null}), 500);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      dispatch({type: "SET_TIME", payload: videoRef.current.currentTime});
    }
  }, []);

  const handleSeeking = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (videoRef.current) {
        dispatch({type: "SET_TIME", payload: videoRef.current.currentTime});
      }
    },
    [],
  );

  const handleVolumeChange = useCallback((vol: number) => {
    if (videoRef.current) {
      videoRef.current.volume = vol;
      dispatch({type: "SET_VOLUME", payload: vol});
    }
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      dispatch({type: "SET_SPEED", payload: speed});
    }
  }, []);

  // Save/Restore progress
  const saveProgress = useCallback(() => {
    if (videoRef.current && videoUrl) {
      try {
        localStorage.setItem(
          `video-progress-${videoUrl}`,
          videoRef.current.currentTime.toString(),
        );
      } catch {}
    }
  }, [videoUrl]);

  const restoreProgress = useCallback(() => {
    if (videoRef.current && videoUrl) {
      try {
        const saved = localStorage.getItem(`video-progress-${videoUrl}`);
        if (saved) {
          const time = parseFloat(saved);
          if (time > 0 && time < (videoRef.current.duration || Infinity)) {
            videoRef.current.currentTime = time;
            dispatch({type: "SET_TIME", payload: time});
            // Show continue tooltip (stub: console.log or brief UI)
          }
        }
      } catch {}
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!isOpen) {
      saveProgress();
      dispatch({type: "SET_PLAYING", payload: false});
      dispatch({type: "SHOW_CONTROLS", payload: true});
      return;
    }
    if (videoRef.current) {
      videoRef.current.muted = state.isMuted;
      videoRef.current.volume = state.volume;
      videoRef.current.playbackRate = state.playbackSpeed;
      restoreProgress();
    }
  }, [
    isOpen,
    state.isMuted,
    state.volume,
    state.playbackSpeed,
    restoreProgress,
    saveProgress,
  ]);

  useEffect(() => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [state.isPlaying]);

  // Double click handling
  const handleVideoClick = useCallback(
    (e: React.MouseEvent<HTMLVideoElement>) => {
      e.stopPropagation();
      const now = Date.now();
      const rect = videoRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const width = rect?.width || videoWidth;
      const third = width / 3;
      let side: "left" | "right" | "center" = "center";
      if (x < third) side = "left";
      else if (x > third * 2) side = "right";

      if (state.lastClick && now - state.lastClick.time < 300) {
        if (videoRef.current) {
          let newTime = state.currentTime;
          if (side === "left") newTime = Math.max(0, newTime - 10);
          else if (side === "right")
            newTime = Math.min(state.duration, newTime + 10);
          else toggleFullscreen();
          videoRef.current.currentTime = newTime;
          dispatch({type: "SET_TIME", payload: newTime});
        }
        dispatch({type: "CLEAR_DOUBLE_CLICK"});
      } else {
        dispatch({type: "SET_DOUBLE_CLICK", payload: {time: now, x, side}});
        const timer = setTimeout(() => {
          dispatch({type: "PLAY_TOGGLE"});
          dispatch({type: "CLEAR_DOUBLE_CLICK"});
        }, 300);
        dispatch({type: "CLEAR_TIMEOUTS"}); // Clear previous, set new implicitly
      }
    },
    [
      state.lastClick,
      state.currentTime,
      state.duration,
      videoWidth,
      toggleFullscreen,
    ],
  );

  // Prevent right-click
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => e.preventDefault(),
    [],
  );

  // Poster handling (simplified from original)
  useEffect(() => {
    if (
      isOpen &&
      videoUrl &&
      thumbnail &&
      videoRef.current &&
      !state.isPlaying
    ) {
      const img = new Image();
      img.src = thumbnail.startsWith("http") ? thumbnail : `/api${thumbnail}`;
      img.onload = () => (videoRef.current!.poster = img.src);
      img.onerror = () => (videoRef.current!.poster = "");
    }
  }, [isOpen, videoUrl, thumbnail, state.isPlaying]);

  // Center icon animation (ripple effect stub: just icon with scale)
  const centerIconStyle = state.showCenterIcon
    ? {transform: "scale(1)", opacity: 1, transition: "all 0.5s ease"}
    : {transform: "scale(0)", opacity: 0};

  if (!videoUrl) return null;

  const aspectClasses = state.theaterMode
    ? "aspect-video max-h-screen w-full"
    : "aspect-[16/9] max-h-[70vh]";

  const dialogClasses = state.theaterMode
    ? "w-full h-[90vh] max-w-none"
    : "w-[95vw] max-w-4xl h-auto max-h-[95vh]";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${dialogClasses} flex flex-col p-0 rounded-lg overflow-hidden shadow-2xl`}>
        <DialogHeader className="bg-white px-4 py-2 border-b">
          <DialogTitle className="text-gray-800 font-semibold text-base">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div
          ref={containerRef}
          className={`relative bg-black flex-1 ${aspectClasses} overflow-hidden`}
          onContextMenu={handleContextMenu}>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onSeeked={handleSeeking}
            onClick={handleVideoClick}
            onDoubleClick={() => toggleFullscreen()}
            poster={thumbnail || undefined}
            controls={false}
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload noremoteplayback"
            onContextMenu={handleContextMenu}>
            <source src={videoUrl} type="video/mp4" />
          </video>

          {/* Center Play/Pause Icon */}
          {state.showCenterIcon && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              style={centerIconStyle}>
              <div className="relative">
                {state.showCenterIcon === "play" ? (
                  <Play className="h-16 w-16 text-white drop-shadow-2xl animate-pulse" />
                ) : (
                  <Pause className="h-16 w-16 text-white drop-shadow-2xl animate-pulse" />
                )}
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-300 ${
              state.showControls
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}>
            <ProgressBar
              currentTime={state.currentTime}
              duration={state.duration}
              bufferedRanges={videoRef.current?.buffered || null}
              onSeek={(time) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  dispatch({type: "SET_TIME", payload: time});
                }
              }}
              onHover={(time, hover) => {
                dispatch({type: "SET_HOVER_TIME", payload: time});
                dispatch({type: "SET_PROGRESS_HOVER", payload: hover});
              }}
              hoverTime={state.hoverTime}
              progressHover={state.progressHover}
            />
            <Controls
              state={state}
              dispatch={dispatch}
              onSeek={(time) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  dispatch({type: "SET_TIME", payload: time});
                }
              }}
              onVolumeChange={handleVolumeChange}
              formatTime={formatTime}
              videoWidth={videoWidth}
            />
          </div>
        </div>
      </DialogContent>
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            height: 0;
          }
          to {
            opacity: 1;
            height: auto;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        video::-webkit-media-controls-overlay-enclosure {
          display: none !important;
        }
        video::-webkit-media-controls-enclosure {
          display: none !important;
        }
        video::-internal-media-controls-download-button {
          display: none !important;
        }
      `}</style>
    </Dialog>
  );
}
