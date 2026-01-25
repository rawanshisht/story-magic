"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import { StoryPage } from "@/types";
import { cn } from "@/lib/utils";
import { ImageViewer } from "./ImageViewer";
import { AudioPlayer } from "./AudioPlayer";

interface StoryPreviewProps {
  title: string;
  pages: StoryPage[];
  storyId: string;
}

export function StoryPreview({ title, pages, storyId }: StoryPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDownload = async () => {
    window.open(`/api/stories/${storyId}/pdf`, "_blank");
  };

  const page = pages[currentPage];

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-primary tracking-tight">{title}</h1>
        </div>

        {/* Book Display with Arrows beside it */}
        <div className="relative flex items-center justify-center gap-4 md:gap-12 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="hidden lg:flex h-20 w-20 rounded-full shadow-xl bg-background/80 backdrop-blur hover:scale-110 transition-all shrink-0 border-4 border-primary/10"
          >
            <ChevronLeft className="h-10 w-10 text-primary" strokeWidth={3} />
          </Button>

          <Card className="book-page w-full max-w-2xl overflow-hidden shadow-2xl transition-all hover:shadow-primary/10 border-4 border-primary/20 rounded-[2.5rem]">
            <div 
              className="relative aspect-square w-full bg-muted group cursor-zoom-in" 
              onClick={() => setIsFullscreenViewerOpen(true)}
            >
              {page?.imageUrl && page.imageUrl !== "/placeholder-illustration.svg" ? (
                <Image
                  src={page.imageUrl}
                  alt={`Page ${page.pageNumber} illustration`}
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <p className="text-muted-foreground font-bold">Painting the magic...</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 h-16 w-16" />
              </div>
            </div>
            <div className="p-8 md:p-10 space-y-6 bg-white relative">
              <div className="flex justify-center mb-2">
                 <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest">
                   Page {currentPage + 1} of {pages.length}
                 </span>
              </div>
              <p className="text-2xl md:text-3xl leading-relaxed text-center font-bold text-foreground/90">
                {page?.text}
              </p>
              {page?.text && (
                <div className="flex justify-center pt-4">
                  <AudioPlayer text={page.text} />
                </div>
              )}
            </div>
          </Card>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
            className="hidden lg:flex h-20 w-20 rounded-full shadow-xl bg-background/80 backdrop-blur hover:scale-110 transition-all shrink-0 border-4 border-primary/10"
          >
            <ChevronRight className="h-10 w-10 text-primary" strokeWidth={3} />
          </Button>
          
          {/* Mobile/Tablet Navigation Overlays */}
          <div className="absolute inset-y-0 left-4 flex items-center lg:hidden">
             {currentPage > 0 && (
               <Button variant="secondary" size="icon" onClick={goToPrevPage} className="h-12 w-12 rounded-full shadow-lg">
                 <ChevronLeft className="h-8 w-8" />
               </Button>
             )}
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center lg:hidden">
             {currentPage < pages.length - 1 && (
               <Button variant="secondary" size="icon" onClick={goToNextPage} className="h-12 w-12 rounded-full shadow-lg">
                 <ChevronRight className="h-8 w-8" />
               </Button>
             )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-16 px-10 text-lg border-4"
            onClick={() => setIsFullscreenViewerOpen(true)}
          >
            <Maximize2 className="mr-3 h-6 w-6" />
            Full Screen!
          </Button>
          <Button 
            size="lg" 
            className="rounded-full h-16 px-10 text-lg shadow-lg" 
            onClick={handleDownload}
          >
            <Download className="mr-3 h-6 w-6" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {isFullscreenViewerOpen && (
        <ImageViewer
          pages={pages}
          initialPage={currentPage}
          onClose={() => setIsFullscreenViewerOpen(false)}
          storyId={storyId}
        />
      )}
    </>
  );
}
