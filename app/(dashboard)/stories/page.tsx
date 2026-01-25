import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
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
import { Story, StoryPage } from "@/types";
import { getMoralById } from "@/config/morals";
import { getUserIdFromCookie } from "@/lib/firebase-admin";

export default async function StoriesPage() {
  const cookieStore = await cookies();
  const firebaseAuth = cookieStore.get("firebase-auth");
  
  if (!firebaseAuth) {
    redirect("/login");
  }

  const userId = await getUserIdFromCookie(firebaseAuth.value);

  if (!userId) {
    redirect("/login");
  }

  const stories: Story[] = await prisma.story.findMany({
    where: { userId: userId },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Stories</h1>
          <p className="text-muted-foreground">
            All your personalized storybooks
          </p>
        </div>
        <Link href="/create">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Create New Story
          </Button>
        </Link>
      </div>

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => {
            const content = story.content as unknown as StoryPage[];
            const firstPage = content[0];

            return (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="overflow-hidden transition-colors hover:border-primary/50">
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
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {story.title}
                    </CardTitle>
                    <CardDescription>
                      For {story.child?.name} &bull;{" "}
                      {formatDate(story.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {story.moral}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {story.pageCount} pages
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
