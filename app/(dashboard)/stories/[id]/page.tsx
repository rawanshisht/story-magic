import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StoryPreview } from "@/components/story/StoryPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, BookOpen } from "lucide-react";
import { StoryPage } from "@/types";
import { DeleteStoryButton } from "./delete-button";
import { formatDate } from "@/lib/utils";
import { getMoralById } from "@/config/morals";

interface StoryPageProps {
  params: { id: string };
}

export default async function StoryViewPage({ params }: StoryPageProps) {
  const session = await getServerSession(authOptions);

  const story = await prisma.story.findUnique({
    where: {
      id: params.id,
      userId: session?.user?.id,
    },
    include: {
      child: true,
    },
  });

  if (!story) {
    notFound();
  }

  const pages = story.content as unknown as StoryPage[];
  const moral = getMoralById(story.moral);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/stories">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Stories
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Saved indicator */}
          <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span>Saved to your account</span>
          </div>
          <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
        </div>
      </div>

      <StoryPreview title={story.title} pages={pages} storyId={story.id} />

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Created for {story.child.name} &bull; {moral?.label || story.moral} &bull; {formatDate(story.createdAt)}
        </p>
        <Link href="/stories" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <BookOpen className="h-4 w-4" />
          View all your saved stories
        </Link>
      </div>
    </div>
  );
}
