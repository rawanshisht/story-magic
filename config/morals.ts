import { Moral } from "@/types";

export const MORALS: Moral[] = [
  {
    id: "kindness",
    label: "Kindness",
    description: "Being kind to others makes the world a better place",
  },
  {
    id: "sharing",
    label: "Sharing",
    description: "The joy of sharing with friends and family",
  },
  {
    id: "bravery",
    label: "Bravery",
    description: "Having courage to overcome fears",
  },
  {
    id: "honesty",
    label: "Honesty",
    description: "Always telling the truth, even when it's hard",
  },
  {
    id: "friendship",
    label: "Friendship",
    description: "The value of true friends",
  },
  {
    id: "perseverance",
    label: "Perseverance",
    description: "Never giving up, even when things are difficult",
  },
  {
    id: "gratitude",
    label: "Gratitude",
    description: "Being thankful for what we have",
  },
  {
    id: "respect",
    label: "Respect",
    description: "Treating others the way we want to be treated",
  },
  {
    id: "responsibility",
    label: "Responsibility",
    description: "Taking responsibility for our actions",
  },
  {
    id: "creativity",
    label: "Creativity",
    description: "Using imagination to solve problems and create",
  },
];

export function getMoralById(id: string): Moral | undefined {
  return MORALS.find((moral) => moral.id === id);
}
