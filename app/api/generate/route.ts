import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { generateStory } from "@/lib/story-generator";
import { Child } from "@/types";

export const maxDuration = 300;

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

    if (pageCount !== undefined && (pageCount < 4 || pageCount > 4)) {
      return NextResponse.json(
        { error: "Page count must be 4" },
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

    const child: Child = {
      id: childData.id,
      name: childData.name,
      age: childData.age,
      gender: childData.gender,
      skinTone: childData.skinTone,
      eyeColor: childData.eyeColor,
      hairColor: childData.hairColor,
      hairStyle: childData.hairStyle || undefined,
      interests: childData.interests,
      userId: childData.userId,
      createdAt: childData.createdAt,
    };

    const effectivePageCount = pageCount || 4;

    // In development, process inline since Netlify background functions aren't available
    if (process.env.NODE_ENV === "development") {
      console.log("[Generate] Processing story inline (dev mode)...");

      const generatedStory = await generateStory(
        child,
        moral,
        customSetting || undefined,
        customTheme || undefined,
        effectivePageCount
      );

      const story = await prisma.story.create({
        data: {
          title: generatedStory.title,
          moral,
          content: JSON.parse(JSON.stringify(generatedStory.pages)),
          childId,
          userId,
          pageCount: generatedStory.pages.length,
        },
        include: { child: true },
      });

      console.log(`[Generate] Story created: ${story.id}`);

      return NextResponse.json({
        success: true,
        storyId: story.id,
      });
    }

    // In production, create a job for Netlify background function processing
    const job = await prisma.storyJob.create({
      data: {
        userId,
        childId,
        moral,
        customSetting: customSetting || null,
        customTheme: customTheme || null,
        pageCount: effectivePageCount,
        status: "processing",
        progress: 0,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: "Story generation started in the background"
    });
  } catch (error) {
    console.error("Error generating story:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate story",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
