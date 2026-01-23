import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StoryBook - Personalized Children's Stories",
  description:
    "Create magical, AI-generated storybooks featuring your child as the hero. Personalized stories with beautiful illustrations and meaningful morals.",
  keywords: [
    "children's stories",
    "personalized books",
    "AI stories",
    "kids books",
    "bedtime stories",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
