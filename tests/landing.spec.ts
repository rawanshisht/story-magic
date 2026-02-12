import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the main elements are present
    await expect(page.locator('h1')).toContainText('Create Magical Stories');
    await expect(page.locator('text=AI-Powered Personalized Stories')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check for navbar
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for call-to-action buttons
    await expect(page.locator('text=Create Your First Story')).toBeVisible();
  });

  test('should display all sections', async ({ page }) => {
    await page.goto('/');
    
    // Check for main sections
    await expect(page.locator('text=How It Works').first()).toBeVisible();
    await expect(page.locator('text=Features').first()).toBeVisible();
    await expect(page.locator('text=What Parents Say').first()).toBeVisible();
    await expect(page.locator('text=Pricing').first()).toBeVisible();
  });

  test('should navigate to register page when clicking CTA', async ({ page }) => {
    await page.goto('/');
    
    // Click the Create Your First Story button
    await page.click('text=Create Your First Story');
    
    // Should redirect to login/register page
    await expect(page).toHaveURL(/.*login|.*register/);
  });
});

test.describe('Landing Page - Responsive', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still load and be functional
    await expect(page.locator('h1')).toContainText('Create Magical Stories');
  });
});
