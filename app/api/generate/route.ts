import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { generateStory } from "@/lib/story-generator";
import { Child } from "@/types";

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

    if (pageCount !== undefined && (pageCount < 4 || pageCount > 16)) {
      return NextResponse.json(
        { error: "Page count must be between 4 and 16" },
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

    const generatedStory = await generateStory(
      child,
      moral,
      customSetting,
      customTheme,
      pageCount
    );

    const story = await prisma.story.create({
      data: {
        title: generatedStory.title,
        moral,
        content: JSON.parse(JSON.stringify(generatedStory.pages)),
        childId,
        userId: userId,
        pageCount: generatedStory.pages.length,
      },
      include: { child: true },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate story",
      },
      { status: 500 }
    );
  }
}
