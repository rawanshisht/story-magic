import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { StoryViewClient } from "./story-view-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { StoryPage } from "@/types";
import { DeleteStoryButton } from "./delete-button";
import { formatDate } from "@/lib/utils";
import { getMoralById } from "@/config/morals";
import { getAuthenticatedUserId } from "@/lib/auth-helper";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryViewPage({ params }: StoryPageProps) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  const story = await prisma.story.findUnique({
    where: {
      id: id,
      userId: userId,
    },
    include: {
      child: true,
    },
  });

  if (!story) {
    notFound();
  }

  const content = story.content as unknown as StoryPage[];
  const moral = getMoralById(story.moral);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{story.title}</h1>
            <p className="text-muted-foreground">
              For {story.child.name} &bull; Created {formatDate(story.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {moral && (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <CheckCircle className="h-4 w-4" />
              {moral.label}
            </div>
          )}
          <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
        </div>
      </div>

      <StoryViewClient title={story.title} pages={content} storyId={story.id} />
    </div>
  );
}
