import { expect, test } from "@playwright/test";

test("loads landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Interview|Dojo/i);
});
