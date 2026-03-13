"use client";

import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackCoverProps {
  onClose: () => void;
  storyTitle: string;
}

export function BackCover({ onClose, storyTitle }: BackCoverProps) {
  return (
    <div className="animate-back-cover-enter">
      <div
        className="
          relative 
          paper-vintage border-ornate corner-flourish
          flex flex-col items-center justify-center
          shadow-2xl
          mx-auto
        "
        style={{ width: '500px', height: '650px', maxWidth: '90vw' }}
      >
        {/* Inner decorative border */}
        <div className="absolute inset-5 border border-[#B8860B]/30 pointer-events-none" />
        
        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 sm:px-12">
          
          {/* Top decorative element */}
          <div className="decorative-divider w-32 mb-10">
            <span>✦</span>
          </div>
          
          {/* The End */}
          <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-letterpress mb-6">
            The End
          </h2>
          
          {/* Decorative line */}
          <div className="decorative-divider w-24 mb-6">
            <span>❦</span>
          </div>
          
          {/* Hope you enjoyed */}
          <p className="font-crimson text-lg sm:text-xl text-[#6B4423] italic mb-10 max-w-[240px]">
            &ldquo;Hope you enjoyed the magic!&rdquo;
          </p>
          
          {/* Large decorative element */}
          <div className="text-5xl sm:text-6xl mb-10 text-[#B8860B]/60">
            ✨
          </div>
          
          {/* Created with */}
          <div className="mb-8">
            <p className="font-special text-xs uppercase tracking-[0.25em] text-[#6B4423]/70 mb-2">
              Created with
            </p>
            <div className="flex items-center gap-2 justify-center text-[#3D2914]">
              <BookOpen className="w-4 h-4" />
              <span className="font-playfair font-semibold text-sm">Story Magic</span>
            </div>
          </div>
          
          {/* Close Book Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="
              btn-vintage
              flex items-center gap-2
              mt-4
            "
          >
            <X className="w-4 h-4" />
            Close Book
          </Button>
        </div>
        
        {/* Bottom corner flourishes */}
        <div className="absolute bottom-6 left-6 text-[#B8860B]/40 text-xl font-serif">&#10087;</div>
        <div className="absolute bottom-6 right-6 text-[#B8860B]/40 text-xl font-serif">&#10087;</div>
      </div>
    </div>
  );
}
