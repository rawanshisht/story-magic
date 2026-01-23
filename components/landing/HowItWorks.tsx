import { UserPlus, Baby, Wand2, Download } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create an Account",
    description:
      "Sign up in seconds with your email or Google account. Your stories are saved securely.",
  },
  {
    icon: Baby,
    title: "Add Your Child",
    description:
      "Enter your child's details - name, age, appearance, and interests. This personalizes every story.",
  },
  {
    icon: Wand2,
    title: "Choose a Moral",
    description:
      "Select from meaningful life lessons like kindness, bravery, or sharing. The story teaches while entertaining.",
  },
  {
    icon: Download,
    title: "Get Your Story",
    description:
      "Our AI creates a unique story with illustrations. Read online or download as a beautiful PDF.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Create a personalized storybook in just a few simple steps
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-border lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
