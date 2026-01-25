"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(initialPage);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

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

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-background overflow-hidden",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Image Viewer"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-background/90 to-transparent">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="gap-2 hover:bg-background/80"
        >
          <X className="h-4 w-4" />
          Exit
        </Button>
        
        {storyId && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Left Navigation Arrow */}
      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-background/70 hover:bg-background shadow-lg backdrop-blur transition-all hover:scale-110"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
      )}

      {/* Right Navigation Arrow */}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-background/70 hover:bg-background shadow-lg backdrop-blur transition-all hover:scale-110"
          aria-label="Next page"
        >
          <ChevronRight className="h-7 w-7" />
        </Button>
      )}

      {/* Main Content - Perfectly Centered */}
      <div className="w-full h-full flex flex-col items-center justify-center px-16">
        {/* Image */}
        <div
          className={cn(
            "w-full max-w-5xl transition-all duration-300 ease-out",
            isAnimating && direction === "left"
              ? "-translate-x-4 opacity-50"
              : isAnimating && direction === "right"
              ? "translate-x-4 opacity-50"
              : "translate-x-0 opacity-100"
          )}
          onTransitionEnd={handleAnimationEnd}
        >
          {currentPage?.imageUrl &&
          currentPage.imageUrl !== "/placeholder-illustration.svg" ? (
            <div className="relative w-full aspect-[4/3] bg-muted/10 rounded-lg overflow-hidden shadow-2xl">
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
            <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
              <div className="text-center">
                <Maximize2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-2xl text-muted-foreground">
                  {currentPage?.pageNumber === 1 ? "Once upon a time..." : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="w-full max-w-3xl mt-6">
          <div className="bg-muted/20 rounded-lg p-6 text-center space-y-4">
            <p className="text-xl leading-relaxed">{currentPage?.text}</p>
            {currentPage?.text && (
              <div className="flex justify-center">
                <AudioPlayer text={currentPage.text} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-3 px-6 py-4 bg-gradient-to-t from-background/90 to-transparent">
        {/* Page Counter */}
        <div className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1} <span className="opacity-50">/ {pages.length}</span>
        </div>
        
        {/* Page Dots */}
        <div className="flex items-center gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
              )}
              aria-label={`Page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
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
