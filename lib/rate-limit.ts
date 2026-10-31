import prisma from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Maximum stories a user can generate in a rolling 24 hours. */
export const STORY_DAILY_LIMIT = Number(process.env.STORY_DAILY_LIMIT) || 10;

/**
 * Stories created in the last 24h plus jobs still being generated (which
 * haven't produced a story yet). Stored in the database, so it holds across
 * serverless instances.
 */
export async function getStoriesGeneratedToday(userId: string): Promise<number> {
  const since = new Date(Date.now() - DAY_MS);
  const [stories, pendingJobs] = await Promise.all([
    prisma.story.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.storyJob.count({
      where: { userId, status: "processing", createdAt: { gte: since } },
    }),
  ]);
  return stories + pendingJobs;
}

const windows = new Map<string, number[]>();

/**
 * Sliding-window limiter kept in memory. On serverless platforms each
 * instance has its own window, so this is a best-effort guard against bursts.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    windows.set(key, recent);
    return false;
  }
  recent.push(now);
  windows.set(key, recent);

  if (windows.size > 10_000) {
    for (const [k, times] of windows) {
      if (times.every((t) => now - t >= windowMs)) windows.delete(k);
    }
  }
  return true;
}
