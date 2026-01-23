import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/');
    
    // Check button elements
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('should have form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check navbar
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display text correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading.first()).toContainText('Create Magical Stories');
  });
});

test.describe('Child Details Form', () => {
  test('should display all form fields', async ({ page }) => {
    await page.goto('/create');
    await page.click('text=Add New Child');
    
    // Check form fields
    await expect(page.locator('label:has-text("Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Age")')).toBeVisible();
    await expect(page.locator('label:has-text("Gender")')).toBeVisible();
    await expect(page.locator('label:has-text("Skin Tone")')).toBeVisible();
    await expect(page.locator('label:has-text("Eye Color")')).toBeVisible();
    await expect(page.locator('label:has-text("Hair Color")')).toBeVisible();
    await expect(page.locator('label:has-text("Hair Style")')).toBeVisible();
    await expect(page.locator('label:has-text("Interests")')).toBeVisible();
  });
});

test.describe('Moral Selector', () => {
  test('should display moral options', async ({ page }) => {
    await page.goto('/create');
    
    // Navigate to moral selection step
    // First select a child or add one
    await page.click('text=Add New Child');
    await page.fill('input#name', 'Test Child');
    await page.selectOption('select#age', '5');
    await page.selectOption('select#gender', 'male');
    await page.selectOption('select#skinTone', 'fair');
    await page.selectOption('select#eyeColor', 'blue');
    await page.selectOption('select#hairColor', 'blonde');
    await page.fill('input#interests', 'soccer, dinosaurs');
    await page.click('text=Save Child Profile');
    
    // Now should be on moral selection step
    await expect(page.locator('text=Choose Moral')).toBeVisible();
    
    // Check for moral options
    const morals = [
      'Kindness',
      'Sharing',
      'Bravery',
      'Honesty',
      'Friendship',
      'Perseverance',
      'Gratitude',
      'Respect',
      'Responsibility',
      'Creativity',
    ];
    
    for (const moral of morals) {
      await expect(page.locator(`text=${moral}`)).toBeVisible();
    }
  });
});
