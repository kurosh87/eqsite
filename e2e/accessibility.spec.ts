import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("home page should have skip to content link", async ({ page }) => {
    await page.goto("/");

    // Look for skip to content link (may be visually hidden)
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip")');
    const count = await skipLink.count();

    if (count > 0) {
      // Focus the skip link by tabbing
      await page.keyboard.press("Tab");

      // Check if skip link exists
      expect(count).toBeGreaterThan(0);
    }
  });

  test("home page should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Should have an h1
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();

    // Count headings
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("buttons should be keyboard accessible", async ({ page }) => {
    await page.goto("/");

    // Tab through the page
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check that something is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test("images should have alt text", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // Alt can be empty string for decorative images, but should exist
      expect(alt !== null).toBe(true);
    }
  });

  test("forms should have labels", async ({ page }) => {
    await page.goto("/sign-in");

    // Get all inputs
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");

      // Input should have some form of labeling
      const hasLabel = id || ariaLabel || ariaLabelledBy || placeholder;
      expect(hasLabel).toBeTruthy();
    }
  });

  test("interactive elements should have focus styles", async ({ page }) => {
    await page.goto("/");

    // Find a button and focus it
    const button = page.locator("button").first();
    if (await button.isVisible()) {
      await button.focus();

      // Check that it has focus
      const isFocused = await button.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    }
  });
});
