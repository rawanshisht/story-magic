import { Child, StoryPage } from "@/types";
import { getAgeSettings } from "@/config/age-settings";
import { getMoralById } from "@/config/morals";
import { generateStoryText, generateIllustration, downloadImageAsBase64 } from "./openai";

interface GeneratedStory {
  title: string;
  pages: StoryPage[];
}

export async function generateStory(
  child: Child,
  moralId: string,
  customSetting?: string,
  customTheme?: string
): Promise<GeneratedStory> {
  const ageSettings = getAgeSettings(child.age);
  const moral = getMoralById(moralId);

  if (!moral) {
    throw new Error("Invalid moral selected");
  }

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
    customTheme
  );

  // Generate the story text
  const storyText = await generateStoryText(storyPrompt);

  // Parse the story into pages
  const parsedStory = parseStoryText(storyText, ageSettings.pageCount);

  // Generate illustrations for each page
  const pagesWithImages = await generateIllustrations(
    parsedStory,
    characterDescription,
    child.name,
    child
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
- Style: Warm, friendly children's book illustration
- Rendering: Soft digital painting with gentle gradients
- Colors: Bright, saturated but not harsh, consistent color palette
- Lighting: Soft, warm lighting with gentle shadows
- Lines: Clean, rounded edges, no sharp angles
- Background: Simple, not overly detailed, soft focus
- Mood: Cheerful, safe, inviting atmosphere`;
}

function buildStoryPrompt(
  child: Child,
  characterDescription: string,
  moralLabel: string,
  moralDescription: string,
  ageSettings: ReturnType<typeof getAgeSettings>,
  customSetting?: string,
  customTheme?: string
): string {
  const setting = customSetting || "a magical world";
  const theme =
    customTheme || ageSettings.themes[Math.floor(Math.random() * ageSettings.themes.length)];

  return `Write a children's story for a ${child.age}-year-old child.

Main Character: ${characterDescription}

Story Requirements:
- Number of pages: ${ageSettings.pageCount}
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

... and so on for all ${ageSettings.pageCount} pages.`;
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

async function generateIllustrations(
  parsedStory: ParsedStory,
  characterDescription: string,
  childName: string,
  child: Child
): Promise<StoryPage[]> {
  const pagesWithImages: StoryPage[] = [];
  const characterReference = buildCharacterReference(child);
  const styleReference = buildStyleReference();

  for (const page of parsedStory.pages) {
    // Build a detailed, consistent prompt for each page
    const illustrationPrompt = `${styleReference}

${characterReference}

SCENE FOR PAGE ${page.pageNumber}:
${page.text.slice(0, 300)}

IMPORTANT INSTRUCTIONS:
- The main character ${childName} MUST be prominently featured and clearly recognizable
- Maintain EXACT same character design as described above
- Keep the same art style, color palette, and visual tone
- This is page ${page.pageNumber} of a continuous story - visual consistency is critical
- Do NOT change the character's appearance, clothing, or proportions`;

    try {
      const imageUrl = await generateIllustration(illustrationPrompt);

      // Download and convert image to base64 for PDF generation (DALL-E URLs expire)
      let imageBase64: string | undefined;
      try {
        imageBase64 = await downloadImageAsBase64(imageUrl);
      } catch (downloadError) {
        console.error(
          `Error downloading image for page ${page.pageNumber}:`,
          downloadError
        );
        // Continue without base64 - PDF will use placeholder
      }

      pagesWithImages.push({
        pageNumber: page.pageNumber,
        text: page.text,
        imageUrl,
        imageBase64,
      });
    } catch (error) {
      console.error(
        `Error generating illustration for page ${page.pageNumber}:`,
        error
      );
      // Use a placeholder if illustration fails
      pagesWithImages.push({
        pageNumber: page.pageNumber,
        text: page.text,
        imageUrl: "/placeholder-illustration.svg",
      });
    }
  }

  return pagesWithImages;
}
