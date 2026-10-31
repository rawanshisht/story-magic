import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "@/lib/openai";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import { checkRateLimit } from "@/lib/rate-limit";

// Story pages are short; this also stays under OpenAI's 4096 character limit.
const MAX_TTS_CHARS = 2000;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json().catch(() => ({}));

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (text.length > MAX_TTS_CHARS) {
    return NextResponse.json(
      { error: `Text must be ${MAX_TTS_CHARS} characters or less` },
      { status: 400 }
    );
  }

  if (!checkRateLimit(`tts:${userId}`, 30, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const audioBuffer = await generateSpeech(text);
    
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return NextResponse.json(
      { error: "Failed to generate speech", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
