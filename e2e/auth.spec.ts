import { test, expect } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test.describe("Sign In Page", () => {
    test("should load sign in page", async ({ page }) => {
      await page.goto("/sign-in");

      // Check for sign in form elements
      await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    });

    test("should have forgot password link", async ({ page }) => {
      await page.goto("/sign-in");

      const forgotLink = page.locator('text=Forgot').first();
      await expect(forgotLink).toBeVisible();
    });

    test("should have sign up link", async ({ page }) => {
      await page.goto("/sign-in");

      const signUpLink = page.locator('a[href="/sign-up"]');
      await expect(signUpLink).toBeVisible();
    });

    test("should show validation on empty submit", async ({ page }) => {
      await page.goto("/sign-in");

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Check for HTML5 validation or error message
        const emailInput = page.locator('input[name="email"], input[type="email"]');
        const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
        expect(isInvalid).toBe(true);
      }
    });
  });

  test.describe("Sign Up Page", () => {
    test("should load sign up page", async ({ page }) => {
      await page.goto("/sign-up");

      // Check for sign up form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test("should have sign in link", async ({ page }) => {
      await page.goto("/sign-up");

      const signInLink = page.locator('a[href="/sign-in"]');
      await expect(signInLink).toBeVisible();
    });
  });

  test.describe("Forgot Password Page", () => {
    test("should load forgot password page", async ({ page }) => {
      await page.goto("/forgot-password");

      // Check for email input
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test("should have back to sign in link", async ({ page }) => {
      await page.goto("/forgot-password");

      const backLink = page.locator('a[href="/sign-in"]');
      await expect(backLink).toBeVisible();
    });
  });
});
