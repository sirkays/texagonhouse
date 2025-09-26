"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
} from "lucide-react";

interface AudioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  audioUrl?: string;
  duration?: string;
}

export function AudioPlayer({
  isOpen,
  onClose,
  title,
  audioUrl,
  duration,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio volume on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setError(null);
    } else if (!audioUrl) {
      setError("No audio URL provided");
    }
  }, [isOpen, audioUrl]);

  // Handle real-time progress updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    const handleTimeUpdate = () => {
      console.log("[AudioPlayer] timeupdate fired, currentTime:", audio.currentTime);
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log("[AudioPlayer] loadedmetadata fired, duration:", audio.duration);
      setTotalDuration(audio.duration);
      setError(null);
    };

    const handleError = (e: Event) => {
      console.error("[AudioPlayer] Audio error:", e);
      setError("Failed to load audio. Please try again or check if offline.");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((e) => {
          console.error("[AudioPlayer] Play error:", e);
          setError("Failed to play audio. Please try again or check if offline.");
        });
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      if (newVolume > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(totalDuration, audioRef.current.currentTime + 10);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    if (!audioUrl) {
      setError("No audio URL available for download");
      return;
    }
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = title || "audio.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[60%] xl:w-[40%] max-w-md mx-auto rounded-xl p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error ? (
            <div className="w-full text-center text-red-500">
              <div className="text-lg font-semibold mb-2">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          ) : (
            <>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <div className="text-white text-6xl">🎵</div>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={totalDuration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration || formatTime(totalDuration)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="sm" onClick={skipBackward}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="lg" onClick={togglePlay} className="rounded-full w-12 h-12">
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={skipForward}>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-8">{volume}%</span>
              </div>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Audio
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}