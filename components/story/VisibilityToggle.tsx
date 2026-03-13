"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VisibilityToggleProps {
  storyId: string;
  initialIsPublic: boolean;
  onToggle?: (isPublic: boolean) => void;
}

export function VisibilityToggle({
  storyId,
  initialIsPublic,
  onToggle,
}: VisibilityToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) throw new Error("Failed to update visibility");

      const newValue = !isPublic;
      setIsPublic(newValue);
      onToggle?.(newValue);

      toast({
        title: newValue ? "Story Published!" : "Story Made Private",
        description: newValue
          ? "Your story is now visible in the Bookstore."
          : "Your story is now private and only visible to you.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-muted bg-muted/30 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        {isPublic ? (
          <Globe className="h-6 w-6 text-primary" />
        ) : (
          <Lock className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="visibility" className="text-base font-bold">
            {isPublic ? "Public" : "Private"}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          {isPublic
            ? "Visible in the Bookstore for everyone to enjoy"
            : "Only you can see this story"}
        </p>
      </div>
      <Switch
        id="visibility"
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
    </div>
  );
}
