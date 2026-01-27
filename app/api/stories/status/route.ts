import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const storyId = searchParams.get("storyId");

    if (jobId) {
      const job = await prisma.storyJob.findUnique({
        where: { id: jobId },
      });

      if (!job || job.userId !== userId) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      if (job.status === "complete" && job.storyId) {
        return NextResponse.json({
          status: "complete",
          storyId: job.storyId,
          progress: 100,
        });
      }

      if (job.status === "failed") {
        return NextResponse.json({
          status: "failed",
          error: job.error || "Generation failed",
          progress: job.progress,
        });
      }

      return NextResponse.json({
        status: "processing",
        progress: job.progress,
        message: `Generating story... ${job.progress}%`,
      });
    }

    if (storyId) {
      const story = await prisma.story.findFirst({
        where: { id: storyId, userId },
        include: { child: true },
      });

      if (!story) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }

      return NextResponse.json({
        status: "complete",
        story: {
          id: story.id,
          title: story.title,
          moral: story.moral,
          pageCount: story.pageCount,
          createdAt: story.createdAt,
          child: story.child,
        },
      });
    }

    const recentJobs = await prisma.storyJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      jobs: recentJobs,
    });
  } catch (error) {
    console.error("Error fetching story status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch status" },
      { status: 500 }
    );
  }
}
