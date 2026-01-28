import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { generateSpeech } from "@/lib/openai";
import { StoryPage } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const story = await prisma.story.findUnique({
      where: { id, userId },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const pages = story.content as unknown as StoryPage[];
    const texts = pages
      .map((p) => p.text)
      .filter((t): t is string => Boolean(t));

    if (texts.length === 0) {
      return NextResponse.json({ error: "Story has no text content" }, { status: 400 });
    }

    // Generate TTS for each page sequentially to avoid rate limits
    const audioBuffers: ArrayBuffer[] = [];
    for (const text of texts) {
      const buffer = await generateSpeech(text);
      audioBuffers.push(buffer);
    }

    // Concatenate all MP3 buffers
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    const filename = story.title.replace(/[^a-zA-Z0-9 ]/g, "").trim() + ".mp3";

    return new NextResponse(combined.buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": combined.byteLength.toString(),
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating full audio:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
