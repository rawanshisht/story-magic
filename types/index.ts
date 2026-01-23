export interface Child {
  id: string;
  name: string;
  age: number;
  gender: string;
  skinTone: string;
  eyeColor: string;
  hairColor: string;
  hairStyle?: string;
  interests: string[];
  userId: string;
  createdAt: Date;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl: string;
  imageBase64?: string; // Base64 encoded image for PDF generation (DALL-E URLs expire)
}

export interface Story {
  id: string;
  title: string;
  moral: string;
  content: StoryPage[];
  childId: string;
  child?: Child;
  userId: string;
  pageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Moral {
  id: string;
  label: string;
  description: string;
}

export interface AgeSettings {
  pageCount: number;
  wordsPerPage: { min: number; max: number };
  vocabulary: "simple" | "basic" | "intermediate" | "advanced";
  themes: string[];
  sentenceStructure: string;
}

export interface GenerateStoryRequest {
  childId: string;
  moral: string;
  customSetting?: string;
  customTheme?: string;
}

export interface GenerateStoryResponse {
  title: string;
  pages: StoryPage[];
}
