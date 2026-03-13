"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryPage } from "@/types";

interface MobilePageViewProps {
  pages: StoryPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function MobilePageView({ 
  pages, 
  currentPage, 
  onPageChange
}: MobilePageViewProps) {
  const totalPages = pages.length * 2; // Each story page = image + text
  
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };
  
  const storyPageIndex = Math.floor(currentPage / 2);
  const isImagePage = currentPage % 2 === 0;
  const currentStoryPage = pages[storyPageIndex];
  
  // Calculate display page number (1-indexed, resets for each story page pair)
  const displayPageNumber = isImagePage 
    ? (storyPageIndex * 2) + 1 
    : (storyPageIndex * 2) + 2;
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Page Content */}
      <div className="relative">
        {isImagePage ? (
          // Image Page
          <div className="paper-vintage rounded-lg p-4 sm:p-6 shadow-lg">
            <div 
              className="relative aspect-square rounded-lg overflow-hidden border-4 border-[#F5F1E6] shadow-inner"
            >
              {currentStoryPage?.imageUrl && currentStoryPage.imageUrl !== "/placeholder-illustration.svg" ? (
                <Image
                  src={currentStoryPage.imageUrl}
                  alt={`Illustration ${storyPageIndex + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#E8DCC4]">
                  <span className="text-4xl">🎨</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <p className="font-special text-xs uppercase tracking-[0.2em] text-[#6B4423]/70">
                Chapter {storyPageIndex + 1}
              </p>
            </div>
          </div>
        ) : (
          // Text Page
          <div className="paper-vintage rounded-lg p-6 sm:p-8 shadow-lg min-h-[400px] flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <div className="decorative-divider mb-6">
                <span className="text-sm">❦</span>
              </div>
              
              <p className="font-crimson text-lg leading-relaxed text-[#3D2914] drop-cap">
                {currentStoryPage?.text}
              </p>
              
              <div className="decorative-divider mt-6">
                <span className="text-sm">❦</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 px-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="
            btn-vintage !p-0 w-12 h-12
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <span className="page-number">
            Page {displayPageNumber} of {totalPages}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          className="
            btn-vintage !p-0 w-12 h-12
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Page indicator dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => onPageChange(index)}
            className={`
              w-2 h-2 rounded-full transition-all duration-200
              ${index === currentPage 
                ? 'bg-[#B8860B] w-4' 
                : 'bg-[#B8860B]/30 hover:bg-[#B8860B]/50'
              }
            `}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
