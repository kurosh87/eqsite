import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate from home to sign in", async ({ page }) => {
    await page.goto("/");

    // Click sign in link
    await page.click('a[href="/sign-in"]');

    // Should be on sign in page
    await expect(page).toHaveURL(/sign-in/);
  });

  test("should navigate from sign in to sign up", async ({ page }) => {
    await page.goto("/sign-in");

    // Click sign up link
    await page.click('a[href="/sign-up"]');

    // Should be on sign up page
    await expect(page).toHaveURL(/sign-up/);
  });

  test("should have working logo link", async ({ page }) => {
    await page.goto("/sign-in");

    // Click logo/home link
    const logoLink = page.locator('a[href="/"]').first();
    if (await logoLink.isVisible()) {
      await logoLink.click();
      await expect(page).toHaveURL("/");
    }
  });

  test("should handle 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-12345");

    // Should show 404 page or redirect
    expect(response?.status()).toBe(404);
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to sign in when accessing dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to sign in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("should redirect to sign in when accessing profile", async ({ page }) => {
    await page.goto("/profile");

    // Should redirect to sign in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("should redirect to sign in when accessing phenotypes", async ({ page }) => {
    await page.goto("/phenotypes");

    // Should redirect to sign in
    await expect(page).toHaveURL(/sign-in/);
  });
});
