"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface ChildFormData {
  name: string;
  age: string;
  gender: string;
  skinTone: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  interests: string;
}

interface ChildDetailsFormProps {
  onSubmit: (data: ChildFormData) => Promise<void>;
  initialData?: ChildFormData;
  isLoading?: boolean;
}

const SKIN_TONES = [
  "Fair",
  "Light",
  "Medium",
  "Olive",
  "Tan",
  "Brown",
  "Dark Brown",
  "Deep",
];

const EYE_COLORS = [
  "Blue",
  "Green",
  "Brown",
  "Hazel",
  "Gray",
  "Amber",
  "Black",
];

const HAIR_COLORS = [
  "Black",
  "Brown",
  "Blonde",
  "Red",
  "Auburn",
  "Gray",
  "White",
];

const HAIR_STYLES = [
  "Short",
  "Medium length",
  "Long",
  "Curly",
  "Straight",
  "Wavy",
  "Braided",
  "Ponytail",
];

export function ChildDetailsForm({
  onSubmit,
  initialData,
  isLoading = false,
}: ChildDetailsFormProps) {
  const [formData, setFormData] = useState<ChildFormData>(
    initialData || {
      name: "",
      age: "",
      gender: "",
      skinTone: "",
      eyeColor: "",
      hairColor: "",
      hairStyle: "",
      interests: "",
    }
  );

  const handleChange = (field: keyof ChildFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Child Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter child's name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Select
                value={formData.age}
                onValueChange={(value) => handleChange("age", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 2).map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years old
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Boy</SelectItem>
                  <SelectItem value="female">Girl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skinTone">Skin Tone</Label>
              <Select
                value={formData.skinTone}
                onValueChange={(value) => handleChange("skinTone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skin tone" />
                </SelectTrigger>
                <SelectContent>
                  {SKIN_TONES.map((tone) => (
                    <SelectItem key={tone} value={tone.toLowerCase()}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eyeColor">Eye Color</Label>
              <Select
                value={formData.eyeColor}
                onValueChange={(value) => handleChange("eyeColor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select eye color" />
                </SelectTrigger>
                <SelectContent>
                  {EYE_COLORS.map((color) => (
                    <SelectItem key={color} value={color.toLowerCase()}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hairColor">Hair Color</Label>
              <Select
                value={formData.hairColor}
                onValueChange={(value) => handleChange("hairColor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hair color" />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_COLORS.map((color) => (
                    <SelectItem key={color} value={color.toLowerCase()}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hairStyle">Hair Style</Label>
              <Select
                value={formData.hairStyle}
                onValueChange={(value) => handleChange("hairStyle", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hair style" />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_STYLES.map((style) => (
                    <SelectItem key={style} value={style.toLowerCase()}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="interests">Interests & Hobbies</Label>
              <Input
                id="interests"
                placeholder="e.g., dinosaurs, soccer, painting, space (comma separated)"
                value={formData.interests}
                onChange={(e) => handleChange("interests", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                These will be incorporated into the stories
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : initialData ? (
              "Update Child Profile"
            ) : (
              "Save Child Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
