import { cache } from "react";
import prisma from "@/lib/prisma";

interface LRUCacheEntry {
  value: unknown;
  timestamp: number;
}

class LRUCache {
  private cache: Map<string, LRUCacheEntry>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 100, ttlMs: number = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  get(key: string): unknown {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: unknown): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const userCache = new LRUCache(50, 60000);
const childrenCache = new LRUCache(50, 60000);
const storiesCache = new LRUCache(50, 60000);

export const getCachedUser = cache(async (userId: string) => {
  const cached = userCache.get(userId);
  if (cached) return cached as ReturnType<typeof prisma.user.findUnique>;

  const result = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (result) userCache.set(userId, result);
  return result;
});

export const getCachedChildren = cache(async (userId: string) => {
  const cached = childrenCache.get(userId);
  if (cached) return cached as ReturnType<typeof prisma.child.findMany>;

  const result = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  childrenCache.set(userId, result);
  return result;
});

export const getCachedStories = cache(async (userId: string) => {
  const cached = storiesCache.get(userId);
  if (cached) return cached as ReturnType<typeof prisma.story.findMany>;

  const result = await prisma.story.findMany({
    where: { userId },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });

  storiesCache.set(userId, result);
  return result;
});

export const getCachedRecentStories = cache(async (userId: string) => {
  const key = `${userId}:recent`;
  const cached = storiesCache.get(key);
  if (cached) return cached as ReturnType<typeof prisma.story.findMany>;

  const result = await prisma.story.findMany({
    where: { userId },
    include: { child: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  storiesCache.set(key, result);
  return result;
});

export function clearDataCache() {
  userCache.clear();
  childrenCache.clear();
  storiesCache.clear();
}
