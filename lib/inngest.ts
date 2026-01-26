import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "story-magic",
  name: "Story Magic",
});

export const EVENTS = {
  STORY_GENERATION_STARTED: "story/generation.started",
  STORY_GENERATION_COMPLETED: "story/generation.completed",
  STORY_GENERATION_FAILED: "story/generation.failed",
} as const;
