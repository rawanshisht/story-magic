import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Directory for saving generated images for manual review
const REVIEW_IMAGES_DIR = path.join(process.cwd(), "generated-images-review");

/**
 * Save an image to the review folder for manual inspection
 */
export async function saveImageForReview(
  base64Data: string,
  storyFolder: string,
  pageNumber: number,
  metadata?: { title?: string; childName?: string; moral?: string }
): Promise<string> {
  try {
    const storyDir = path.join(REVIEW_IMAGES_DIR, storyFolder);

    // Ensure directory exists
    await fs.mkdir(storyDir, { recursive: true });

    // Extract the actual base64 data (remove data:image/png;base64, prefix)
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Content, "base64");

    // Save the image
    const filename = `page-${String(pageNumber).padStart(2, "0")}.png`;
    const filepath = path.join(storyDir, filename);
    await fs.writeFile(filepath, buffer);

    // Save metadata file on first page
    if (pageNumber === 1 && metadata) {
      const metadataPath = path.join(storyDir, "metadata.json");
      await fs.writeFile(
        metadataPath,
        JSON.stringify(
          {
            ...metadata,
            generatedAt: new Date().toISOString(),
            folder: storyFolder,
          },
          null,
          2
        )
      );
    }

    console.log(`[Image Review] Saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error("[Image Review] Failed to save image:", error);
    throw error;
  }
}

/**
 * Generate a unique folder name for a story
 */
export function generateStoryFolderName(title: string, childName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30);
  const sanitizedChildName = childName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 15);
  return `${timestamp}_${sanitizedChildName}_${sanitizedTitle}`;
}

// Download image from URL and convert to base64
export async function downloadImageAsBase64(url: string): Promise<string> {
  console.log(`[OpenAI Image] Downloading image from URL (length: ${url.length}): ${url.slice(0, 80)}...`);

  // If URL is already base64, return as-is
  if (url.startsWith("data:image/")) {
    console.log(`[OpenAI Image] URL is already base64 data, returning as-is`);
    return url;
  }

  try {
    const response = await fetch(url);
    console.log(`[OpenAI Image] Fetch response: status=${response.status}, ok=${response.ok}, contentType=${response.headers.get("content-type")}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log(`[OpenAI Image] Downloaded ${arrayBuffer.byteLength} bytes`);

    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
    console.log(`[OpenAI Image] Converted to base64 (length: ${base64.length}), contentType: ${contentType}`);

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("[OpenAI Image] Error downloading image:", error);
    if (error instanceof Error) {
      console.error(`[OpenAI Image] Download error details: ${error.name}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate speech from text using OpenAI TTS-1 model
 */
export async function generateSpeech(input: string): Promise<ArrayBuffer> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: input,
    speed: 0.85,
  });

  return await mp3.arrayBuffer();
}

export async function generateStoryText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a children's book author who writes engaging, age-appropriate stories with moral lessons. Your stories are vivid, imaginative, and always have happy endings.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_completion_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateIllustration(prompt: string): Promise<string> {
  const truncatedPrompt = prompt.slice(0, 100) + "...";
  console.log(`[OpenAI Image] Starting generation with prompt: ${truncatedPrompt}`);

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Children's book watercolor illustration. NO TEXT OR WORDS anywhere in the image. Soft brushstrokes, delicate watercolor style.

${prompt}

IMPORTANT: Do not include any text, letters, words, or writing in the image.`,
      n: 1,
      size: "1024x1024",
      quality: "medium",
      output_format: "png",
    });

    console.log(`[OpenAI Image] Response received:`, JSON.stringify({
      hasData: !!response.data,
      dataLength: response.data?.length,
    }, null, 2));

    const b64 = response.data?.[0]?.b64_json;
    const url = response.data?.[0]?.url;

    if (b64) {
      console.log(`[OpenAI Image] Received base64 data (length: ${b64.length})`);
      return `data:image/png;base64,${b64}`;
    } else if (url) {
      console.log(`[OpenAI Image] Received URL`);
      return url;
    } else {
      console.error(`[OpenAI Image] No base64 or URL in response`);
      return "";
    }
  } catch (error) {
    console.error(`[OpenAI Image] Error generating image:`, error);
    if (error instanceof Error) {
      console.error(`[OpenAI Image] Error: ${error.message}`);
    }
    throw error;
  }
}
