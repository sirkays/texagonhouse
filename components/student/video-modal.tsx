"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, Volume2, VolumeX, Maximize, Languages } from "lucide-react"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  videoUrl?: string
}

export function VideoModal({ isOpen, onClose, title, videoUrl }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock transcript data
  const transcript = [
    { time: 0, text: "Welcome to this comprehensive tutorial on advanced React patterns." },
    { time: 15, text: "Today we'll be covering higher-order components, render props, and hooks." },
    { time: 30, text: "Let's start by understanding the concept of component composition." },
    { time: 45, text: "Higher-order components are functions that take a component and return a new component." },
    { time: 60, text: "This pattern allows us to reuse component logic across different components." },
  ]

  const translation = [
    { time: 0, text: "Bienvenido a este tutorial completo sobre patrones avanzados de React." },
    { time: 15, text: "Hoy cubriremos componentes de orden superior, render props y hooks." },
    { time: 30, text: "Comencemos entendiendo el concepto de composición de componentes." },
    {
      time: 45,
      text: "Los componentes de orden superior son funciones que toman un componente y devuelven uno nuevo.",
    },
    { time: 60, text: "Este patrón nos permite reutilizar la lógica de componentes en diferentes componentes." },
  ]

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getCurrentTranscriptItem = (transcriptData: typeof transcript) => {
    return transcriptData.find((item, index) => {
      const nextItem = transcriptData[index + 1]
      return currentTime >= item.time && (!nextItem || currentTime < nextItem.time)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full aspect-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                poster="/placeholder.svg?height=400&width=600&text=Video+Thumbnail"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => {
                        const time = Number.parseFloat(e.target.value)
                        setCurrentTime(time)
                        if (videoRef.current) {
                          videoRef.current.currentTime = time
                        }
                      }}
                      className="w-full"
                    />
                  </div>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16"
                    />
                  </div>

                  <Button variant="ghost" size="sm">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript and Translation */}
          <div className="space-y-4">
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="translation">
                  <Languages className="h-4 w-4 mr-2" />
                  Spanish
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transcript">
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {transcript.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          getCurrentTranscriptItem(transcript)?.time === item.time
                            ? "bg-primary/10 border-primary/20 border"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = item.time
                            setCurrentTime(item.time)
                          }
                        }}
                      >
                        <div className="text-xs text-muted-foreground mb-1">{formatTime(item.time)}</div>
                        <div className="text-sm">{item.text}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="translation">
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {translation.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          getCurrentTranscriptItem(translation)?.time === item.time
                            ? "bg-primary/10 border-primary/20 border"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = item.time
                            setCurrentTime(item.time)
                          }
                        }}
                      >
                        <div className="text-xs text-muted-foreground mb-1">{formatTime(item.time)}</div>
                        <div className="text-sm">{item.text}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
