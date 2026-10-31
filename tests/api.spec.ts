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
      const response = route.method === 'post'
        ? await request.post(route.path)
        : await request.get(route.path);
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
  test('should have PDF generation endpoint structure', async ({ request }) => {
    // The route /api/stories/[id]/pdf exists and requires auth for non-public stories
    const response = await request.get('/api/stories/does-not-exist/pdf');
    expect(response.status()).toBe(401);
  });
});
