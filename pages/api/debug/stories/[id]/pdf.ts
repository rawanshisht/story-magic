import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { StoryPage } from "@/types";
import { getMoralById } from "@/config/morals";
import { downloadImageAsBase64 } from "@/lib/openai";
import {
  processImageForPdf,
  type ImageOptimizationConfig,
  getImageSizeInfo,
} from "@/lib/image-optimizer";
import { generatePDF } from "@/lib/pdf-generator";

// Zod schema for validating StoryPage content
const StoryPageSchema = z.object({
  pageNumber: z.number(),
  text: z.string(),
  imageUrl: z.string(),
  imageBase64: z.string().optional(),
});

const StoryContentSchema = z.array(StoryPageSchema);

// Custom configuration for PDF image optimization
const PDF_IMAGE_CONFIG: ImageOptimizationConfig = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 80,
  enabled: true,
};

// Helper function to ensure image has valid base64 data
async function ensureImageBase64(page: StoryPage): Promise<StoryPage> {
  if (page.imageBase64 && page.imageBase64.startsWith("data:")) {
    try {
      const optimized = await processImageForPdf(page.imageBase64, PDF_IMAGE_CONFIG);
      const info = getImageSizeInfo(optimized);
      console.log("Page " + page.pageNumber + ": Size " + info.formattedSize);
      return { ...page, imageBase64: optimized };
    } catch (error) {
      console.warn("Failed to optimize image for page " + page.pageNumber + ":", error);
      return page;
    }
  }

  if (page.imageUrl && page.imageUrl.startsWith("https://")) {
    try {
      const base64 = await downloadImageAsBase64(page.imageUrl);
      const optimized = await processImageForPdf(base64, PDF_IMAGE_CONFIG);
      return { ...page, imageBase64: optimized };
    } catch (error) {
      console.error("Failed to re-download image for page " + page.pageNumber + ":", error);
      return page;
    }
  }

  return page;
}

// DEBUG ENDPOINT - No authentication required
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("[DEBUG PDF] Generation started for story: " + id);

    // Fetch story from database
    const story = await prisma.story.findUnique({
      where: { id: id as string },
      include: { child: true },
    });

    if (!story) {
      console.log("[DEBUG PDF] Story not found: " + id);
      return res.status(404).json({ error: "Story not found", storyId: id });
    }

    console.log("[DEBUG PDF] Story found: " + story.title);

    // Validate and parse the JSON content using Zod
    const rawContent = story.content as unknown;
    const parseResult = StoryContentSchema.safeParse(rawContent);

    if (!parseResult.success) {
      console.error("[DEBUG PDF] Invalid story content:", parseResult.error);
      return res.status(500).json({
        error: "Invalid story content structure",
        validationError: parseResult.error.message,
      });
    }

    let pages = parseResult.data;
    console.log("[DEBUG PDF] Valid pages: " + pages.length);

    // Log original total size
    const originalSize = pages.reduce((sum, page) => {
      if (page.imageBase64) {
        const info = getImageSizeInfo(page.imageBase64);
        return sum + info.originalSize;
      }
      return sum;
    }, 0);
    console.log("[DEBUG PDF] Original images size: " + (originalSize / 1024).toFixed(2) + " KB");

    // Ensure all images have base64 data
    pages = await Promise.all(pages.map(ensureImageBase64));

    const moral = getMoralById(story.moral);
    console.log("[DEBUG PDF] Moral: " + (moral?.label || story.moral));

    // Generate PDF using pdfkit
    console.log("[DEBUG PDF] Starting PDF generation with pdfkit...");
    const pdfBuffer = await generatePDF({
      title: story.title,
      childName: story.child.name,
      moral: moral?.label || story.moral,
      pages,
    });

    const pdfSizeKB = (pdfBuffer.length / 1024).toFixed(2);
    const duration = Date.now() - startTime;
    console.log("[DEBUG PDF] PDF generated: " + pdfSizeKB + " KB in " + duration + "ms");

    // Return PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=\"" + story.title.replace(/[^a-z0-9]/gi, "_") + ".pdf\""
    );
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    res.setHeader("X-Debug-Time", duration.toString());
    res.setHeader("X-Debug-Size", pdfSizeKB);
    res.setHeader("X-Debug-Pages", pages.length.toString());

    return res.send(pdfBuffer);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[DEBUG PDF] Generation failed after " + duration + "ms:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate PDF",
      stack: error instanceof Error ? error.stack : undefined,
      duration: duration + "ms",
    });
  }
}
