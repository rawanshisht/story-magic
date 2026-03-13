import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const story = await prisma.story.findFirst({
      where: { id, isPublic: true },
      include: {
        child: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: story.id,
      title: story.title,
      moral: story.moral,
      content: story.content,
      pageCount: story.pageCount,
      publishedAt: story.publishedAt,
      childName: story.child.name,
      authorName: story.user.name || "Anonymous",
    });
  } catch (error) {
    console.error("Error fetching public story:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}
