"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Heart } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="container relative z-10 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border bg-background px-4 py-2 text-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            AI-Powered Personalized Stories
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Create Magical Stories
            <span className="block text-primary">Starring Your Child</span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Transform your child into the hero of their own personalized
            storybook. AI-generated tales with beautiful illustrations, tailored
            to their age and featuring important life lessons.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Create Your First Story
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Age-appropriate content</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Beautiful illustrations</span>
            </div>
          </div>
        </div>

        {/* Floating book decorations */}
        <div className="absolute left-10 top-20 hidden animate-float opacity-20 md:block">
          <BookOpen className="h-16 w-16 text-primary" />
        </div>
        <div
          className="absolute right-10 bottom-20 hidden animate-float opacity-20 md:block"
          style={{ animationDelay: "1s" }}
        >
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
      </div>
    </section>
  );
}
