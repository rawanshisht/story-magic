"use client";

import Image from "next/image";
import { Hand } from "lucide-react";

interface FrontCoverProps {
  title: string;
  imageUrl: string | null;
  onOpen: () => void;
  isAnimating?: boolean;
}

export function FrontCover({ title, imageUrl, onOpen, isAnimating }: FrontCoverProps) {
  return (
    <div
      className={`
        relative cursor-pointer select-none
        paper-vintage border-ornate corner-flourish
        flex flex-col items-center justify-center
        transition-transform duration-200
        hover:scale-[1.02] hover:shadow-2xl
        mx-auto
        ${isAnimating ? 'animate-open-book' : ''}
      `}
      style={{ width: '500px', height: '650px', maxWidth: '90vw' }}
      onClick={onOpen}
    >
      {/* Inner decorative border */}
      <div className="absolute inset-5 border border-[#B8860B]/30 pointer-events-none" />
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 sm:px-12">
        
        {/* Top decorative element */}
        <div className="decorative-divider w-32 mb-6">
          <span>✦</span>
        </div>
        
        {/* Circular Image Frame */}
        <div className="cover-image-frame w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 mb-6 flex-shrink-0">
          <div className="cover-image-container">
            {imageUrl && imageUrl !== "/placeholder-illustration.svg" ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E8DCC4]">
                <span className="text-5xl sm:text-6xl">📖</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Title */}
        <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-letterpress leading-tight mb-4 max-w-[280px] sm:max-w-[340px]">
          {title}
        </h1>
        
        {/* Subtitle */}
        <p className="font-special text-xs sm:text-sm uppercase tracking-[0.3em] text-[#6B4423] mb-8">
          A Storybook
        </p>
        
        {/* Bottom decorative element */}
        <div className="decorative-divider w-24 mb-8">
          <span>❧</span>
        </div>
        
        {/* Click to Open */}
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="flex items-center gap-2 text-[#6B4423] font-special text-xs sm:text-sm uppercase tracking-wider">
            <span>Click to Open</span>
            <Hand className="w-4 h-4 animate-hand-point" />
          </div>
        </div>
      </div>
      
      {/* Bottom corner flourishes (additional) */}
      <div className="absolute bottom-6 left-6 text-[#B8860B]/40 text-xl font-serif">&#10087;</div>
      <div className="absolute bottom-6 right-6 text-[#B8860B]/40 text-xl font-serif">&#10087;</div>
    </div>
  );
}
