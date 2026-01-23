import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Mother of 2",
    content:
      "My kids absolutely love seeing themselves in the stories! The moral lessons are woven in so naturally. It's become our favorite bedtime ritual.",
    rating: 5,
  },
  {
    name: "Michael T.",
    role: "Father of 1",
    content:
      "The age-appropriate adjustments are fantastic. The stories for my 3-year-old are perfect - simple words and lots of repetition she loves.",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "Mother of 3",
    content:
      "I've printed out several stories as PDFs and my kids treat them like real books. They're so proud to be the main character!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            What Parents Say
          </h2>
          <p className="text-muted-foreground">
            Join thousands of families creating magical memories together
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
