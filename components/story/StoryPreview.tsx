"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Volume2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryPage } from "@/types";
import { FrontCover } from "./FrontCover";
import { BackCover } from "./BackCover";
import { BookView } from "./BookView";
import { MobilePageView } from "./MobilePageView";
import { AudioPlayer } from "./AudioPlayer";

interface StoryPreviewProps {
  title: string;
  pages: StoryPage[];
  storyId: string;
  onSave?: (pages: StoryPage[]) => Promise<void>;
  onEmailClick?: () => void;
}

export function StoryPreview({ title, pages, storyId, onSave, onEmailClick }: StoryPreviewProps) {
  // Core state
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isCoverAnimating, setIsCoverAnimating] = useState(false);
  const [showBackCover, setShowBackCover] = useState(false);
  
  // Download states
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if we should show back cover (on last page)
  useEffect(() => {
    const totalInteriorPages = pages.length * 2;
    if (isMobile) {
      setShowBackCover(currentPage >= totalInteriorPages - 1);
    } else {
      // For desktop, show back cover when past the last spread
      setShowBackCover(currentPage >= totalInteriorPages - 2);
    }
  }, [currentPage, pages.length, isMobile]);

  const handleOpenBook = () => {
    setIsCoverAnimating(true);
    setTimeout(() => {
      setIsBookOpen(true);
      setIsCoverAnimating(false);
    }, 900); // Match animation duration
  };

  const handleCloseBook = () => {
    setIsBookOpen(false);
    setCurrentPage(0);
    setShowBackCover(false);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDownloadAudio = async () => {
    setIsDownloadingAudio(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/audio`);
      if (!response.ok) throw new Error("Failed to generate audio");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9 ]/g, "").trim()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Audio download error:", error);
    } finally {
      setIsDownloadingAudio(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/pdf`);
      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9 ]/g, "").trim()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Get first page image for cover
  const coverImage = pages[0]?.imageUrl || null;

  // Get current page text for audio player (when book is open)
  const currentStoryPageIndex = Math.floor(currentPage / 2);
  const currentPageText = pages[currentStoryPageIndex]?.text || "";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {!isBookOpen ? (
        // Front Cover View
        <div className="flex flex-col items-center">
          <div className="relative">
            <FrontCover
              title={title}
              imageUrl={coverImage}
              onOpen={handleOpenBook}
              isAnimating={isCoverAnimating}
            />
          </div>
          
          {/* Action Buttons - visible when cover is shown */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Button
              size="lg"
              className="rounded-full h-14 px-8 text-base shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              {isDownloadingPdf ? "Generating..." : "Download PDF"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-14 px-8 text-base border-2 hover:scale-105 transition-transform"
              onClick={handleDownloadAudio}
              disabled={isDownloadingAudio}
            >
              {isDownloadingAudio ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Volume2 className="mr-2 h-5 w-5" />
              )}
              {isDownloadingAudio ? "Generating..." : "Audio Book"}
            </Button>
            
            {onEmailClick && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-14 px-8 text-base border-2 hover:scale-105 transition-transform"
                onClick={onEmailClick}
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Story
              </Button>
            )}
          </div>
        </div>
      ) : showBackCover ? (
        // Back Cover View (after reading all pages)
        <div className="flex flex-col items-center">
          <BackCover
            onClose={handleCloseBook}
            storyTitle={title}
          />
          
          {/* Action Buttons - also visible on back cover */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Button
              size="lg"
              className="rounded-full h-14 px-8 text-base shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              {isDownloadingPdf ? "Generating..." : "Download PDF"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-14 px-8 text-base border-2 hover:scale-105 transition-transform"
              onClick={handleDownloadAudio}
              disabled={isDownloadingAudio}
            >
              {isDownloadingAudio ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Volume2 className="mr-2 h-5 w-5" />
              )}
              {isDownloadingAudio ? "Generating..." : "Audio Book"}
            </Button>
            
            {onEmailClick && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-14 px-8 text-base border-2 hover:scale-105 transition-transform"
                onClick={onEmailClick}
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Story
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Book View (interior pages)
        <div className="flex flex-col items-center">
          {isMobile ? (
            <MobilePageView
              pages={pages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          ) : (
            <BookView
              pages={pages}
              onPageChange={handlePageChange}
              onClose={handleCloseBook}
              storyTitle={title}
            />
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="rounded-full h-14 px-8 text-base shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              {isDownloadingPdf ? "Generating..." : "Download PDF"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-14 px-8 text-base border-2 hover:scale-105 transition-transform"
              onClick={handleDownloadAudio}
              disabled={isDownloadingAudio}
            >
              {isDownloadingAudio ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Volume2 className="mr-2 h-5 w-5" />
              )}
              {isDownloadingAudio ? "Generating..." : "Audio Book"}
            </Button>
            
            {onEmailClick && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-14 px-8 text-base border-2 hover:scale-105 transition-transform"
                onClick={onEmailClick}
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Story
              </Button>
            )}
            
            {/* Listen to Current Page Button - only when book is open */}
            <AudioPlayer 
              text={currentPageText} 
              className="flex-shrink-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
