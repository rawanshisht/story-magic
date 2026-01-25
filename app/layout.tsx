import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

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
      <body className={`${nunito.className} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <Providers>
          <div id="main-content">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
