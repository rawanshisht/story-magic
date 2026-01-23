import PDFDocument from "pdfkit";
import { StoryPage } from "@/types";
import path from "path";
import fs from "fs";

interface PDFGeneratorOptions {
  title: string;
  childName: string;
  moral: string;
  pages: StoryPage[];
}

// Font configuration - use built-in or custom fonts
function getFontPath(fontName: string): string {
  // For standard fonts, pdfkit needs the AFM file
  // We'll use a fallback approach with Times-Roman which is built-in
  return "";
}

function registerFonts(doc: PDFKit.PDFDocument): void {
  // pdfkit has some built-in fonts that don't require files
  // These are: Times-Roman, Times-Bold, Times-Italic, Times-BoldItalic
  // Helvetica, Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique
  // Courier, Courier-Bold, Courier-Oblique, Courier-BoldOblique
  // ZapfDingbats, Symbol
  
  // For now, we'll use the built-in fonts that don't need registration
  // The font() method will use the built-in fonts if we don't specify a path
}

/**
 * Generate a PDF buffer using pdfkit (Node.js compatible)
 * This replaces @react-pdf/renderer which doesn't work with Next.js 14 App Router
 */
export async function generatePDF(options: PDFGeneratorOptions): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: options.title,
          Author: "StoryBook",
          Subject: `A story about ${options.moral} featuring ${options.childName}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Cover Page
      createCoverPage(doc, options);

      // Story Pages
      for (const page of options.pages) {
        createStoryPage(doc, page);
      }

      // End Page
      createEndPage(doc, options);

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function createCoverPage(doc: PDFKit.PDFDocument, options: PDFGeneratorOptions): void {
  // Purple background (simulated with filled rectangle)
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#8B5CF6");
  
  // Title - use built-in font (Times-Bold is built-in)
  doc.fillColor("#FFFFFF")
    .fontSize(36)
    .font("Times-Bold")
    .text(options.title, 50, 200, {
      align: "center",
      width: doc.page.width - 100,
    });

  // Subtitle
  doc.fontSize(18)
    .font("Times-Roman")
    .text(`A story about ${options.moral} featuring ${options.childName}`, 50, 300, {
      align: "center",
      width: doc.page.width - 100,
    });

  // Footer
  doc.fontSize(14)
    .text("Created with StoryBook", 50, 500, {
      align: "center",
      width: doc.page.width - 100,
    });

  // New page
  doc.addPage();
}

function createStoryPage(doc: PDFKit.PDFDocument, page: StoryPage): void {
  // White background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FFFFFF");

  // Calculate image dimensions
  const imageWidth = 400;
  const imageX = (doc.page.width - imageWidth) / 2;
  const imageY = 80;

  // Add image if available
  if (page.imageBase64 && page.imageBase64.startsWith("data:")) {
    try {
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64Data = page.imageBase64.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      
      doc.image(imageBuffer, imageX, imageY, {
        width: imageWidth,
        align: "center",
      });
    } catch (error) {
      console.warn("Failed to add image to PDF:", error);
      drawPlaceholder(doc, imageX, imageY, imageWidth);
    }
  } else if (page.imageUrl && page.imageUrl.startsWith("https://")) {
    // For URLs, we'll try to download (but this should be handled before calling)
    drawPlaceholder(doc, imageX, imageY, imageWidth);
  } else {
    drawPlaceholder(doc, imageX, imageY, imageWidth);
  }

  // Story text - use Times-Roman (built-in)
  doc.fillColor("#1F2937")
    .fontSize(16)
    .font("Times-Roman")
    .text(page.text, 70, imageY + 320, {
      align: "center",
      width: doc.page.width - 140,
      lineGap: 4,
    });

  // Page number
  doc.fillColor("#9CA3AF")
    .fontSize(12)
    .font("Times-Roman")
    .text(`Page ${page.pageNumber}`, 0, doc.page.height - 40, {
      align: "center",
      width: doc.page.width,
    });

  // New page (except for last page)
  if (page.pageNumber < 100) { // Arbitrary check - in real usage, we'd know the total
    doc.addPage();
  }
}

function drawPlaceholder(doc: PDFKit.PDFDocument, x: number, y: number, width: number): void {
  doc.rect(x, y, width, 250)
    .fill("#F3F4F6");
  
  doc.fillColor("#9CA3AF")
    .fontSize(14)
    .font("Times-Roman")
    .text("Illustration", x, y + 110, {
      align: "center",
      width: width,
    });
}

function createEndPage(doc: PDFKit.PDFDocument, options: PDFGeneratorOptions): void {
  // Purple background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#8B5CF6");

  // Title
  doc.fillColor("#FFFFFF")
    .fontSize(36)
    .font("Times-Bold")
    .text("The End", 50, 200, {
      align: "center",
      width: doc.page.width - 100,
    });

  // Thank you message
  doc.fontSize(18)
    .font("Times-Roman")
    .text("Thank you for reading!", 50, 280, {
      align: "center",
      width: doc.page.width - 100,
    });

  // Footer
  doc.fontSize(10)
    .text("This story was created with love by StoryBook", 50, 500, {
      align: "center",
      width: doc.page.width - 100,
    });
}

/**
 * Utility function to create a simple PDF for testing
 */
export async function createSimplePDF(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    
    doc.text(text, 100, 100);
    doc.end();
  });
}
