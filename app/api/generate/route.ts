import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateStory } from "@/lib/story-generator";
import { Child } from "@/types";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, moral, customSetting, customTheme } = body;

    if (!childId || !moral) {
      return NextResponse.json(
        { error: "Child and moral are required" },
        { status: 400 }
      );
    }

    // Fetch child data
    const childData = await prisma.child.findUnique({
      where: {
        id: childId,
        userId: session.user.id,
      },
    });

    if (!childData) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Convert Prisma model to our Child type
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

    // Generate the story
    const generatedStory = await generateStory(
      child,
      moral,
      customSetting,
      customTheme
    );

    // Save to database
    const story = await prisma.story.create({
      data: {
        title: generatedStory.title,
        moral,
        content: JSON.parse(JSON.stringify(generatedStory.pages)),
        childId,
        userId: session.user.id,
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
