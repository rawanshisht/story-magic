"use client";

import { MORALS } from "@/config/morals";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Heart,
  Share2,
  Shield,
  Scale,
  Users,
  Mountain,
  Gift,
  HandHeart,
  ClipboardCheck,
  Lightbulb,
} from "lucide-react";

interface MoralSelectorProps {
  selectedMoral: string;
  onSelect: (moralId: string) => void;
}

const MORAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  {
    kindness: Heart,
    sharing: Share2,
    bravery: Shield,
    honesty: Scale,
    friendship: Users,
    perseverance: Mountain,
    gratitude: Gift,
    respect: HandHeart,
    responsibility: ClipboardCheck,
    creativity: Lightbulb,
  };

export function MoralSelector({ selectedMoral, onSelect }: MoralSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Choose a Moral</h3>
        <p className="text-sm text-muted-foreground">
          Select the life lesson you want the story to teach
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MORALS.map((moral) => {
          const Icon = MORAL_ICONS[moral.id] || Heart;
          const isSelected = selectedMoral === moral.id;

          return (
            <Card
              key={moral.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                isSelected && "border-2 border-primary bg-primary/5"
              )}
              onClick={() => onSelect(moral.id)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{moral.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {moral.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
