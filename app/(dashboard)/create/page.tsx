"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { Child } from "@/types";

const STEPS = [
  { id: "child", title: "Select Child", description: "Choose or add a child" },
  { id: "moral", title: "Choose Moral", description: "Pick a life lesson" },
  {
    id: "customize",
    title: "Customize",
    description: "Optional story settings",
  },
  { id: "generate", title: "Generate", description: "Create your story" },
];

export default function CreateStoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedMoral, setSelectedMoral] = useState<string>("");
  const [customSetting, setCustomSetting] = useState<string>("");
  const [customTheme, setCustomTheme] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewChildForm, setShowNewChildForm] = useState(false);

  // Load children on mount
  useEffect(() => {
    async function loadChildren() {
      try {
        const response = await fetch("/api/children");
        if (response.ok) {
          const data = await response.json();
          setChildren(data);

          // Check for childId in URL
          const childIdParam = searchParams?.get("childId");
          if (childIdParam) {
            setSelectedChildId(childIdParam);
          }
        }
      } catch (error) {
        console.error("Error loading children:", error);
      }
    }
    loadChildren();
  }, [searchParams]);

  const handleCreateChild = async (formData: {
    name: string;
    age: string;
    gender: string;
    skinTone: string;
    eyeColor: string;
    hairColor: string;
    hairStyle: string;
    interests: string;
  }) => {
    setIsLoading(true);
    try {
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

      const newChild = await response.json();
      setChildren((prev) => [...prev, newChild]);
      setSelectedChildId(newChild.id);
      setShowNewChildForm(false);

      toast({
        title: "Success",
        description: "Child profile created!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create child profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedChildId || !selectedMoral) {
      toast({
        title: "Error",
        description: "Please select a child and moral",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          moral: selectedMoral,
          customSetting: customSetting || undefined,
          customTheme: customTheme || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate story");
      }

      const story = await response.json();

      toast({
        title: "Story Created & Saved!",
        description: "Your personalized story has been saved to your account",
      });

      router.push(`/stories/${story.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate story",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

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
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Progress Header */}
      <div>
        <h1 className="text-3xl font-bold">Create a New Story</h1>
        <p className="text-muted-foreground">
          Follow the steps to create a personalized story
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Step Indicators */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 ${
              index <= currentStep
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "border-2 border-primary"
                    : "border-2 border-muted"
              }`}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{step.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Select Child */}
          {currentStep === 0 && (
            <div className="space-y-6">
              {!showNewChildForm ? (
                <>
                  {children.length > 0 && (
                    <div className="space-y-2">
                      <Label>Select a Child</Label>
                      <Select
                        value={selectedChildId}
                        onValueChange={setSelectedChildId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a child" />
                        </SelectTrigger>
                        <SelectContent>
                          {children.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name} ({child.age} years old)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="text-center">
                    {children.length > 0 && (
                      <p className="mb-2 text-sm text-muted-foreground">or</p>
                    )}
                    <Button
                      variant={children.length === 0 ? "default" : "outline"}
                      onClick={() => setShowNewChildForm(true)}
                    >
                      Add New Child
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewChildForm(false)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to selection
                  </Button>
                  <ChildDetailsForm
                    onSubmit={handleCreateChild}
                    isLoading={isLoading}
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
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                These settings are optional. Leave blank for AI to choose.
              </p>

              <div className="space-y-2">
                <Label htmlFor="setting">Story Setting</Label>
                <Input
                  id="setting"
                  placeholder="e.g., a magical forest, outer space, underwater kingdom"
                  value={customSetting}
                  onChange={(e) => setCustomSetting(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Story Theme</Label>
                <Input
                  id="theme"
                  placeholder="e.g., adventure, mystery, fantasy"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Generate */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              {isGenerating ? (
                <div className="py-12">
                  <LoadingSpinner
                    size="lg"
                    text="Creating your magical story..."
                  />
                  <p className="mt-4 text-sm text-muted-foreground">
                    This may take a minute while we generate the story and
                    illustrations
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-muted p-6">
                    <h3 className="mb-4 font-semibold">Story Summary</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">For:</span>{" "}
                        {children.find((c) => c.id === selectedChildId)?.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Moral:</span>{" "}
                        {selectedMoral}
                      </p>
                      {customSetting && (
                        <p>
                          <span className="text-muted-foreground">Setting:</span>{" "}
                          {customSetting}
                        </p>
                      )}
                      {customTheme && (
                        <p>
                          <span className="text-muted-foreground">Theme:</span>{" "}
                          {customTheme}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Story
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {!isGenerating && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < STEPS.length - 1 && (
            <Button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
