import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, User } from "lucide-react";
import { StoryPreview } from "@/components/story/StoryPreview";
import { StoryPage } from "@/types";
import { getMoralById } from "@/config/morals";
import { formatDate } from "@/lib/utils";

interface BookstoreStoryPageProps {
  params: Promise<{ id: string }>;
}

async function getPublicStory(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/bookstore/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    return null;
  }
}

export default async function BookstoreStoryPage({
  params,
}: BookstoreStoryPageProps) {
  const { id } = await params;
  const story = await getPublicStory(id);

  if (!story) {
    notFound();
  }

  const content = story.content as StoryPage[];
  const moral = getMoralById(story.moral);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-white border-b-2 border-muted sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/bookstore">
              <Button variant="ghost" size="lg" className="font-bold">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Bookstore
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-primary hidden sm:block">
                Story Magic
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Story Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">
              {story.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>A story about {story.childName}</span>
              </div>
              <span>•</span>
              <span>By {story.authorName}</span>
              <span>•</span>
              <span>Published {formatDate(story.publishedAt)}</span>
            </div>
            {moral && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                Moral: {moral.label}
              </div>
            )}
          </div>

          {/* Story Viewer */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <StoryPreview
              title={story.title}
              pages={content}
              storyId={story.id}
            />
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Want to create your own magical story?
            </p>
            <Link href="/create">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold">
                Create Your Story
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
