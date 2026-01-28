import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import prisma from "../lib/prisma";
import { Child, StoryPage } from "../types";
import { getAgeSettings } from "../config/age-settings";
import { getMoralById } from "../config/morals";
import {
  generateStoryText,
  generateIllustration,
  downloadImageAsBase64,
} from "../lib/openai";

interface BackgroundRequest {
  jobId: string;
}

async function updateJobProgress(
  jobId: string,
  progress: number,
  storyId?: string
) {
  await prisma.storyJob.update({
    where: { id: jobId },
    data: {
      progress,
      storyId,
      updatedAt: new Date(),
    },
  });
}

async function markJobFailed(jobId: string, error: string) {
  await prisma.storyJob.update({
    where: { id: jobId },
    data: {
      status: "failed",
      error,
      updatedAt: new Date(),
    },
  });
}

async function markJobComplete(jobId: string, storyId: string) {
  await prisma.storyJob.update({
    where: { id: jobId },
    data: {
      status: "complete",
      progress: 100,
      storyId,
      updatedAt: new Date(),
    },
  });
}

async function generateStory(
  child: Child,
  moralId: string,
  customSetting: string | undefined,
  customTheme: string | undefined,
  pageCount: number,
  onProgress: (page: number, total: number) => Promise<void>
): Promise<{ title: string; pages: StoryPage[] }> {
  const ageSettings = getAgeSettings(child.age);
  const moral = getMoralById(moralId);

  if (!moral) {
    throw new Error("Invalid moral selected");
  }

  const effectivePageCount = pageCount ?? ageSettings.pageCount;
  const characterDescription = buildCharacterDescription(child);
  const storyPrompt = buildStoryPrompt(
    child,
    characterDescription,
    moral.label,
    moral.description,
    ageSettings,
    customSetting,
    customTheme,
    effectivePageCount
  );

  console.log("[Generate] Generating story text...");
  const storyText = await generateStoryText(storyPrompt);
  const parsedStory = parseStoryText(storyText, effectivePageCount);

  console.log(`[Generate] Generating ${parsedStory.pages.length} illustrations...`);
  const pagesWithImages: StoryPage[] = [];

  for (let i = 0; i < parsedStory.pages.length; i++) {
    const page = parsedStory.pages[i];
    const pageNum = i + 1;

    console.log(`[Generate] Generating page ${pageNum}/${parsedStory.pages.length}...`);

    const characterReference = buildCharacterReference(child);
    const styleReference = buildStyleReference();
    const mood = getPageMood(pageNum, parsedStory.pages.length);

    const prompt = `${styleReference}` +
`
` + `${characterReference}` +
`
` + `PAGE ${page.pageNumber} of ${parsedStory.pages.length}:
Scene: ${page.text.slice(0, 250)}` +
`
` + `Mood: ${mood}` +
`
` + `REMEMBER: This is part of a ${parsedStory.pages.length}-page story. The main character ${child.name} MUST look exactly the same in this image.`;

    const imageUrl = await generateIllustration(prompt);
    const base64 = await downloadImageAsBase64(imageUrl);

    pagesWithImages.push({
      pageNumber: page.pageNumber,
      text: page.text,
      imageUrl,
      imageBase64: base64,
    });

    await onProgress(pageNum, parsedStory.pages.length);
  }

  return {
    title: parsedStory.title,
    pages: pagesWithImages,
  };
}

function buildCharacterDescription(child: Child): string {
  const genderPronoun = child.gender === "female" ? "she" : "he";
  const genderPossessive = child.gender === "female" ? "her" : "his";

  return `A ${child.age}-year-old ${child.gender} child named ${child.name} with ${child.skinTone} skin, ${child.eyeColor} eyes, and ${child.hairColor} ${child.hairStyle || "hair"}. ${genderPronoun.charAt(0).toUpperCase() + genderPronoun.slice(1)} loves ${child.interests.join(", ")}.`;
}

function buildCharacterReference(child: Child): string {
  const genderTerm = child.gender === "female" ? "girl" : "boy";
  const hairDescription = child.hairStyle
    ? `${child.hairColor} ${child.hairStyle} hair`
    : `${child.hairColor} hair`;

  return `CHARACTER CONSISTENCY - MUST FOLLOW EXACTLY IN ALL PAGES:
Main Character: ${child.name}, a ${child.age}-year-old ${genderTerm}
- Face: ${child.skinTone} skin, ${child.eyeColor} eyes, button nose, warm friendly smile
- Hair: ${hairDescription} (exact same style and color in EVERY image)
- Body: Same proportions in every image
- Outfit: ${child.gender === "female" ? "dress" : "shirt and pants"} (exact same outfit in every image)
- Expression: Always happy and engaged, same expression style`;
}

function buildStyleReference(): string {
  return `ART STYLE FOR ALL PAGES (MUST BE CONSISTENT):
- Technique: Watercolor with soft brushstrokes, translucent washes
- Colors: Soft pastel palette - sky blues, soft pinks, mint greens, gentle lavenders
- Background: Light, airy watercolor washes
- Mood: Whimsical, gentle, dreamy`;
}

function getPageMood(pageNumber: number, totalPages: number): string {
  if (pageNumber === 1) return "warm, welcoming, full of wonder";
  if (pageNumber === totalPages) return "triumphant, heartwarming, satisfying";
  if (pageNumber === Math.floor(totalPages / 2)) return "magical, pivotal";
  return "cheerful, engaging";
}

function buildStoryPrompt(
  child: Child,
  characterDescription: string,
  moralLabel: string,
  moralDescription: string,
  ageSettings: ReturnType<typeof getAgeSettings>,
  customSetting: string | undefined,
  customTheme: string | undefined,
  pageCount: number
): string {
  const setting = customSetting || "a magical world";
  const theme =
    customTheme || ageSettings.themes[Math.floor(Math.random() * ageSettings.themes.length)];

  return `Write a children's story for a ${child.age}-year-old child.` +
`
` + `Main Character: ${characterDescription}` +
`
` + `Story Requirements:` +
`- Number of pages: ${pageCount}` +
`- Words per page: ${ageSettings.wordsPerPage.min}-${ageSettings.wordsPerPage.max} words` +
`- Vocabulary level: ${ageSettings.vocabulary}` +
`- Sentence structure: ${ageSettings.sentenceStructure}` +
`- Moral of the story: ${moralLabel} - ${moralDescription}` +
`- Setting: ${setting}` +
`- Theme: ${theme}` +
`
` + `Instructions:` +
`1. Make ${child.name} the main character who learns about ${moralLabel.toLowerCase()}` +
`2. Include ${child.name}'s interests (${child.interests.join(", ")}) naturally in the story` +
`3. Use engaging, age-appropriate language` +
`4. End with a clear but not preachy moral lesson` +
`
` + `Format your response EXACTLY as follows:` +
`TITLE: [Story Title]` +
`
` + `PAGE 1:` +
`[Text for page 1]` +
`
` + `PAGE 2:` +
`[Text for page 2]` +
`
` + `... and so on for all ${pageCount} pages.`;
}

function parseStoryText(storyText: string, expectedPages: number) {
  const lines = storyText.split("\n").filter((line) => line.trim());

  const titleLine = lines.find((line) => line.startsWith("TITLE:"));
  const title = titleLine
    ? titleLine.replace("TITLE:", "").trim()
    : "A Magical Adventure";

  const pages: { pageNumber: number; text: string }[] = [];
  let currentPage = 0;
  let currentText = "";

  for (const line of lines) {
    const pageMatch = line.match(/^PAGE\s*(\d+):/i);
    if (pageMatch) {
      if (currentPage > 0 && currentText.trim()) {
        pages.push({
          pageNumber: currentPage,
          text: currentText.trim(),
        });
      }
      currentPage = parseInt(pageMatch[1]);
      currentText = line.replace(/^PAGE\s*\d+:/i, "").trim();
    } else if (currentPage > 0 && !line.startsWith("TITLE:")) {
      currentText += " " + line.trim();
    }
  }

  if (currentPage > 0 && currentText.trim()) {
    pages.push({
      pageNumber: currentPage,
      text: currentText.trim(),
    });
  }

  while (pages.length < expectedPages) {
    pages.push({
      pageNumber: pages.length + 1,
      text: "The End.",
    });
  }

  return { title, pages: pages.slice(0, expectedPages) };
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("[Generate Background] Function started");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body: BackgroundRequest = JSON.parse(event.body || "{}");
    const { jobId } = body;

    if (!jobId) {
      console.error("[Generate Background] Missing jobId");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing jobId" }),
      };
    }

    const job = await prisma.storyJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      console.error(`[Generate Background] Job not found: ${jobId}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Job not found" }),
      };
    }

    const childData = await prisma.child.findUnique({
      where: { id: job.childId },
    });

    if (!childData) {
      await markJobFailed(jobId, "Child not found");
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Child not found" }),
      };
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

    console.log(`[Generate Background] Starting generation for job ${jobId}`);
    
    // Convert nulls from DB to undefined
    const customSetting = job.customSetting || undefined;
    const customTheme = job.customTheme || undefined;
    
    const generatedStory = await generateStory(
      child,
      job.moral,
      customSetting,
      customTheme,
      job.pageCount,
      async (page, total) => {
        const progress = Math.round((page / total) * 100);
        await updateJobProgress(jobId, progress);
        console.log(`[Generate Background] Progress: ${progress}%`);
      }
    );

    console.log("[Generate Background] Saving story to database...");
    const story = await prisma.story.create({
      data: {
        title: generatedStory.title,
        moral: job.moral,
        content: JSON.parse(JSON.stringify(generatedStory.pages)),
        childId: job.childId,
        userId: job.userId,
        pageCount: generatedStory.pages.length,
      },
      include: { child: true },
    });

    await markJobComplete(jobId, story.id);

    console.log(`[Generate Background] Job ${jobId} completed. Story ${story.id} created.`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, storyId: story.id }),
    };
  } catch (error) {
    console.error("[Generate Background] Error:", error);
    
    try {
      const body: BackgroundRequest = JSON.parse(event.body || "{}");
      if (body.jobId) {
        await markJobFailed(body.jobId, error instanceof Error ? error.message : "Unknown error");
      }
    } catch (e) {
      // Ignore
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate story",
      }),
    };
  }
};
