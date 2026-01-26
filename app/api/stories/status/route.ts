import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");

    if (storyId) {
      const story = await prisma.story.findFirst({
        where: {
          id: storyId,
          userId: userId,
        },
        include: {
          child: true,
        },
      });

      if (!story) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }

      return NextResponse.json({
        status: "completed",
        story: {
          id: story.id,
          title: story.title,
          moral: story.moral,
          pageCount: story.pageCount,
          createdAt: story.createdAt,
          child: story.child,
        },
      });
    }

    const recentStories = await prisma.story.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { child: true },
    });

    return NextResponse.json({
      status: "completed",
      stories: recentStories,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stories" },
      { status: 500 }
    );
  }
}
