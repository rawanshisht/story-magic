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
import { Plus, BookOpen, User, Sparkles } from "lucide-react";
import { Child, Story, StoryPage } from "@/types";
import { getUserIdFromCookie } from "@/lib/firebase-admin";
import { Navbar } from "@/components/shared/Navbar";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const firebaseAuth = cookieStore.get("firebase-auth");
  
  if (!firebaseAuth) {
    redirect("/login");
  }

  const userId = await getUserIdFromCookie(firebaseAuth.value);

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const [children, stories]: [Child[], Story[]] = await Promise.all([
    prisma.child.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.story.findMany({
      where: { userId: userId },
      include: { child: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const userName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Parent";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Create magical stories for your children
          </p>
        </div>
        <Link href="/create">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Create New Story
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Child Profiles
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
            <p className="text-xs text-muted-foreground">
              {children.length === 0
                ? "Add your first child"
                : children.length === 1
                  ? "1 child profile"
                  : `${children.length} child profiles`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Stories Created
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stories.length}</div>
            <p className="text-xs text-muted-foreground">
              {stories.length === 0
                ? "Create your first story"
                : "Total stories generated"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/create" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="mr-1 h-3 w-3" />
                New Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Children</h2>
          <Link href="/create?step=child">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </Button>
          </Link>
        </div>

        {children.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No children added yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add a child profile to start creating personalized stories
              </p>
              <Link href="/create?step=child">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Child
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <Card key={child.id}>
                <CardHeader>
                  <CardTitle>{child.name}</CardTitle>
                  <CardDescription>
                    {child.age} years old &bull; {child.gender}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Appearance:</span>{" "}
                      {child.skinTone} skin, {child.eyeColor} eyes,{" "}
                      {child.hairColor} hair
                    </p>
                    {child.interests.length > 0 && (
                      <p>
                        <span className="font-medium">Interests:</span>{" "}
                        {child.interests.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link href={`/create?childId=${child.id}`}>
                      <Button size="sm" className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Story
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Stories</h2>
          {stories.length > 0 && (
            <Link href="/stories">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          )}
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
    </div>
  );
}
