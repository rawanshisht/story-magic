import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from '@next/third-parties/google'
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: {
    default: "Story Magic - Personalized Children's Stories",
    template: "%s | Story Magic",
  },
  description:
    "Create magical, AI-generated stories featuring your child as the hero. Personalized tales with beautiful illustrations and meaningful morals.",
  keywords: [
    "children's stories",
    "personalized books",
    "AI stories",
    "kids books",
    "bedtime stories",
    "personalized children's books",
    "AI story generator",
    "kids storytelling",
    "children's book creator",
  ],
  authors: [{ name: "Rawan A. ElShishtawy" }],
  creator: "Rawan A. ElShishtawy",
  publisher: "Story Magic",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪄</text></svg>",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://storymagic.app",
    siteName: "Story Magic",
    title: "Story Magic - Personalized Children's Stories",
    description:
      "Create magical, AI-generated stories featuring your child as the hero. Personalized tales with beautiful illustrations and meaningful morals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Story Magic - Personalized Children's Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Story Magic - Personalized Children's Stories",
    description:
      "Create magical, AI-generated stories featuring your child as the hero.",
    images: ["/og-image.png"],
    creator: "@storymagic",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Story Magic",
    url: "https://storymagic.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://storymagic.app/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    description:
      "Create magical, AI-generated personalized stories featuring your child as the hero.",
    author: {
      "@type": "Person",
      name: "Rawan A. ElShishtawy",
    },
    publisher: {
      "@type": "Organization",
      name: "Story Magic",
      logo: {
        "@type": "ImageObject",
        url: "https://mystorymagic.uk/icon.svg",
      },
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
      <GoogleAnalytics gaId="G-MWZY58521H" />
    </html>
  );
}
