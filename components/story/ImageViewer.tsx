"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, X, Maximize2 } from "lucide-react";
import { StoryPage } from "@/types";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "./AudioPlayer";

interface ImageViewerProps {
  pages: StoryPage[];
  initialPage?: number;
  onClose?: () => void;
  storyId?: string;
  className?: string;
}

export function ImageViewer({
  pages,
  initialPage = 0,
  onClose,
  storyId,
  className,
}: ImageViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialPage);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const currentPage = pages[currentIndex];
  const hasNext = currentIndex < pages.length - 1;
  const hasPrev = currentIndex > 0;

  // Prevent background scrolling when viewer is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const goToNext = useCallback(() => {
    if (hasNext && !isAnimating) {
      setDirection("right");
      setIsAnimating(true);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [hasNext, isAnimating]);

  const goToPrev = useCallback(() => {
    if (hasPrev && !isAnimating) {
      setDirection("left");
      setIsAnimating(true);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [hasPrev, isAnimating]);

  const handleAnimationEnd = useCallback(() => {
    setIsAnimating(false);
    setDirection(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (storyId) {
      window.open(`/api/stories/${storyId}/pdf`, "_blank");
    }
  }, [storyId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  // Reset animation state when index changes
  useEffect(() => {
    if (direction) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, direction]);

  const content = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Image Viewer"
    >
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm">
        <Button
          variant="outline"
          size="lg"
          onClick={onClose}
          className="gap-2 rounded-full border-2 border-primary/20 bg-background/50"
        >
          <X className="h-6 w-6" />
          <span className="font-bold">Close</span>
        </Button>
        
        {storyId && (
          <Button
            variant="default"
            size="lg"
            onClick={handleDownload}
            className="gap-2 rounded-full shadow-lg"
          >
            <Download className="h-5 w-5" />
            <span className="font-bold">Save as PDF</span>
          </Button>
        )}
      </div>

      {/* Main Content Wrapper - ensures content can grow and be centered if small */}
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center py-12">
        {/* Navigation arrows - Side by side with content on large screens */}
        <div className="relative w-full flex items-center justify-center gap-4 md:gap-12 px-6">
          {hasPrev && (
            <Button
              variant="secondary"
              size="icon"
              onClick={goToPrev}
              className="hidden md:flex h-20 w-20 shrink-0 rounded-full shadow-2xl bg-background/80 hover:scale-110 transition-all border-4 border-primary/20"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-10 w-10 text-primary" strokeWidth={3} />
            </Button>
          )}

          {/* Main Content Area */}
          <div className="flex flex-col items-center justify-center max-w-5xl w-full gap-8">
            {/* Image Container */}
            <div
              className={cn(
                "w-full transition-all duration-300 ease-out",
                isAnimating && direction === "left"
                  ? "-translate-x-12 opacity-0"
                  : isAnimating && direction === "right"
                  ? "translate-x-12 opacity-0"
                  : "translate-x-0 opacity-100"
              )}
              onTransitionEnd={handleAnimationEnd}
            >
              {currentPage?.imageUrl &&
              currentPage.imageUrl !== "/placeholder-illustration.svg" ? (
                <div className="relative w-full aspect-[4/3] bg-white rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-8 border-white ring-4 ring-primary/5">
                  <Image
                    src={currentPage.imageUrl}
                    alt={`Page ${currentPage.pageNumber}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[3rem]">
                  <div className="text-center">
                    <Maximize2 className="h-24 w-24 text-primary/20 mx-auto mb-6" />
                    <p className="text-3xl font-bold text-muted-foreground">
                      Magical moment loading...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Text Container */}
            <div className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 text-center shadow-xl border-4 border-primary/5 space-y-6">
                <p className="text-3xl md:text-4xl leading-relaxed font-bold text-foreground">
                  {currentPage?.text}
                </p>
                {currentPage?.text && (
                  <div className="flex justify-center">
                    <AudioPlayer text={currentPage.text} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasNext && (
            <Button
              variant="secondary"
              size="icon"
              onClick={goToNext}
              className="hidden md:flex h-20 w-20 shrink-0 rounded-full shadow-2xl bg-background/80 hover:scale-110 transition-all border-4 border-primary/20"
              aria-label="Next page"
            >
              <ChevronRight className="h-10 w-10 text-primary" strokeWidth={3} />
            </Button>
          )}

          {/* Mobile Navigation Overlays */}
          <div className="absolute inset-y-0 left-4 flex items-center md:hidden z-30">
             {hasPrev && (
               <Button variant="secondary" size="icon" onClick={goToPrev} className="h-14 w-14 rounded-full shadow-lg border-2 border-primary/20">
                 <ChevronLeft className="h-8 w-8 text-primary" strokeWidth={3} />
               </Button>
             )}
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center md:hidden z-30">
             {hasNext && (
               <Button variant="secondary" size="icon" onClick={goToNext} className="h-14 w-14 rounded-full shadow-lg border-2 border-primary/20">
                 <ChevronRight className="h-8 w-8 text-primary" strokeWidth={3} />
               </Button>
             )}
          </div>
        </div>
      </div>

      {/* Footer Navigation - Sticky to bottom */}
      <div className="sticky bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-6 px-8 py-10 bg-gradient-to-t from-background/90 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-3 rounded-full transition-all duration-500",
                index === currentIndex
                  ? "bg-primary w-12 shadow-md shadow-primary/20"
                  : "bg-primary/20 w-3 hover:bg-primary/40"
              )}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
        <div className="bg-primary/10 text-primary px-6 py-2 rounded-full font-black text-lg tracking-widest uppercase">
          {currentIndex + 1} / {pages.length}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}

// Modal version
interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: StoryPage[];
  initialPage?: number;
  storyId?: string;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  pages,
  initialPage = 0,
  storyId,
}: ImageViewerModalProps) {
  if (!isOpen) return null;

  return (
    <ImageViewer
      pages={pages}
      initialPage={initialPage}
      onClose={onClose}
      storyId={storyId}
    />
  );
}
