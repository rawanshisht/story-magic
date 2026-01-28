import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { StoryPage } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Exclude cachedPdf from response - it's large and not needed by client
    const story = await prisma.story.findUnique({
      where: {
        id: id,
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        moral: true,
        content: true,
        childId: true,
        child: true,
        userId: true,
        pageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const startTime = Date.now();
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !Array.isArray(content)) {
      return NextResponse.json(
        { error: "Invalid content: expected an array of pages" },
        { status: 400 }
      );
    }

    console.log(`[Story Update] Starting update for ${id}`);

    // Verify story exists and belongs to user
    const story = await prisma.story.findUnique({
      where: { id, userId },
      select: { id: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Use raw SQL to update only text fields without fetching/rewriting entire content
    // This avoids transferring ~6MB of image data
    const updateStart = Date.now();

    // Build SQL to update each page's text using jsonb_set
    const textUpdates = content.map((page: StoryPage, index: number) => {
      const escapedText = page.text.replace(/'/g, "''").replace(/\\/g, "\\\\");
      return `jsonb_set(content, '{${index},text}', '"${escapedText}"'::jsonb)`;
    });

    // Chain all the jsonb_set calls
    let updateExpression = "content";
    for (const update of textUpdates) {
      updateExpression = update.replace("content", updateExpression);
    }

    await prisma.$executeRawUnsafe(`
      UPDATE "Story"
      SET content = ${updateExpression},
          "cachedPdf" = NULL,
          "updatedAt" = NOW()
      WHERE id = '${id}' AND "userId" = '${userId}'
    `);

    console.log(`[Story Update] SQL update took ${Date.now() - updateStart}ms`);
    console.log(`[Story Update] Total: ${Date.now() - startTime}ms`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating story:", error);
    return NextResponse.json(
      { error: "Failed to update story" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.story.delete({
      where: {
        id: id,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
