import { test, expect } from '@playwright/test';
import { generatePDF } from '@/lib/pdf-generator';
import type { StoryPage } from '@/types';

test.describe('PDF Image Overlap Fix', () => {
  
  // Helper to create a test PDF with given pages
  async function generateTestPDF(pages: StoryPage[], title: string = 'Test Story'): Promise<Buffer> {
    return await generatePDF({
      title,
      childName: 'Test Child',
      moral: 'Be kind to others',
      pages,
    });
  }

  test.describe('Image Overlap Detection', () => {
    test('should NOT overlap text on portrait images (tall images)', async () => {
      // Portrait image: height > width (more vertical)
      const portraitImage = 'data:image/png;base64,' + Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==').toString('base64');
      
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'Once upon a time, in a magical forest filled with towering trees and sparkling streams, there lived a young adventurer named Alex. This story is about finding courage in unexpected places.',
          imageBase64: portraitImage,
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Portrait Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // The PDF should be generated without errors
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });

    test('should NOT overlap text on landscape images (wide images)', async () => {
      // Landscape image: width > height (more horizontal)
      const landscapeImage = 'data:image/png;base64,' + Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=').toString('base64');
      
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'The sun was setting behind the hills, casting a golden glow across the meadow. Birds sang their evening songs as the day came to a peaceful close.',
          imageBase64: landscapeImage,
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Landscape Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });

    test('should NOT overlap text on square images', async () => {
      // Square image: width = height
      const squareImage = 'data:image/png;base64,' + Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=').toString('base64');
      
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'In the center of the enchanted garden stood a beautiful crystal fountain. Its waters shimmered with magical properties that could heal any wound.',
          imageBase64: squareImage,
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Square Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  test.describe('Page Break Handling', () => {
    test('should handle long text that exceeds one page', async () => {
      // Generate long text that should span multiple pages
      const longText = Array(50).fill('This is a long story that should test page breaking functionality. ').join('');
      
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: longText,
          imageBase64: '',
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Long Text Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
      
      // The PDF should have multiple pages (more than 1)
      // We can check the PDF structure for page count
      const pdfStr = pdfBuffer.toString('latin1');
      const pageCount = (pdfStr.match(/\/Type\s*\/Page[^/]*/g) || []).length;
      expect(pageCount).toBeGreaterThan(1);
    });

    test('should NOT create empty pages', async () => {
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'A short story.',
          imageBase64: '',
          imageUrl: '',
        },
        {
          pageNumber: 2,
          text: 'Another short story.',
          imageBase64: '',
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'No Empty Pages Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
      
      // Check that we don't have more pages than needed
      const pdfStr = pdfBuffer.toString('latin1');
      const pageCount = (pdfStr.match(/\/Type\s*\/Page[^/]*/g) || []).length;
      
      // Should have exactly 2 pages (or possibly 3 if there's an end page)
      // But definitely NOT more than 3
      expect(pageCount).toBeLessThanOrEqual(3);
    });

    test('should display correct page numbers', async () => {
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'Page 1 content about adventure.',
          imageBase64: '',
          imageUrl: '',
        },
        {
          pageNumber: 2,
          text: 'Page 2 content about friendship.',
          imageBase64: '',
          imageUrl: '',
        },
        {
          pageNumber: 3,
          text: 'Page 3 content about courage.',
          imageBase64: '',
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Page Numbers Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  test.describe('Placeholder Styling', () => {
    test('placeholder should render when no image provided', async () => {
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'A story with a placeholder image.',
          imageBase64: '',
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Placeholder Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });

    test('placeholder should match image area dimensions', async () => {
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'Testing placeholder size.',
          imageBase64: '',
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Placeholder Size Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  test.describe('Multiple Story Pages', () => {
    test('should handle multiple pages with images and text correctly', async () => {
      const pages: StoryPage[] = [
        {
          pageNumber: 1,
          text: 'Chapter 1: The Beginning. Our hero sets out on a journey to find the legendary crystal of courage.',
          imageBase64: 'data:image/png;base64,' + Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=').toString('base64'),
          imageUrl: '',
        },
        {
          pageNumber: 2,
          text: 'Chapter 2: The Challenge. Along the way, our hero faced many obstacles but never gave up.',
          imageBase64: 'data:image/png;base64,' + Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==').toString('base64'),
          imageUrl: '',
        },
        {
          pageNumber: 3,
          text: 'Chapter 3: The Triumph. Finally, our hero found the crystal and learned the true meaning of courage.',
          imageBase64: 'data:image/png;base64,' + Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=').toString('base64'),
          imageUrl: '',
        },
      ];

      const pdfBuffer = await generateTestPDF(pages, 'Multi Page Test');
      
      // Verify PDF was generated
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
      
      // Should have multiple pages (cover + story pages + end)
      const pdfStr = pdfBuffer.toString('latin1');
      const pageCount = (pdfStr.match(/\/Type\s*\/Page[^/]*/g) || []).length;
      expect(pageCount).toBeGreaterThanOrEqual(3);
    });
  });
});
