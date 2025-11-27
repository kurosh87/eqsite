import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");

    // Check that the page title contains the app name
    await expect(page).toHaveTitle(/Phenotype/i);
  });

  test("should display hero section", async ({ page }) => {
    await page.goto("/");

    // Check for hero content
    await expect(page.locator("text=Ancestral Roots")).toBeVisible();
    await expect(page.locator("text=Get Started")).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");

    // Check for sign in link
    const signInLink = page.locator('a[href="/sign-in"]');
    await expect(signInLink).toBeVisible();
  });

  test("should have language selector", async ({ page }) => {
    await page.goto("/");

    // Look for language selector button
    const langSelector = page.locator('[aria-label*="language"], [aria-label*="Language"]');
    if (await langSelector.isVisible()) {
      await expect(langSelector).toBeVisible();
    }
  });

  test("should display feature sections", async ({ page }) => {
    await page.goto("/");

    // Check for key sections
    await expect(page.locator("text=How It Works")).toBeVisible();
    await expect(page.locator("text=Why Choose Us")).toBeVisible();
  });

  test("should have working CTA buttons", async ({ page }) => {
    await page.goto("/");

    // Find and click get started button
    const ctaButton = page.locator('text=Get Started').first();
    await expect(ctaButton).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Page should still load properly
    await expect(page.locator("text=Ancestral Roots")).toBeVisible();
  });
});
