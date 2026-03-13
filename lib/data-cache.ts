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

const publicStoriesCache = new LRUCache(10, 60000);

export interface PublicStory {
  id: string;
  title: string;
  moral: string;
  pageCount: number;
  publishedAt: Date | null;
  childName: string;
  authorName: string;
  coverImage: string | null;
}

export interface PublicStoriesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicStoriesResult {
  stories: PublicStory[];
  pagination: PublicStoriesPagination;
}

export const getCachedPublicStories = cache(async (page: number = 1, limit: number = 12): Promise<PublicStoriesResult> => {
  const key = `public:${page}:${limit}`;
  const cached = publicStoriesCache.get(key);
  if (cached) return cached as PublicStoriesResult;

  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { isPublic: true },
      include: {
        child: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.story.count({ where: { isPublic: true } }),
  ]);

  // Transform to public format (remove sensitive data)
  const publicStories = stories.map((story) => ({
    id: story.id,
    title: story.title,
    moral: story.moral,
    pageCount: story.pageCount,
    publishedAt: story.publishedAt,
    childName: story.child.name,
    authorName: story.user.name || "Anonymous",
    coverImage: (story.content as any)[0]?.imageUrl || null,
  }));

  const result = {
    stories: publicStories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  publicStoriesCache.set(key, result);
  return result;
});

export function clearDataCache() {
  userCache.clear();
  childrenCache.clear();
  storiesCache.clear();
  publicStoriesCache.clear();
}
