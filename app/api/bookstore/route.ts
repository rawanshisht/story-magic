import { NextResponse } from "next/server";
import { getCachedPublicStories } from "@/lib/data-cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    // Invalid or out-of-range values are clamped by getCachedPublicStories.
    return NextResponse.json(await getCachedPublicStories(page, limit));
  } catch (error) {
    console.error("Error fetching public stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}
