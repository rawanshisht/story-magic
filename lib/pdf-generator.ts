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

function registerFonts(doc: PDFKit.PDFDocument): void {
  // Built-in fonts: Times-Roman, Times-Bold, Times-Italic, Times-BoldItalic
  // Helvetica, Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique
  // Courier, Courier-Bold, Courier-Oblique, Courier-BoldOblique
}

/**
 * Generate a PDF buffer using pdfkit (Node.js compatible)
 */
export async function generatePDF(options: PDFGeneratorOptions): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        autoFirstPage: false,
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
      doc.addPage();
      createCoverPage(doc, options);

      // Story Pages
      for (let i = 0; i < options.pages.length; i++) {
        doc.addPage();
        createStoryPage(doc, options.pages[i]);
      }

      // End Page
      doc.addPage();
      createEndPage(doc, options);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function createCoverPage(doc: PDFKit.PDFDocument, options: PDFGeneratorOptions): void {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Purple background - draw as path without chaining
  doc.path(`M0,0 L${pageWidth},0 L${pageWidth},${pageHeight} L0,${pageHeight} Z`);
  doc.fill("#8B5CF6");
  
  // Title
  doc.fillColor("#FFFFFF")
    .fontSize(36)
    .font("Times-Bold")
    .text(options.title, 50, 200, {
      align: "center",
      width: pageWidth - 100,
    });

  // Subtitle
  doc.fontSize(18)
    .font("Times-Roman")
    .text(`A story about ${options.moral} featuring ${options.childName}`, 50, 300, {
      align: "center",
      width: pageWidth - 100,
    });

  // Footer
  doc.fontSize(14)
    .text("Created with StoryBook", 50, 500, {
      align: "center",
      width: pageWidth - 100,
    });
}

function createStoryPage(doc: PDFKit.PDFDocument, page: StoryPage): void {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // White background - draw as path
  doc.path(`M0,0 L${pageWidth},0 L${pageWidth},${pageHeight} L0,${pageHeight} Z`);
  doc.fill("#FFFFFF");

  // Calculate image dimensions
  const imageWidth = 400;
  const imageMaxHeight = 280;
  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = 80;
  const imageTextPadding = 40;

  let renderedImageHeight = 0;

  // Add image if available
  if (page.imageBase64 && page.imageBase64.startsWith("data:")) {
    try {
      const base64Data = page.imageBase64.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      
      doc.image(imageBuffer, imageX, imageY, {
        fit: [imageWidth, imageMaxHeight],
        align: "center" as const,
      });
      
      renderedImageHeight = imageMaxHeight;
    } catch (error) {
      console.warn("Failed to add image to PDF:", error);
      drawPlaceholder(doc, imageX, imageY, imageWidth, imageMaxHeight);
      renderedImageHeight = imageMaxHeight;
    }
  } else if (page.imageUrl && page.imageUrl.startsWith("https://")) {
    drawPlaceholder(doc, imageX, imageY, imageWidth, imageMaxHeight);
    renderedImageHeight = imageMaxHeight;
  } else {
    drawPlaceholder(doc, imageX, imageY, imageWidth, imageMaxHeight);
    renderedImageHeight = imageMaxHeight;
  }

  // Story text
  const textY = imageY + renderedImageHeight + imageTextPadding;
  
  doc.fillColor("#1F2937")
    .fontSize(16)
    .font("Times-Roman")
    .text(page.text, 70, textY, {
      align: "center",
      width: pageWidth - 140,
      lineGap: 4,
    });

  // Page number
  doc.fillColor("#9CA3AF")
    .fontSize(12)
    .font("Times-Roman")
    .text(`Page ${page.pageNumber}`, 0, pageHeight - 40, {
      align: "center",
      width: pageWidth,
    });
}

function drawPlaceholder(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number): void {
  // Draw placeholder rectangle
  doc.rect(x, y, width, height).fill("#F3F4F6");
  
  doc.fillColor("#9CA3AF")
    .fontSize(14)
    .font("Times-Roman")
    .text("Illustration", x, y + (height / 2) - 7, {
      align: "center",
      width: width,
    });
}

function createEndPage(doc: PDFKit.PDFDocument, options: PDFGeneratorOptions): void {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Purple background
  doc.path(`M0,0 L${pageWidth},0 L${pageWidth},${pageHeight} L0,${pageHeight} Z`);
  doc.fill("#8B5CF6");

  // Title
  doc.fillColor("#FFFFFF")
    .fontSize(36)
    .font("Times-Bold")
    .text("The End", 50, 200, {
      align: "center",
      width: pageWidth - 100,
    });

  // Thank you message
  doc.fontSize(18)
    .font("Times-Roman")
    .text("Thank you for reading!", 50, 280, {
      align: "center",
      width: pageWidth - 100,
    });

  // Footer
  doc.fontSize(10)
    .text("This story was created with love by StoryBook", 50, 500, {
      align: "center",
      width: pageWidth - 100,
    });
}

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
