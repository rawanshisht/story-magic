import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { inngest, EVENTS } from "@/lib/inngest";

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, moral, customSetting, customTheme, pageCount } = body;

    if (!childId || !moral) {
      return NextResponse.json(
        { error: "Child and moral are required" },
        { status: 400 }
      );
    }

    if (pageCount !== undefined && (pageCount < 4 || pageCount > 6)) {
      return NextResponse.json(
        { error: "Page count must be between 4 and 6" },
        { status: 400 }
      );
    }

    const childData = await prisma.child.findUnique({
      where: {
        id: childId,
        userId: userId,
      },
    });

    if (!childData) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const jobId = `story-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    await inngest.send({
      name: EVENTS.STORY_GENERATION_STARTED,
      data: {
        userId,
        childId,
        moral,
        customSetting,
        customTheme,
        pageCount,
      },
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: "Story generation started in background",
      estimatedTime: "30-60 seconds",
    });
  } catch (error) {
    console.error("Error starting story generation:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to start story generation",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
