import OpenAI from "openai";

// Created on first use so that importing this module (e.g. during `next build`)
// doesn't require OPENAI_API_KEY to be set.
let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

// Story content can be edited by its owner, so only fetch images from hosts
// we know serve generated illustrations.
const ALLOWED_IMAGE_HOSTS = new Set(["oaidalleapiprodscus.blob.core.windows.net"]);

// Download image from URL and convert to base64
export async function downloadImageAsBase64(url: string): Promise<string> {
  // If URL is already base64, return as-is
  if (url.startsWith("data:image/")) {
    return url;
  }

  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) {
    throw new Error(`Refusing to download image from untrusted host: ${parsed.hostname}`);
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";

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
  const mp3 = await getOpenAI().audio.speech.create({
    model: "tts-1",
    voice: "coral",
    input: input,
    speed: 0.85,
  });

  return await mp3.arrayBuffer();
}

export async function generateStoryText(prompt: string): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
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
    const response = await getOpenAI().images.generate({
      model: "gpt-image-1",
      prompt: `Children's book watercolor illustration. Soft brushstrokes, delicate watercolor style.

${prompt}

CRITICAL REQUIREMENTS:
- ABSOLUTELY NO TEXT, letters, words, numbers, signs, labels, captions, titles, or any written content anywhere in the image
- No speech bubbles, no banners, no signs with writing
- Pure illustration only - let the visuals tell the story without any text elements`,
      size: "1024x1024",
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;

    if (b64) {
      console.log(`[OpenAI Image] Received base64 data (length: ${b64.length})`);
      return `data:image/png;base64,${b64}`;
    } else {
      console.error(`[OpenAI Image] No base64 data in response`);
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