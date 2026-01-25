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
  const [errors, setErrors] = useState<Partial<Record<keyof ChildFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ChildFormData, boolean>>>({});

  const validateField = (field: keyof ChildFormData, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (value.trim().length > 50) return "Name must be less than 50 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes";
        return undefined;
      case "age":
        if (!value) return "Age is required";
        const age = parseInt(value);
        if (isNaN(age) || age < 2 || age > 18) return "Age must be between 2 and 18";
        return undefined;
      case "gender":
        if (!value) return "Gender is required";
        return undefined;
      case "interests":
        if (value.trim().length > 200) return "Interests must be less than 200 characters";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChildFormData, string>> = {};
    let isValid = true;

    const requiredFields: (keyof ChildFormData)[] = ["name", "age", "gender"];
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleBlur = (field: keyof ChildFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof ChildFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all required fields as touched
    const touchedFields: Partial<Record<keyof ChildFormData, boolean>> = {
      name: true,
      age: true,
      gender: true,
    };
    setTouched(touchedFields);

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-primary">About Our Hero</h3>
        <p className="text-muted-foreground">Tell us about the star of the story!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 bg-secondary/10 p-6 rounded-3xl border-2 border-secondary/20">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg font-bold">
              What is the Hero&apos;s name? <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Required)</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Alex, Sam..."
              className={`h-12 rounded-xl border-2 ${errors.name && touched.name ? "border-destructive focus:ring-destructive" : ""}`}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={errors.name && touched.name ? "true" : "false"}
              aria-describedby={errors.name && touched.name ? "name-error" : undefined}
            />
            {errors.name && touched.name && (
              <p id="name-error" className="text-sm text-destructive font-medium">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-lg font-bold">
              How old is the Hero? <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Required)</span>
            </Label>
            <Select
              value={formData.age}
              onValueChange={(value) => {
                handleChange("age", value);
                // Clear error immediately on selection
                setErrors((prev) => ({ ...prev, age: undefined }));
              }}
            >
              <SelectTrigger 
                className={`h-12 rounded-xl border-2 ${errors.age && touched.age ? "border-destructive" : ""}`}
                aria-invalid={errors.age && touched.age ? "true" : "false"}
              >
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
            {errors.age && touched.age && (
              <p id="age-error" className="text-sm text-destructive font-medium">{errors.age}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-lg font-bold">
              Is the Hero a boy or girl? <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Required)</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => {
                handleChange("gender", value);
                // Clear error immediately on selection
                setErrors((prev) => ({ ...prev, gender: undefined }));
              }}
            >
              <SelectTrigger 
                className={`h-12 rounded-xl border-2 ${errors.gender && touched.gender ? "border-destructive" : ""}`}
                aria-invalid={errors.gender && touched.gender ? "true" : "false"}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Boy</SelectItem>
                <SelectItem value="female">Girl</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && touched.gender && (
              <p id="gender-error" className="text-sm text-destructive font-medium">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skinTone" className="text-lg font-bold">
              Skin Tone
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Optional)</span>
            </Label>
            <Select
              value={formData.skinTone}
              onValueChange={(value) => handleChange("skinTone", value)}
            >
              <SelectTrigger className="h-12 rounded-xl border-2">
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
            <Label htmlFor="eyeColor" className="text-lg font-bold">
              Eye Color
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Optional)</span>
            </Label>
            <Select
              value={formData.eyeColor}
              onValueChange={(value) => handleChange("eyeColor", value)}
            >
              <SelectTrigger className="h-12 rounded-xl border-2">
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
            <Label htmlFor="hairColor" className="text-lg font-bold">
              Hair Color
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Optional)</span>
            </Label>
            <Select
              value={formData.hairColor}
              onValueChange={(value) => handleChange("hairColor", value)}
            >
              <SelectTrigger className="h-12 rounded-xl border-2">
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
            <Label htmlFor="hairStyle" className="text-lg font-bold">
              Hair Style
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Optional)</span>
            </Label>
            <Select
              value={formData.hairStyle}
              onValueChange={(value) => handleChange("hairStyle", value)}
            >
              <SelectTrigger className="h-12 rounded-xl border-2">
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
            <Label htmlFor="interests" className="text-lg font-bold">
              What does the Hero like?
              <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider">(Optional)</span>
            </Label>
            <Input
              id="interests"
              placeholder="e.g. dinosaurs, space, pizza..."
              className="h-12 rounded-xl border-2"
              value={formData.interests}
              onChange={(e) => handleChange("interests", e.target.value)}
            />
            <p className="text-xs text-muted-foreground font-medium">
              Separate with commas (e.g. dogs, painting, magic)
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg"
          className="w-full h-14 rounded-2xl text-xl font-bold shadow-lg shadow-primary/20" 
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : initialData ? (
            "Update Our Hero!"
          ) : (
            "Save Our Hero!"
          )}
        </Button>
      </form>
    </div>
  );
}
