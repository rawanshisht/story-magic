import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Heart } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="container relative z-10 py-24 md:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border-2 border-primary/20 bg-background/50 px-6 py-2 text-base font-bold backdrop-blur-sm animate-in">
            <Sparkles className="mr-2 h-5 w-5 text-accent" />
            <span className="text-primary">AI-Powered Personalized Stories</span>
          </div>

          <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl animate-in" style={{ animationDelay: "0.1s" }}>
            Create Magical Stories{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block mt-2">
              Starring Your Child
            </span>
          </h1>

          <p className="mb-10 mx-auto max-w-2xl text-xl md:text-2xl text-muted-foreground animate-in" style={{ animationDelay: "0.2s" }}>
            Transform your child into the hero of their own personalized
            storybook. AI-generated tales with beautiful illustrations, tailored
            to their age and featuring important life lessons.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row animate-in" style={{ animationDelay: "0.3s" }}>
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-xl px-10 py-8">
                <BookOpen className="mr-3 h-6 w-6" />
                Create Your First Story
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xl px-10 py-8">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-base font-bold text-muted-foreground animate-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-border">
              <Heart className="h-5 w-5 text-destructive fill-current" />
              <span>Age-appropriate content</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-border">
              <Sparkles className="h-5 w-5 text-accent fill-current" />
              <span>Beautiful illustrations</span>
            </div>
          </div>
        </div>

        {/* Floating book decorations - hidden from screen readers as purely decorative */}
        <div className="absolute left-10 top-20 hidden animate-float opacity-30 md:block text-primary" aria-hidden="true">
          <BookOpen className="h-24 w-24" />
        </div>
        <div
          className="absolute right-10 bottom-40 hidden animate-float opacity-30 md:block text-secondary"
          style={{ animationDelay: "1s" }}
          aria-hidden="true"
        >
          <BookOpen className="h-20 w-20" />
        </div>
      </div>
    </section>
  );
}
