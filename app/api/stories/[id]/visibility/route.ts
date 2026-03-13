import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";

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
    const { isPublic } = await request.json();

    // Verify story ownership
    const story = await prisma.story.findFirst({
      where: { id, userId },
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
