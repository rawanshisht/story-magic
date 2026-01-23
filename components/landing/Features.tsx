import {
  Palette,
  BookHeart,
  Users,
  Smartphone,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Palette,
    title: "Beautiful Illustrations",
    description:
      "Every story comes with AI-generated illustrations that bring your child's adventure to life.",
  },
  {
    icon: BookHeart,
    title: "Age-Appropriate Content",
    description:
      "Stories automatically adjust vocabulary, length, and complexity based on your child's age.",
  },
  {
    icon: Users,
    title: "Multiple Children",
    description:
      "Create profiles for all your children and generate unique stories for each one.",
  },
  {
    icon: Smartphone,
    title: "Read Anywhere",
    description:
      "Access your stories online from any device, or download them as beautiful PDFs.",
  },
  {
    icon: Shield,
    title: "Safe & Private",
    description:
      "Your children's information is encrypted and never shared. We prioritize your family's privacy.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description:
      "Stories are created in minutes, not hours. Get a new bedtime story whenever you need one.",
  },
];

export function Features() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Why Parents Love Us
          </h2>
          <p className="text-muted-foreground">
            We combine cutting-edge AI with thoughtful design to create
            meaningful stories for your family.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-2 transition-colors hover:border-primary/50"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
