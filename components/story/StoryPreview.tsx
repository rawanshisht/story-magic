"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, Maximize2, Pencil, Save, X, Volume2, Loader2, Mail } from "lucide-react";
import { StoryPage } from "@/types";
import { cn } from "@/lib/utils";
import { ImageViewer } from "./ImageViewer";
import { AudioPlayer } from "./AudioPlayer";

interface StoryPreviewProps {
  title: string;
  pages: StoryPage[];
  storyId: string;
  onSave?: (pages: StoryPage[]) => Promise<void>;
  onEmailClick?: () => void;
}

const CACHE_KEY_PREFIX = "story-edit-";

type CachedText = { pageNumber: number; text: string }[];

function getCachedTexts(storyId: string): CachedText | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + storyId);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
}

function setCachedTexts(storyId: string, pages: StoryPage[]) {
  try {
    // Only cache text to keep localStorage small (no imageBase64)
    const textsOnly = pages.map((p) => ({ pageNumber: p.pageNumber, text: p.text }));
    localStorage.setItem(CACHE_KEY_PREFIX + storyId, JSON.stringify(textsOnly));
  } catch {}
}

function clearCachedPages(storyId: string) {
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + storyId);
  } catch {}
}

export function StoryPreview({ title, pages, storyId, onSave, onEmailClick }: StoryPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);
  const [editedPages, setEditedPages] = useState<StoryPage[]>(pages);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Initialize from localStorage cache or props
  useEffect(() => {
    const cachedTexts = getCachedTexts(storyId);
    if (cachedTexts) {
      // Merge cached text edits with original pages (preserves images)
      const merged = pages.map((page) => {
        const cached = cachedTexts.find((c) => c.pageNumber === page.pageNumber);
        return cached ? { ...page, text: cached.text } : page;
      });
      setEditedPages(merged);
      setHasUnsavedChanges(true);
      // setIsEditing(true); // Disable auto-edit for now
    } else {
      setEditedPages(pages);
    }
  }, [storyId, pages]);

  const handleTextChange = useCallback((pageIndex: number, newText: string) => {
    setEditedPages((prev) => {
      const updated = prev.map((p, i) =>
        i === pageIndex ? { ...p, text: newText } : p
      );
      setCachedTexts(storyId, updated);
      return updated;
    });
    setHasUnsavedChanges(true);
  }, [storyId]);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(editedPages);
      clearCachedPages(storyId);
      setHasUnsavedChanges(false);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPages(pages);
    clearCachedPages(storyId);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

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

  const goToNextPage = () => {
    if (currentPage < editedPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDownload = async () => {
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

  const page = editedPages[currentPage];

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
                   Page {currentPage + 1} of {editedPages.length}
                 </span>
              </div>
              {isEditing ? (
                <textarea
                  value={page?.text || ""}
                  onChange={(e) => handleTextChange(currentPage, e.target.value)}
                  className="w-full min-h-[150px] text-xl md:text-2xl leading-relaxed text-center font-bold text-foreground/90 bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 resize-y focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              ) : (
                <p className="text-2xl md:text-3xl leading-relaxed text-center font-bold text-foreground/90">
                  {page?.text}
                </p>
              )}
              {page?.text && !isEditing && (
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
            disabled={currentPage === editedPages.length - 1}
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
             {currentPage < editedPages.length - 1 && (
               <Button variant="secondary" size="icon" onClick={goToNextPage} className="h-12 w-12 rounded-full shadow-lg">
                 <ChevronRight className="h-8 w-8" />
               </Button>
             )}
          </div>
        </div>

        {/* Edit Controls - Hidden for now while production saving is fixed */}
        {/* onSave && (
          <div className="flex flex-wrap justify-center gap-4">
            {isEditing ? (
              <>
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full h-14 px-8 text-lg shadow-lg"
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-14 px-8 text-lg border-2"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="mr-2 h-5 w-5" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-14 px-8 text-lg border-2"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-5 w-5" />
                Edit Text
              </Button>
            )}
          </div>
        ) */}

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
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? (
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            ) : (
              <Download className="mr-3 h-6 w-6" />
            )}
            {isDownloadingPdf ? "Generating PDF..." : "Download PDF"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-16 px-10 text-lg border-4"
            onClick={handleDownloadAudio}
            disabled={isDownloadingAudio}
          >
            {isDownloadingAudio ? (
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            ) : (
              <Volume2 className="mr-3 h-6 w-6" />
            )}
            {isDownloadingAudio ? "Generating Audio..." : "Download Audio"}
          </Button>
          {onEmailClick && (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-16 px-10 text-lg border-4"
              onClick={onEmailClick}
            >
              <Mail className="mr-3 h-6 w-6" />
              Send by Email
            </Button>
          )}
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {isFullscreenViewerOpen && (
        <ImageViewer
          pages={editedPages}
          initialPage={currentPage}
          onClose={() => setIsFullscreenViewerOpen(false)}
          storyId={storyId}
        />
      )}
    </>
  );
}
