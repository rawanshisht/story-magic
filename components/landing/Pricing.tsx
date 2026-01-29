"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

export function Pricing() {

  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Start Creating Today
          </h2>
          <p className="text-muted-foreground">
            Simple, transparent pricing for magical storytelling
          </p>
        </div>

        <div className="mt-16 flex justify-center">
          <Card className="w-full max-w-md border-2 border-primary">
            <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary" role="img" aria-label="Free plan icon">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
              <CardTitle className="text-2xl">Free to Start</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Create unlimited child profiles",
                  "Generate personalized stories",
                  "AI-powered illustrations",
                  "10 moral themes to choose from",
                  "Download stories as PDF",
                  "Age-appropriate content",
                  "Read stories online",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/create" className="mt-8 block">
                <Button className="w-full" size="lg">
                  Get Started Free
                </Button>
              </Link>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
