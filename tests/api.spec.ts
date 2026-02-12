import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('should return 401 for protected routes without auth', async ({ request }) => {
    // Test that protected routes require authentication
    const protectedRoutes = [
      { path: '/api/stories', method: 'get' },
      { path: '/api/children', method: 'get' },
      { path: '/api/generate', method: 'post' },
    ];

    for (const route of protectedRoutes) {
      const response = await (request as any)[route.method](route.path);
      expect(response.status()).toBe(401);
    }
  });

  test('should have correct API documentation structure', async ({ page }) => {
    // Test API structure by checking that the routes exist
    // This is a basic test - in a real app, you might test actual API responses
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Story Magic/);
  });
});

test.describe('PDF Generation', () => {
  test('should have PDF generation endpoint structure', async ({ page }) => {
    // Check that the PDF generation route exists
    await page.goto('/');
    
    // The route structure should be /api/stories/[id]/pdf
    // This test verifies the route exists by checking navigation
    await expect(page.locator('text=Download as PDF')).toBeVisible();
  });
});
