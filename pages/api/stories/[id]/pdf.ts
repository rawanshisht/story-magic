import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { StoryPage } from "@/types";
import { getMoralById } from "@/config/morals";
import { downloadImageAsBase64 } from "@/lib/openai";
import {
  processImageForPdf,
  type ImageOptimizationConfig,
} from "@/lib/image-optimizer";
import { generatePDFForEmail } from "@/lib/pdf-generator-email";
import { getUserIdFromToken } from "@/lib/auth-helper";

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

// Cache PDF to database asynchronously (fire and forget)
function cachePdfAsync(storyId: string, pdfBuffer: Buffer): void {
  prisma.story
    .update({
      where: { id: storyId },
      data: { cachedPdf: pdfBuffer },
    })
    .catch((err) => console.error("[PDF] Failed to cache:", err));
}

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
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid story id" });
    }

    const cacheCheck = await prisma.story.findUnique({
      where: { id },
      select: { title: true, userId: true, isPublic: true, cachedPdf: true },
    });

    // Public stories can be downloaded by anyone; private ones only by their
    // owner. Unknown and private stories get the same response, so callers
    // can't tell which story IDs exist.
    if (!cacheCheck?.isPublic) {
      const token = req.cookies["firebase-auth"];
      const userId = token ? await getUserIdFromToken(token) : null;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!cacheCheck || cacheCheck.userId !== userId) {
        return res.status(404).json({ error: "Story not found" });
      }
    }

    // Return cached PDF if available
    if (cacheCheck.cachedPdf) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=\"" + cacheCheck.title.replace(/[^a-z0-9]/gi, "_") + ".pdf\""
      );
      res.setHeader("Content-Length", cacheCheck.cachedPdf.length.toString());

      return res.send(Buffer.from(cacheCheck.cachedPdf));
    }

    // No cache - fetch full story data for generation
    const story = await prisma.story.findUnique({
      where: { id },
      include: { child: true },
    });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // Validate and parse the JSON content using Zod
    const rawContent = story.content as unknown;
    const parseResult = StoryContentSchema.safeParse(rawContent);

    if (!parseResult.success) {
      console.error("[PDF] Invalid story content:", parseResult.error);
      return res.status(500).json({
        error: "Invalid story content structure",
      });
    }

    let pages = parseResult.data;

    // Ensure all images have base64 data
    pages = await Promise.all(pages.map(ensureImageBase64));

    const moral = getMoralById(story.moral);

    // Generate PDF using pdf-lib (faster than pdfkit)
    const pdfBuffer = await generatePDFForEmail({
      title: story.title,
      childName: story.child.name,
      moral: moral?.label || story.moral,
      pages,
    });

    const pdfSizeKB = (pdfBuffer.length / 1024).toFixed(2);
    const duration = Date.now() - startTime;
    console.log("[PDF] PDF generated: " + pdfSizeKB + " KB in " + duration + "ms");

    // Cache PDF asynchronously (don't wait)
    cachePdfAsync(id, pdfBuffer);

    // Return PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=\"" + story.title.replace(/[^a-z0-9]/gi, "_") + ".pdf\""
    );
    res.setHeader("Content-Length", pdfBuffer.length.toString());

    return res.send(pdfBuffer);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[PDF] Generation failed after " + duration + "ms:", error);

    return res.status(500).json({
      error: "Failed to generate PDF",
    });
  }
}
