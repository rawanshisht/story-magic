import { cache } from "react";
import prisma from "@/lib/prisma";

export const getCachedUser = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
});

export const getCachedChildren = cache(async (userId: string) => {
  return prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
});

export const getCachedStories = cache(async (userId: string) => {
  return prisma.story.findMany({
    where: { userId },
    include: { child: true },
    orderBy: { createdAt: "desc" },
  });
});

export const getCachedRecentStories = cache(async (userId: string) => {
  return prisma.story.findMany({
    where: { userId },
    include: { child: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
});
