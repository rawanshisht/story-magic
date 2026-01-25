"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Loader2, Volume2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AudioPlayerProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
}

export function AudioPlayer({ text, className, autoPlay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Reset when text changes
  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setIsLoading(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [text]);

  const fetchAudio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      return url;
    } catch (error) {
      toast({
        title: "Audio Error",
        description: "Could not generate speech for this page.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      let currentUrl = audioUrl;
      if (!currentUrl) {
        currentUrl = await fetchAudio();
      }

      if (currentUrl && audioRef.current) {
        audioRef.current.src = currentUrl;
        audioRef.current.play().catch((err) => {
          console.error("Playback error:", err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <div className={className}>
      <audio ref={audioRef} hidden />
      <Button
        variant="outline"
        size="sm"
        className="gap-2 rounded-full"
        onClick={togglePlay}
        disabled={isLoading || !text}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current" />
        )}
        <Volume2 className="h-4 w-4 opacity-50" />
        <span>{isPlaying ? "Pause" : "Listen to Page"}</span>
      </Button>
    </div>
  );
}
