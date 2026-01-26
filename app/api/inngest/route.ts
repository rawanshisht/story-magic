import { serve } from "inngest/next";
import { inngest, EVENTS } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { generateStory } from "@/lib/story-generator";
import { Child } from "@/types";

interface StoryGenerationEvent {
  data: {
    userId: string;
    childId: string;
    moral: string;
    customSetting?: string;
    customTheme?: string;
    pageCount?: number;
  };
}

async function generateStoryJob(
  userId: string,
  childId: string,
  moral: string,
  customSetting?: string,
  customTheme?: string,
  pageCount?: number
) {
  const startTime = Date.now();
  console.log(`[Inngest] Starting story generation for user: ${userId}, child: ${childId}`);

  try {
    const childData = await prisma.child.findUnique({
      where: { id: childId, userId },
    });

    if (!childData) {
      throw new Error("Child not found");
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
        userId,
        pageCount: generatedStory.pages.length,
      },
      include: { child: true },
    });

    const duration = Date.now() - startTime;
    console.log(`[Inngest] Story generation completed in ${duration}ms`);

    return {
      storyId: story.id,
      title: story.title,
      pageCount: story.pageCount,
      childName: story.child?.name,
      createdAt: story.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("[Inngest] Story generation failed:", error);
    throw error;
  }
}

const inngestFunctions = [
  {
    name: "Generate Story",
    event: EVENTS.STORY_GENERATION_STARTED,
    handler: async (event: StoryGenerationEvent) => {
      const { userId, childId, moral, customSetting, customTheme, pageCount } = event.data;

      try {
        const result = await generateStoryJob(
          userId,
          childId,
          moral,
          customSetting,
          customTheme,
          pageCount
        );

        await inngest.send({
          name: EVENTS.STORY_GENERATION_COMPLETED,
          data: {
            userId,
            storyId: result.storyId,
            title: result.title,
            pageCount: result.pageCount,
            childName: result.childName,
            createdAt: result.createdAt,
          },
        });

        return { success: true, storyId: result.storyId };
      } catch (error) {
        await inngest.send({
          name: EVENTS.STORY_GENERATION_FAILED,
          data: {
            userId,
            childId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });

        throw error;
      }
    },
  },
];

export const { GET, POST } = serve({
  client: inngest,
  functions: inngestFunctions as unknown as Parameters<typeof serve>[0]["functions"],
});
