import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { BookOpen, Sparkles, ArrowLeft, Trash2, Download } from "lucide-react";
import { StoryPage } from "@/types";
import { getMoralById } from "@/config/morals";

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);

  const stories = await prisma.story.findMany({
    where: { userId: session?.user?.id },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">My Saved Stories</h1>
          <p className="text-muted-foreground">
            All your personalized storybooks in one place
          </p>
        </div>
        <Link href="/create">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Create New Story
          </Button>
        </Link>
      </div>

      {/* Story Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>
          {stories.length} {stories.length === 1 ? "story" : "stories"} saved
        </span>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No stories yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first personalized storybook
            </p>
            <Link href="/create">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => {
            const content = story.content as unknown as StoryPage[];
            const firstPage = content[0];
            const moral = getMoralById(story.moral);

            return (
              <Card
                key={story.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                <Link href={`/stories/${story.id}`}>
                  <div className="relative aspect-video bg-muted">
                    {firstPage?.imageUrl &&
                    firstPage.imageUrl !== "/placeholder-illustration.svg" ? (
                      <Image
                        src={firstPage.imageUrl}
                        alt={story.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Saved Badge */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Saved
                    </div>
                  </div>
                </Link>
                <CardHeader>
                  <Link href={`/stories/${story.id}`}>
                    <CardTitle className="line-clamp-1 hover:text-primary transition-colors">
                      {story.title}
                    </CardTitle>
                  </Link>
                  <CardDescription>
                    For {story.child.name} &bull; {formatDate(story.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {moral?.label || story.moral}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {story.pageCount} pages
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/api/stories/${story.id}/pdf`}>
                        <Button variant="ghost" size="icon" title="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
