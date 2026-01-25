"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import { StoryPage } from "@/types";
import { cn } from "@/lib/utils";
import { ImageViewer } from "./ImageViewer";

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
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
        </div>

        {/* Book Display */}
        <Card className="book-page mx-auto max-w-2xl overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-muted">
            {page?.imageUrl && page.imageUrl !== "/placeholder-illustration.svg" ? (
              <Image
                src={page.imageUrl}
                alt={`Page ${page.pageNumber} illustration`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <p className="text-muted-foreground">Illustration</p>
              </div>
            )}
          </div>
          <div className="p-6">
            <p className="text-lg leading-relaxed">{page?.text}</p>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  currentPage === index ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Page {currentPage + 1} of {pages.length}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setIsFullscreenViewerOpen(true)}
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Full Screen Viewer
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
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
