"use client"

import { useState, useEffect, useRef } from "react"
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstagramReelModalProps {
  reelUrl?: string
}

export default function InstagramReelModal({ 
  reelUrl = "https://www.instagram.com/tu_ksa_qro/reel/DQscfAVDoYJ/"
}: InstagramReelModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Mostrar el modal cada vez que se carga la página
    const timer = setTimeout(() => {
      setIsOpen(true)
      setHasBeenDismissed(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setHasBeenDismissed(true)
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handlePlayPause = () => {
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

  const handleOpenReel = () => {
    window.open(reelUrl, "_blank")
    handleClose()
  }

  const handleVideoMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  if (hasBeenDismissed || !isOpen) return null

  return (
    <>
      {/* Overlay con blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal FULLSCREEN - Video maximizado */}
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Player - Occupa todo */}
        <div 
          className="relative w-full h-full bg-black flex items-center justify-center"
          onMouseMove={handleMouseMove}
        >
          {/* Video */}
          <video
            ref={videoRef}
            src="/tksa.mp4"
            className="w-full h-full object-contain"
            muted={isMuted}
            onLoadedMetadata={handleVideoMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            playsInline
            autoPlay
          />

          {/* Botón cerrar - Esquina superior */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 p-3 bg-black/60 hover:bg-black/80 rounded-full transition-all group"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 text-white group-hover:text-red-500" />
          </button>

          {/* Play/Pause overlay - Centro */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={handlePlayPause}
              className="p-6 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all hover:scale-110"
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white fill-white" />
              ) : (
                <Play className="w-12 h-12 text-white fill-white ml-1" />
              )}
            </button>
          </div>

          {/* Controles inferiores - Minimalistas */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 space-y-3 transition-opacity duration-200 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Barra de progreso */}
            <div className="w-full bg-gray-700/50 h-1.5 rounded-full cursor-pointer hover:h-2 transition-all group/bar">
              <div
                className="bg-gradient-to-r from-pink-500 to-red-500 h-full rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Tiempo y controles */}
            <div className="flex items-center justify-between text-sm text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayPause}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white fill-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  )}
                </button>
                <span className="font-medium min-w-fit">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Branding Instagram */}
          <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <p className="text-xs font-bold bg-gradient-to-r from-pink-600 to-orange-400 bg-clip-text text-transparent">
              Instagram Reel
            </p>
          </div>

          {/* Footer CTA - Abajo */}
          <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 transition-opacity duration-200 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}>
            <Button
              onClick={handleOpenReel}
              className="bg-gradient-to-r from-pink-600 via-red-500 to-orange-400 hover:shadow-2xl text-white font-semibold px-8 py-2 rounded-full transition-all hover:scale-105 shadow-lg"
            >
              ❤️ Ver en Instagram
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
