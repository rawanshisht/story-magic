import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StoryPDF } from "@/components/story/StoryPDF";
import { StoryPage } from "@/types";
import { getMoralById } from "@/config/morals";
import { downloadImageAsBase64 } from "@/lib/openai";
import {
  processImageForPdf,
  DEFAULT_IMAGE_CONFIG,
  type ImageOptimizationConfig,
  getImageSizeInfo,
} from "@/lib/image-optimizer";

interface RouteParams {
  params: { id: string };
}

// Zod schema for validating StoryPage content
const StoryPageSchema = z.object({
  pageNumber: z.number(),
  text: z.string(),
  imageUrl: z.string(),
  imageBase64: z.string().optional(),
});

const StoryContentSchema = z.array(StoryPageSchema);

// Custom configuration for PDF image optimization
// Adjust these values based on your quality/size needs
const PDF_IMAGE_CONFIG: ImageOptimizationConfig = {
  maxWidth: 800,      // Optimal for A4 PDF (reduces from 1024x1024)
  maxHeight: 800,
  quality: 80,        // JPEG quality (0-100)
  enabled: true,
};

// Helper function to ensure image has valid base64 data
// Re-downloads from URL if base64 is missing or URL is still valid
// Applies optimization to reduce PDF file size
async function ensureImageBase64(page: StoryPage): Promise<StoryPage> {
  // If we already have base64 data, apply optimization
  if (page.imageBase64 && page.imageBase64.startsWith("data:")) {
    try {
      const optimized = await processImageForPdf(page.imageBase64, PDF_IMAGE_CONFIG);
      const info = getImageSizeInfo(optimized);
      console.log(
        `Page ${page.pageNumber}: Original size ${info.formattedSize}, ` +
        `Dimensions ${info.dimensions.width}x${info.dimensions.height}`
      );
      return { ...page, imageBase64: optimized };
    } catch (error) {
      console.warn(`Failed to optimize image for page ${page.pageNumber}:`, error);
      return page;
    }
  }

  // If we have a URL, try to download and optimize it
  if (page.imageUrl && page.imageUrl.startsWith("https://")) {
    try {
      const base64 = await downloadImageAsBase64(page.imageUrl);
      const optimized = await processImageForPdf(base64, PDF_IMAGE_CONFIG);
      return { ...page, imageBase64: optimized };
    } catch (error) {
      console.error(
        `Failed to re-download image for page ${page.pageNumber}:`,
        error
      );
      // Return original page without base64
      return page;
    }
  }

  return page;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const story = await prisma.story.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { child: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Validate and parse the JSON content using Zod
    const rawContent = story.content as unknown;
    const parseResult = StoryContentSchema.safeParse(rawContent);

    if (!parseResult.success) {
      console.error("Invalid story content structure:", parseResult.error);
      return NextResponse.json(
        { error: "Invalid story content. Please regenerate the story." },
        { status: 500 }
      );
    }

    let pages = parseResult.data;

    // Log original total size before optimization
    const originalSize = pages.reduce((sum, page) => {
      if (page.imageBase64) {
        const info = getImageSizeInfo(page.imageBase64);
        return sum + info.originalSize;
      }
      return sum;
    }, 0);
    console.log(
      `PDF Generation: ${pages.length} pages, ` +
      `Original images: ${(originalSize / 1024).toFixed(2)} KB`
    );

    // Ensure all images have base64 data (handles expired DALL-E URLs)
    // and apply optimization to reduce PDF file size
    pages = await Promise.all(pages.map(ensureImageBase64));

    const moral = getMoralById(story.moral);

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      StoryPDF({
        title: story.title,
        childName: story.child.name,
        moral: moral?.label || story.moral,
        pages,
      })
    );

    // Log final PDF size
    const pdfSizeKB = (pdfBuffer.length / 1024).toFixed(2);
    console.log(`PDF generated: ${pdfSizeKB} KB`);

    // Return PDF with proper headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${story.title.replace(
          /[^a-z0-9]/gi,
          "_"
        )}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        // Cache optimization hints
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate PDF. Please try again.",
      },
      { status: 500 }
    );
  }
}
