import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where: { isPublic: true },
        include: {
          child: { select: { name: true } },
          user: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.story.count({ where: { isPublic: true } }),
    ]);

    // Transform to public format (remove sensitive data)
    const publicStories = stories.map((story) => ({
      id: story.id,
      title: story.title,
      moral: story.moral,
      pageCount: story.pageCount,
      publishedAt: story.publishedAt,
      childName: story.child.name,
      authorName: story.user.name || "Anonymous",
      coverImage: (story.content as any)[0]?.imageUrl || null,
    }));

    return NextResponse.json({
      stories: publicStories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching public stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}
