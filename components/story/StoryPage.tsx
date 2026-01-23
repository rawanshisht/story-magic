"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { StoryPage as StoryPageType } from "@/types";

interface StoryPageProps {
  page: StoryPageType;
  isActive: boolean;
}

export function StoryPage({ page, isActive }: StoryPageProps) {
  if (!isActive) return null;

  return (
    <Card className="book-page overflow-hidden animate-fade-in">
      <div className="relative aspect-[4/3] w-full bg-muted">
        {page.imageUrl && page.imageUrl !== "/placeholder-illustration.svg" ? (
          <Image
            src={page.imageUrl}
            alt={`Page ${page.pageNumber} illustration`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="text-center">
              <p className="text-4xl mb-2">
                {page.pageNumber === 1 ? "Once upon a time..." : ""}
              </p>
              <p className="text-muted-foreground">Page {page.pageNumber}</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-8">
        <p className="text-xl leading-relaxed text-center">{page.text}</p>
      </div>
    </Card>
  );
}
