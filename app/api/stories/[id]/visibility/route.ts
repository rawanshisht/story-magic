import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { clearDataCache } from "@/lib/data-cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isPublic } = await request.json().catch(() => ({}));

    if (typeof isPublic !== "boolean") {
      return NextResponse.json({ error: "isPublic must be a boolean" }, { status: 400 });
    }

    // Verify story ownership
    const story = await prisma.story.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Update visibility
    const updatedStory = await prisma.story.update({
      where: { id },
      data: {
        isPublic,
        publishedAt: isPublic ? new Date() : null,
      },
    });

    // So the bookstore listing reflects the change straight away.
    clearDataCache();

    return NextResponse.json({
      success: true,
      isPublic: updatedStory.isPublic,
    });
  } catch (error) {
    console.error("Error updating story visibility:", error);
    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 }
    );
  }
}
