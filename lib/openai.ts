import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    voice: "coral",
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