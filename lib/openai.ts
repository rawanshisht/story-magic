import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Download image from URL and convert to base64
export async function downloadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

export async function generateStoryText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
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
    temperature: 0.8,
    max_tokens: 4000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateIllustration(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a children's book illustration. CRITICAL: Follow the exact character design and art style specifications provided. Maintain consistency with other pages in this book series.

${prompt}

Technical requirements: Safe for children, no scary elements, bright cheerful colors, professional children's book illustration quality.`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  });

  return response.data?.[0]?.url || "";
}
