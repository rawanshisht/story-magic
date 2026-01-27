"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChildDetailsForm } from "@/components/story/ChildDetailsForm";
import { MoralSelector } from "@/components/story/MoralSelector";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Sparkles, Check, Plus } from "lucide-react";
import { Child } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "child", title: "Who is the Hero?", description: "Choose who the story is about" },
  { id: "moral", title: "The Lesson", description: "Pick a special life lesson" },
  {
    id: "customize",
    title: "The Setting",
    description: "Where does the magic happen?",
  },
  { id: "generate", title: "Ready!", description: "Create your magical story" },
];

export default function CreateStoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedMoral, setSelectedMoral] = useState<string>("");
  const [customSetting, setCustomSetting] = useState<string>("");
  const [customTheme, setCustomTheme] = useState<string>("");
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [showNewChildForm, setShowNewChildForm] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for job status
  useEffect(() => {
    if (!isPolling || !jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/stories/status?jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === "complete" && data.storyId) {
            setIsPolling(false);
            setGenerationProgress(100);
            toast({
              title: "Story Created!",
              description: "Your personalized story has been saved!",
            });
            router.push(`/stories/${data.storyId}`);
          } else if (data.status === "failed") {
            setIsPolling(false);
            toast({
              title: "Generation Failed",
              description: data.error || "Something went wrong. Please try again.",
              variant: "destructive",
            });
          } else {
            setGenerationProgress(data.progress || 0);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [isPolling, jobId, router, toast]);

  // Fetch children
  const { data: children = [], isLoading: isLoadingChildren } = useQuery<Child[]>({
    queryKey: ["children"],
    queryFn: async () => {
      const response = await fetch("/api/children");
      if (!response.ok) {
        throw new Error("Failed to fetch children");
      }
      return response.json();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle URL param selection
  useEffect(() => {
    const childIdParam = searchParams?.get("childId");
    if (childIdParam && children.length > 0) {
      setSelectedChildId(childIdParam);
    }
  }, [searchParams, children]);

  const createChildMutation = useMutation({
    mutationFn: async (formData: {
      name: string;
      age: string;
      gender: string;
      skinTone: string;
      eyeColor: string;
      hairColor: string;
      hairStyle: string;
      interests: string;
    }) => {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          interests: formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create child profile");
      }
      return response.json();
    },
    onSuccess: (newChild) => {
      queryClient.setQueryData(["children"], (old: Child[] = []) => [
        ...old,
        newChild,
      ]);
      setSelectedChildId(newChild.id);
      setShowNewChildForm(false);
      toast({
        title: "Success",
        description: "Child profile created!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create child profile",
        variant: "destructive",
      });
    },
  });

  const generateStoryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChildId || !selectedMoral) {
        throw new Error("Please select a child and moral");
      }

      const response = await fetch("/.netlify/functions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          moral: selectedMoral,
          customSetting: customSetting || undefined,
          customTheme: customTheme || undefined,
          pageCount: pageCount || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate story");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.jobId) {
        setJobId(data.jobId);
        setIsPolling(true);
        setGenerationProgress(0);
        toast({
          title: "Story Generation Started!",
          description: "Your story is being created. This takes a few minutes.",
        });
      } else if (data.storyId) {
        toast({
          title: "Story Created!",
          description: "Your personalized story has been saved!",
        });
        router.push(`/stories/${data.storyId}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate story",
        variant: "destructive",
      });
    },
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedChildId !== "";
      case 1:
        return selectedMoral !== "";
      case 2:
        return true; // Optional step
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-6">
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-primary tracking-tight">Create Magic!</h1>
        <p className="text-xl text-muted-foreground font-medium">
          Follow the path to build your very own story
        </p>
      </div>

      {/* Playful Progress Path */}
      <div className="relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
        <div className="relative flex justify-between items-center">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all border-4",
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground scale-110"
                    : index === currentStep
                      ? "bg-background border-primary text-primary scale-125 shadow-lg ring-4 ring-primary/20"
                      : "bg-background border-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-6 w-6" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "hidden sm:block text-sm font-bold",
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-4 border-primary/10 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b-2 border-primary/10 py-8">
          <CardTitle className="text-3xl font-bold text-center">{STEPS[currentStep].title}</CardTitle>
          <CardDescription className="text-center text-lg">{STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {/* Step 1: Select Child */}
          {currentStep === 0 && (
            <div className="space-y-8">
              {!showNewChildForm ? (
                <>
                  {children.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {children.map((child) => (
                        <Card 
                          key={child.id}
                          className={cn(
                            "cursor-pointer p-6 transition-all hover:scale-105 border-2",
                            selectedChildId === child.id 
                              ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                              : "border-muted hover:border-primary/50"
                          )}
                          onClick={() => setSelectedChildId(child.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-2xl">
                              👶
                            </div>
                            <div>
                              <h4 className="font-bold text-xl">{child.name}</h4>
                              <p className="text-muted-foreground">{child.age} years old</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="text-center pt-4">
                    <Button
                      variant={children.length === 0 ? "default" : "outline"}
                      size="lg"
                      className="rounded-full px-8 font-bold text-lg h-14"
                      onClick={() => setShowNewChildForm(true)}
                    >
                      <Plus className="mr-2 h-6 w-6" />
                      Add a New Hero
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowNewChildForm(false)}
                    className="font-bold"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to selection
                  </Button>
                  <ChildDetailsForm
                    onSubmit={async (data) => {
                      await createChildMutation.mutateAsync(data);
                    }}
                    isLoading={createChildMutation.isPending}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Moral */}
          {currentStep === 1 && (
            <MoralSelector
              selectedMoral={selectedMoral}
              onSelect={setSelectedMoral}
            />
          )}

          {/* Step 3: Customize */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                  ✨
                </div>
                <p className="text-blue-700 font-medium">
                  These are extra magical touches! You can leave them empty and the AI fairies will choose for you.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="setting" className="text-lg font-bold">Story Setting</Label>
                  <Input
                    id="setting"
                    className="h-14 text-lg rounded-xl border-2 focus:ring-4 focus:ring-primary/10"
                    placeholder="e.g. a candy castle, outer space..."
                    value={customSetting}
                    onChange={(e) => setCustomSetting(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="theme" className="text-lg font-bold">Story Style</Label>
                  <Input
                    id="theme"
                    className="h-14 text-lg rounded-xl border-2 focus:ring-4 focus:ring-primary/10"
                    placeholder="e.g. funny adventure, spooky mystery..."
                    value={customTheme}
                    onChange={(e) => setCustomTheme(e.target.value)}
                  />
                </div>
              </div>

                  <div className="space-y-3 max-w-sm">
                  <Label htmlFor="pageCount" className="text-lg font-bold">How long is the story?</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="pageCount"
                      type="number"
                      min={4}
                      max={8}
                      className="h-14 text-lg rounded-xl border-2 focus:ring-4 focus:ring-primary/10"
                      placeholder="Auto"
                      value={pageCount ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") setPageCount(undefined);
                        else {
                          const num = parseInt(value);
                          if (!isNaN(num) && num >= 4 && num <= 8) setPageCount(num);
                        }
                      }}
                    />
                    <span className="text-muted-foreground font-bold whitespace-nowrap">Pages (4-8)</span>
                  </div>
                </div>
            </div>
          )}

          {/* Step 4: Generate */}
          {currentStep === 3 && (
            <div className="space-y-8 text-center">
              {generateStoryMutation.isPending || isPolling ? (
                <div className="py-12 space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="h-32 w-32 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        🪄
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-primary animate-pulse">
                    {isPolling ? "Creating Your Story..." : "Starting..."}
                  </h3>
                  <p className="text-xl text-muted-foreground font-medium">
                    {isPolling
                      ? "This takes a few minutes. We'll notify you when it's ready!"
                      : "Preparing to create your story..."}
                  </p>
                  {isPolling && (
                    <div className="max-w-xs mx-auto space-y-2">
                      <Progress value={generationProgress} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {generationProgress}% complete
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="rounded-3xl bg-secondary/30 p-8 border-4 border-dashed border-secondary/50">
                    <h3 className="text-2xl font-black mb-6 flex items-center justify-center gap-2">
                      <Sparkles className="text-accent h-6 w-6" />
                      Your Adventure Plan
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 text-left">
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hero</p>
                        <p className="text-xl font-bold">{children.find((c) => c.id === selectedChildId)?.name}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Lesson</p>
                        <p className="text-xl font-bold">{selectedMoral}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Where</p>
                        <p className="text-xl font-bold">{customSetting || "Surprise Me!"}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Style</p>
                        <p className="text-xl font-bold">{customTheme || "Surprise Me!"}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => generateStoryMutation.mutate()}
                    className="w-full h-20 text-2xl font-black rounded-3xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="mr-3 h-8 w-8" />
                    CREATE THE MAGIC!
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {!generateStoryMutation.isPending && !isPolling && (
        <div className="flex justify-between items-center px-4">
          <Button
            variant="ghost"
            size="lg"
            className="font-bold text-lg hover:bg-muted rounded-full"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-6 w-6" />
            Go Back
          </Button>

          {currentStep < STEPS.length - 1 && (
            <Button
              size="lg"
              className="font-bold text-lg rounded-full px-10 h-14 shadow-md"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
            >
              Keep Going!
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
