import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import sharp from "sharp";
import { StoryPage } from "@/types";

/**
 * Compress image to JPEG with reduced size for smaller PDF
 */
async function compressImage(base64Data: string): Promise<Buffer> {
  const imageBuffer = Buffer.from(base64Data, "base64");

  // Resize to max 800px and convert to JPEG with 80% quality
  const compressed = await sharp(imageBuffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return compressed;
}

interface PDFGeneratorOptions {
  title: string;
  childName: string;
  moral: string;
  pages: StoryPage[];
}

/**
 * Generate a PDF buffer using pdf-lib (works in serverless environments)
 */
export async function generatePDFForEmail(options: PDFGeneratorOptions): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points

  // Cover Page
  const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);

  // Purple background
  coverPage.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.545, 0.361, 0.965), // #8B5CF6
  });

  // Title
  const titleFontSize = 36;
  const titleWidth = timesRomanBold.widthOfTextAtSize(options.title, titleFontSize);
  coverPage.drawText(options.title, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 200,
    size: titleFontSize,
    font: timesRomanBold,
    color: rgb(1, 1, 1),
  });

  // Subtitle
  const subtitle = `A story about ${options.moral}`;
  const subtitleFontSize = 20;
  const subtitleWidth = timesRoman.widthOfTextAtSize(subtitle, subtitleFontSize);
  coverPage.drawText(subtitle, {
    x: (pageWidth - subtitleWidth) / 2,
    y: pageHeight - 260,
    size: subtitleFontSize,
    font: timesRoman,
    color: rgb(1, 1, 1),
  });

  const featuring = `featuring ${options.childName}`;
  const featuringWidth = timesRoman.widthOfTextAtSize(featuring, subtitleFontSize);
  coverPage.drawText(featuring, {
    x: (pageWidth - featuringWidth) / 2,
    y: pageHeight - 290,
    size: subtitleFontSize,
    font: timesRoman,
    color: rgb(1, 1, 1),
  });

  // Footer
  const footer = "Created with Story Magic";
  const footerFontSize = 16;
  const footerWidth = timesRoman.widthOfTextAtSize(footer, footerFontSize);
  coverPage.drawText(footer, {
    x: (pageWidth - footerWidth) / 2,
    y: 100,
    size: footerFontSize,
    font: timesRoman,
    color: rgb(1, 1, 1),
  });

  // Story Pages
  for (const page of options.pages) {
    const storyPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // Add image if available
    const imageY = pageHeight - 380;
    const imageWidth = 400;
    const imageHeight = 300;
    const imageX = (pageWidth - imageWidth) / 2;

    if (page.imageBase64 && page.imageBase64.startsWith("data:")) {
      try {
        const base64Data = page.imageBase64.split(",")[1];
        const originalSize = Buffer.from(base64Data, "base64").length;

        // Compress image for smaller PDF
        const compressedBytes = await compressImage(base64Data);
        console.log(`[PDF] Page ${page.pageNumber} image: ${(originalSize / 1024).toFixed(0)}KB -> ${(compressedBytes.length / 1024).toFixed(0)}KB`);

        // Always JPEG after compression
        const image = await pdfDoc.embedJpg(compressedBytes);

        const aspectRatio = image.width / image.height;
        let drawWidth = imageWidth;
        let drawHeight = imageWidth / aspectRatio;

        if (drawHeight > imageHeight) {
          drawHeight = imageHeight;
          drawWidth = imageHeight * aspectRatio;
        }

        const drawX = (pageWidth - drawWidth) / 2;
        storyPage.drawImage(image, {
          x: drawX,
          y: imageY,
          width: drawWidth,
          height: drawHeight,
        });
      } catch (error) {
        console.warn("Failed to embed image:", error);
        // Draw placeholder
        storyPage.drawRectangle({
          x: imageX,
          y: imageY,
          width: imageWidth,
          height: imageHeight,
          color: rgb(0.95, 0.95, 0.95),
        });
      }
    } else {
      // Draw placeholder
      storyPage.drawRectangle({
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
        color: rgb(0.95, 0.95, 0.95),
      });
    }

    // Story text - wrap text manually
    const textFontSize = 18;
    const maxTextWidth = pageWidth - 100;
    const words = page.text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = timesRoman.widthOfTextAtSize(testLine, textFontSize);

      if (testWidth <= maxTextWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw text lines centered
    let textY = imageY - 40;
    for (const line of lines) {
      const lineWidth = timesRoman.widthOfTextAtSize(line, textFontSize);
      storyPage.drawText(line, {
        x: (pageWidth - lineWidth) / 2,
        y: textY,
        size: textFontSize,
        font: timesRoman,
        color: rgb(0.12, 0.16, 0.22),
      });
      textY -= 26;
    }

    // Page number
    const pageNumText = `Page ${page.pageNumber}`;
    const pageNumWidth = timesRoman.widthOfTextAtSize(pageNumText, 12);
    storyPage.drawText(pageNumText, {
      x: (pageWidth - pageNumWidth) / 2,
      y: 40,
      size: 12,
      font: timesRoman,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  // End Page
  const endPage = pdfDoc.addPage([pageWidth, pageHeight]);

  // Purple background
  endPage.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.545, 0.361, 0.965),
  });

  // The End
  const endText = "The End";
  const endFontSize = 48;
  const endWidth = timesRomanBold.widthOfTextAtSize(endText, endFontSize);
  endPage.drawText(endText, {
    x: (pageWidth - endWidth) / 2,
    y: pageHeight - 250,
    size: endFontSize,
    font: timesRomanBold,
    color: rgb(1, 1, 1),
  });

  // Thank you
  const thankText = "Thank you for reading!";
  const thankFontSize = 24;
  const thankWidth = timesRoman.widthOfTextAtSize(thankText, thankFontSize);
  endPage.drawText(thankText, {
    x: (pageWidth - thankWidth) / 2,
    y: pageHeight - 320,
    size: thankFontSize,
    font: timesRoman,
    color: rgb(1, 1, 1),
  });

  // Footer
  const endFooter = "This story was created with love by Story Magic";
  const endFooterWidth = timesRoman.widthOfTextAtSize(endFooter, 14);
  endPage.drawText(endFooter, {
    x: (pageWidth - endFooterWidth) / 2,
    y: 100,
    size: 14,
    font: timesRoman,
    color: rgb(1, 1, 1),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
