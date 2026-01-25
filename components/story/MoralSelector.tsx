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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-primary">What should the hero learn?</h3>
        <p className="text-muted-foreground">
          Every great story has a special lesson!
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {MORALS.map((moral) => {
          const Icon = MORAL_ICONS[moral.id] || Heart;
          const isSelected = selectedMoral === moral.id;

          const colors: Record<string, string> = {
            kindness: "bg-pink-100 text-pink-600 border-pink-200",
            sharing: "bg-orange-100 text-orange-600 border-orange-200",
            bravery: "bg-red-100 text-red-600 border-red-200",
            honesty: "bg-blue-100 text-blue-600 border-blue-200",
            friendship: "bg-green-100 text-green-600 border-green-200",
            perseverance: "bg-purple-100 text-purple-600 border-purple-200",
            gratitude: "bg-yellow-100 text-yellow-600 border-yellow-200",
            respect: "bg-indigo-100 text-indigo-600 border-indigo-200",
            responsibility: "bg-teal-100 text-teal-600 border-teal-200",
            creativity: "bg-amber-100 text-amber-600 border-amber-200",
          };

          const colorClass = colors[moral.id] || "bg-muted text-muted-foreground";

          return (
            <Card
              key={moral.id}
              className={cn(
                "cursor-pointer transition-all hover:scale-105 active:scale-95 border-2",
                isSelected 
                  ? "ring-4 ring-primary/20 border-primary bg-primary/5" 
                  : "border-transparent hover:border-muted-foreground/20"
              )}
              onClick={() => onSelect(moral.id)}
            >
              <CardContent className="flex flex-col items-center text-center gap-3 p-6">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl transition-transform",
                    isSelected ? "scale-110" : "",
                    colorClass
                  )}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{moral.label}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
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
