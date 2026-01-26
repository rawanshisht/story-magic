import { AgeSettings } from "@/types";

export const AGE_SETTINGS: Record<string, AgeSettings> = {
  "2-3": {
    pageCount: 4,
    wordsPerPage: { min: 20, max: 30 },
    vocabulary: "simple",
    themes: ["colors", "animals", "family", "bedtime"],
    sentenceStructure: "very short, repetitive sentences with familiar words",
  },
  "4-5": {
    pageCount: 4,
    wordsPerPage: { min: 40, max: 50 },
    vocabulary: "basic",
    themes: ["friendship", "sharing", "bravery", "helping"],
    sentenceStructure: "short sentences with some simple dialogue",
  },
  "6-7": {
    pageCount: 6,
    wordsPerPage: { min: 60, max: 80 },
    vocabulary: "intermediate",
    themes: ["adventure", "problem-solving", "kindness", "curiosity"],
    sentenceStructure: "varied sentence lengths with engaging dialogue",
  },
  "8-10": {
    pageCount: 6,
    wordsPerPage: { min: 100, max: 120 },
    vocabulary: "advanced",
    themes: ["perseverance", "honesty", "empathy", "responsibility"],
    sentenceStructure: "complex sentences with rich descriptions and dialogue",
  },
};

export function getAgeSettings(age: number): AgeSettings {
  if (age <= 3) return AGE_SETTINGS["2-3"];
  if (age <= 5) return AGE_SETTINGS["4-5"];
  if (age <= 7) return AGE_SETTINGS["6-7"];
  return AGE_SETTINGS["8-10"];
}

export function getAgeGroup(age: number): string {
  if (age <= 3) return "2-3";
  if (age <= 5) return "4-5";
  if (age <= 7) return "6-7";
  return "8-10";
}
