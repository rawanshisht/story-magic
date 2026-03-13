"use client";

import { forwardRef, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryPage } from "@/types";
import { cn } from "@/lib/utils";

// Dynamic import for react-pageflip to avoid SSR issues
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center paper-vintage rounded-lg">
      <Loader2 className="h-10 w-10 animate-spin text-[#B8860B]" />
    </div>
  ),
});

interface BookViewProps {
  pages: StoryPage[];
  onPageChange: (page: number) => void;
  onClose: () => void;
  storyTitle: string;
}

// Page component for react-pageflip
const Page = forwardRef<HTMLDivElement, { 
  children: React.ReactNode; 
  className?: string;
}>((props, ref) => {
  return (
    <div 
      className={cn(
        "h-full w-full vintage-page overflow-hidden",
        props.className
      )} 
      ref={ref}
    >
      {props.children}
    </div>
  );
});

Page.displayName = "Page";

export function BookView({ 
  pages, 
  onPageChange,
  onClose,
  storyTitle
}: BookViewProps) {
  const bookRef = useRef<any>(null);

  const onFlip = useCallback((e: any) => {
    onPageChange(e.data);
  }, [onPageChange]);

  const handlePrev = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  const handleNext = () => {
    bookRef.current?.pageFlip()?.flipNext();
  };

  // Book dimensions
  const bookWidth = 500;
  const bookHeight = 650;

  return (
    <div className="relative animate-book-enter">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="
          absolute -top-12 right-0 z-20
          w-10 h-10 rounded-full
          bg-[#F5F1E6]/80 backdrop-blur-sm
          border border-[#B8860B]/30
          text-[#3D2914]
          hover:bg-[#EDE6D6] hover:scale-110
          transition-all
        "
        aria-label="Close book"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Book Title */}
      <div className="text-center mb-6">
        <h2 className="font-playfair text-xl sm:text-2xl font-bold text-letterpress">
          {storyTitle}
        </h2>
      </div>

      {/* Navigation and Book Container */}
      <div className="relative flex items-center justify-center gap-4">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="
            hidden lg:flex
            w-12 h-12 rounded-full
            bg-[#F5F1E6]/80 backdrop-blur-sm
            border border-[#B8860B]/30
            text-[#3D2914]
            hover:bg-[#EDE6D6] hover:scale-110
            transition-all shadow-lg
          "
          aria-label="Previous page"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {/* The Book */}
        <div className="relative">
          <HTMLFlipBook
            width={bookWidth}
            height={bookHeight}
            size="fixed"
            minWidth={bookWidth}
            maxWidth={bookWidth}
            minHeight={bookHeight}
            maxHeight={bookHeight}
            maxShadowOpacity={0.5}
            showCover={false}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className="storybook-flip"
            ref={bookRef}
            style={{ background: "transparent" }}
            startPage={0}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={false}
            startZIndex={0}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pages.map((page, index) => [
              // LEFT PAGE: Illustration
              <Page key={`img-${index}`} className="vintage-page-left">
                <div className="page-spine-left" />
                <div className="h-full w-full flex flex-col items-center justify-center p-6 sm:p-8 bg-[#EDE6D6]/50"
                >
                  <div 
                    className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg border-4 border-[#F5F1E6]"
                  >
                    {page.imageUrl && page.imageUrl !== "/placeholder-illustration.svg" ? (
                      <Image
                        src={page.imageUrl}
                        alt={`Illustration ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E8DCC4]">
                        <Loader2 className="h-8 w-8 animate-spin text-[#B8860B]/50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="font-special text-xs uppercase tracking-[0.2em] text-[#6B4423]/60"
                    >
                      Chapter {index + 1}
                    </p>
                  </div>
                </div>
              </Page>,
              
              // RIGHT PAGE: Text
              <Page key={`txt-${index}`} className="vintage-page-right"
              >
                <div className="page-spine-right" />
                <div className="h-full w-full flex flex-col justify-between p-6 sm:p-10"
                >
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="decorative-divider mb-6 w-16 mx-auto">
                      <span className="text-base">❦</span>
                    </div>
                    
                    <p className="font-crimson text-base sm:text-lg leading-relaxed text-[#3D2914] drop-cap text-center px-2"
                    >
                      {page.text}
                    </p>
                    
                    <div className="decorative-divider mt-6 w-16 mx-auto">
                      <span className="text-base">❦</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center"
                  >
                    <span className="page-number">
                      {(index * 2) + 2}
                    </span>
                  </div>
                </div>
              </Page>,
            ]).flat()}
          </HTMLFlipBook>
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="
            hidden lg:flex
            w-12 h-12 rounded-full
            bg-[#F5F1E6]/80 backdrop-blur-sm
            border border-[#B8860B]/30
            text-[#3D2914]
            hover:bg-[#EDE6D6] hover:scale-110
            transition-all shadow-lg
          "
          aria-label="Next page"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

    </div>
  );
}
