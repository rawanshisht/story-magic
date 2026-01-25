import { Child, StoryPage } from "@/types";
import { getAgeSettings } from "@/config/age-settings";
import { getMoralById } from "@/config/morals";
import {
  generateStoryText,
  generateIllustration,
  downloadImageAsBase64,
  saveImageForReview,
  generateStoryFolderName,
} from "./openai";

interface GeneratedStory {
  title: string;
  pages: StoryPage[];
}

export async function generateStory(
  child: Child,
  moralId: string,
  customSetting?: string,
  customTheme?: string,
  pageCount?: number
): Promise<GeneratedStory> {
  const ageSettings = getAgeSettings(child.age);
  const moral = getMoralById(moralId);

  if (!moral) {
    throw new Error("Invalid moral selected");
  }

  // Use provided pageCount or fall back to age-based default
  const effectivePageCount = pageCount ?? ageSettings.pageCount;

  // Build character description
  const characterDescription = buildCharacterDescription(child);

  // Generate story text prompt
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

  // Generate the story text
  const storyText = await generateStoryText(storyPrompt);

  // Parse the story into pages
  const parsedStory = parseStoryText(storyText, effectivePageCount);

  // Generate illustrations for each page
  const pagesWithImages = await generateIllustrations(
    parsedStory,
    characterDescription,
    child.name,
    child,
    moral.label
  );

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

// Create a detailed character reference for consistent illustrations
function buildCharacterReference(child: Child): string {
  const genderTerm = child.gender === "female" ? "girl" : "boy";
  const hairDescription = child.hairStyle
    ? `${child.hairColor} ${child.hairStyle} hair`
    : `${child.hairColor} hair`;

  return `CHARACTER DESIGN REFERENCE (maintain exact consistency across all pages):
- Character: Young ${genderTerm} named ${child.name}, approximately ${child.age} years old
- Face: Round, friendly face with ${child.eyeColor} eyes, button nose, warm smile
- Skin: ${child.skinTone} skin tone (maintain exact same shade throughout)
- Hair: ${hairDescription} (keep exact same style and color in every image)
- Build: Age-appropriate child proportions
- Expression: Generally happy and engaged
- Clothing: Simple, colorful outfit (keep the SAME outfit in all images - pick one and stick with it)`;
}

// Define a consistent art style for the entire story
function buildStyleReference(): string {
  return `ART STYLE (use this EXACT style for all pages):
- Style: Warm, friendly children's book illustration, Pixar/Disney inspired
- Rendering: Soft digital painting with gentle gradients, high-quality finish
- Color Palette: Warm and inviting - soft golden yellows (#F5D76E), gentle sky blues (#7EC8E3), warm coral oranges (#F7971E), soft mint greens (#88D8B0), and creamy whites (#FFFAF0). Use these tones consistently across all pages.
- Lighting: Soft, warm lighting like gentle morning or golden hour, with gentle shadows
- Lines: Clean, smooth rounded edges, no sharp angles
- Background: Simple, soft-focus environments with cohesive color schemes
- Mood: Cheerful, safe, inviting atmosphere throughout the story

CONSISTENCY RULES FOR ALL PAGES:
- Keep the SAME color palette, lighting style, and art style in EVERY illustration
- Backgrounds should have the same soft, warm treatment on every page
- Character and objects should receive the same lighting treatment on every page`;
}

function buildStoryPrompt(
  child: Child,
  characterDescription: string,
  moralLabel: string,
  moralDescription: string,
  ageSettings: ReturnType<typeof getAgeSettings>,
  customSetting?: string,
  customTheme?: string,
  pageCount?: number
): string {
  const setting = customSetting || "a magical world";
  const theme =
    customTheme || ageSettings.themes[Math.floor(Math.random() * ageSettings.themes.length)];
  const effectivePageCount = pageCount ?? ageSettings.pageCount;

  return `Write a children's story for a ${child.age}-year-old child.

Main Character: ${characterDescription}

Story Requirements:
- Number of pages: ${effectivePageCount}
- Words per page: ${ageSettings.wordsPerPage.min}-${ageSettings.wordsPerPage.max} words
- Vocabulary level: ${ageSettings.vocabulary}
- Sentence structure: ${ageSettings.sentenceStructure}
- Moral of the story: ${moralLabel} - ${moralDescription}
- Setting: ${setting}
- Theme: ${theme}

Instructions:
1. Make ${child.name} the main character who learns about ${moralLabel.toLowerCase()}
2. Include ${child.name}'s interests (${child.interests.join(", ")}) naturally in the story
3. Use engaging, age-appropriate language
4. End with a clear but not preachy moral lesson
5. Make the story fun and imaginative

Format your response EXACTLY as follows:
TITLE: [Story Title]

PAGE 1:
[Text for page 1]

PAGE 2:
[Text for page 2]

... and so on for all ${effectivePageCount} pages.`;
}

interface ParsedStory {
  title: string;
  pages: { pageNumber: number; text: string }[];
}

function parseStoryText(storyText: string, expectedPages: number): ParsedStory {
  const lines = storyText.split("\n").filter((line) => line.trim());

  // Extract title
  const titleLine = lines.find((line) => line.startsWith("TITLE:"));
  const title = titleLine
    ? titleLine.replace("TITLE:", "").trim()
    : "A Magical Adventure";

  // Extract pages
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

  // Don't forget the last page
  if (currentPage > 0 && currentText.trim()) {
    pages.push({
      pageNumber: currentPage,
      text: currentText.trim(),
    });
  }

  // Ensure we have the expected number of pages
  while (pages.length < expectedPages) {
    pages.push({
      pageNumber: pages.length + 1,
      text: "The End.",
    });
  }

  return { title, pages: pages.slice(0, expectedPages) };
}

/**
 * Process items with controlled concurrency to avoid rate limits
 */
function getPageMood(pageNumber: number, totalPages: number): string {
  if (pageNumber === 1) return "warm, welcoming, full of wonder";
  if (pageNumber === totalPages) return "triumphant, heartwarming, satisfying";
  if (pageNumber === Math.floor(totalPages / 2)) return "magical, pivotal";
  return "cheerful, engaging";
}

async function processWithConcurrency<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  maxConcurrent: number = 5
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let currentIndex = 0;

  async function processNext(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index];
      try {
        const result = await processor(item);
        results[index] = { status: "fulfilled", value: result };
      } catch (error) {
        results[index] = { status: "rejected", reason: error };
      }
    }
  }

  // Start up to maxConcurrent workers
  const workers = Array(Math.min(maxConcurrent, items.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
}

async function generateIllustrations(
  parsedStory: ParsedStory,
  characterDescription: string,
  childName: string,
  child: Child,
  moral?: string
): Promise<StoryPage[]> {
  const characterReference = buildCharacterReference(child);
  const styleReference = buildStyleReference();

  // Generate folder name for saving images for review
  const reviewFolderName = generateStoryFolderName(parsedStory.title, childName);

  // Build all prompts upfront
  const pagePrompts = parsedStory.pages.map((page) => {
    const mood = getPageMood(page.pageNumber, parsedStory.pages.length);
    return {
      page,
      prompt: `${styleReference}

${characterReference}

SCENE FOR PAGE ${page.pageNumber}:
${page.text.slice(0, 300)}

MOOD FOR THIS PAGE: ${mood}

IMPORTANT CONSISTENCY INSTRUCTIONS:
- This is part of a ${parsedStory.pages.length}-page story - visual consistency is CRITICAL
- Maintain EXACT same character design, clothing, and proportions across ALL pages
- Use the SAME color palette, lighting style, and art style as established for this story
- Keep background treatment consistent - same soft, warm style on every page
- The main character ${childName} MUST be prominently featured and clearly recognizable
- Do NOT change character appearance, clothing, or proportions under any circumstances`,
    };
  });

  console.log(`[Image Generation] Starting parallel generation for ${pagePrompts.length} pages...`);
  const startTime = Date.now();

  // Phase 1: Generate all images in parallel (with concurrency limit)
  const imageResults = await processWithConcurrency(
    pagePrompts,
    async ({ page, prompt }) => {
      console.log(`[Image Generation] Generating image for page ${page.pageNumber}...`);
      const url = await generateIllustration(prompt);
      console.log(`[Image Generation] Page ${page.pageNumber} image generated`);
      return { pageNumber: page.pageNumber, url };
    },
    5 // Max 5 concurrent image generations
  );

  const generationTime = Date.now() - startTime;
  console.log(`[Image Generation] All images generated in ${generationTime}ms`);

  // Collect successful image URLs for downloading
  const successfulImages: { pageNumber: number; url: string }[] = [];
  const failedPages: number[] = [];

  for (const result of imageResults) {
    if (result.status === "fulfilled") {
      const { pageNumber, url } = result.value;
      console.log(`[Image Generation] Page ${pageNumber} result - URL type: ${typeof url}, length: ${url?.length}, starts with: ${url?.slice(0, 30)}`);

      // Validate URL - accept both http URLs and base64 data URIs
      if (url && (url.startsWith("http") || url.startsWith("data:image/"))) {
        console.log(`[Image Generation] Page ${pageNumber} URL is valid`);
        successfulImages.push(result.value);
      } else {
        console.error(`[Image Generation] Page ${pageNumber} returned invalid URL:`, url);
        console.error(`[Image Generation] URL details: type=${typeof url}, truthy=${!!url}, value="${url}"`);
        failedPages.push(pageNumber);
      }
    } else {
      console.error("[Image Generation] Image generation failed:", result.reason);
      if (result.reason instanceof Error) {
        console.error("[Image Generation] Error details:", result.reason.message, result.reason.stack);
      }
    }
  }

  // Track which pages succeeded
  const succeededPageNumbers = new Set(successfulImages.map((img) => img.pageNumber));
  for (const page of parsedStory.pages) {
    if (!succeededPageNumbers.has(page.pageNumber)) {
      failedPages.push(page.pageNumber);
    }
  }

  if (failedPages.length > 0) {
    console.warn(`[Image Generation] Failed to generate images for pages: ${failedPages.join(", ")}`);
  }

  // Phase 2: Download all images in parallel (with concurrency limit)
  console.log(`[Image Generation] Starting parallel download for ${successfulImages.length} images...`);
  const downloadStartTime = Date.now();

  const downloadResults = await processWithConcurrency(
    successfulImages,
    async ({ pageNumber, url }) => {
      console.log(`[Image Generation] Downloading image for page ${pageNumber}...`);
      const base64 = await downloadImageAsBase64(url);
      console.log(`[Image Generation] Page ${pageNumber} image downloaded`);
      return { pageNumber, url, base64 };
    },
    5 // Max 5 concurrent downloads
  );

  const downloadTime = Date.now() - downloadStartTime;
  console.log(`[Image Generation] All images downloaded in ${downloadTime}ms`);

  // Build the results map
  const imageDataMap = new Map<number, { url: string; base64?: string }>();

  // First, set placeholders for all pages
  for (const page of parsedStory.pages) {
    imageDataMap.set(page.pageNumber, { url: "/placeholder-illustration.svg" });
  }

  // Then, set successful generations (URL only if download failed)
  for (const img of successfulImages) {
    imageDataMap.set(img.pageNumber, { url: img.url });
  }

  // Finally, update with successful downloads (URL + base64)
  // Also save images for manual review
  const imagesToSave: { pageNumber: number; base64: string }[] = [];
  for (const result of downloadResults) {
    if (result.status === "fulfilled") {
      const { pageNumber, url, base64 } = result.value;
      imageDataMap.set(pageNumber, { url, base64 });
      imagesToSave.push({ pageNumber, base64 });
    } else {
      console.error("[Image Generation] Image download failed:", result.reason);
    }
  }

  // Phase 3: Save images for manual review (in parallel)
  if (imagesToSave.length > 0) {
    console.log(`[Image Review] Saving ${imagesToSave.length} images to review folder: ${reviewFolderName}`);
    const saveStartTime = Date.now();

    await processWithConcurrency(
      imagesToSave,
      async ({ pageNumber, base64 }) => {
        await saveImageForReview(
          base64,
          reviewFolderName,
          pageNumber,
          pageNumber === 1
            ? { title: parsedStory.title, childName, moral }
            : undefined
        );
      },
      5
    );

    const saveTime = Date.now() - saveStartTime;
    console.log(`[Image Review] All images saved in ${saveTime}ms`);
  }

  // Build final pages array in order
  const pagesWithImages: StoryPage[] = parsedStory.pages.map((page) => {
    const imageData = imageDataMap.get(page.pageNumber)!;
    return {
      pageNumber: page.pageNumber,
      text: page.text,
      imageUrl: imageData.url,
      imageBase64: imageData.base64,
    };
  });

  const totalTime = Date.now() - startTime;
  console.log(`[Image Generation] Total time: ${totalTime}ms (generation: ${generationTime}ms, download: ${downloadTime}ms)`);

  return pagesWithImages;
}
