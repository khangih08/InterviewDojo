import { test, expect, type Page } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  full_name: "Test User",
};

// The Next.js middleware (proxy.ts) guards protected routes by reading
// the idc_access_token COOKIE. addInitScript (sessionStorage) is invisible
// to middleware, so we inject the cookie directly into the browser context.
async function injectAuth(page: Page) {
  await page.context().addCookies([
    {
      name: "idc_access_token",
      value: "test-access-token",
      domain: "localhost",
      path: "/",
    },
  ]);
  // Also populate sessionStorage so the React AuthProvider shows user data
  await page.addInitScript((user) => {
    sessionStorage.setItem("idc_user_session", JSON.stringify(user));
  }, mockUser);
}

function mockInterviewStart(
  page: Page,
  firstMessage = "Chào bạn, chúng ta bắt đầu nhé!",
) {
  return page.route("**/interviews/start", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        interviewId: "interview-123",
        firstMessage,
      }),
    }),
  );
}

test.describe("Interview Agent", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test("shows mode selection screen on load", async ({ page }) => {
    await page.goto("/interview");

    await expect(page.getByText("AI Interview Agent")).toBeVisible();
    await expect(page.getByText("Luyện tập tự do")).toBeVisible();
    await expect(page.getByText("Phỏng vấn sát thực tế")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Bắt đầu ngay/i }),
    ).toBeVisible();
  });

  test("transitions to chat step and shows AI first message", async ({ page }) => {
    await mockInterviewStart(page);
    await page.goto("/interview");

    await page.getByRole("button", { name: /Bắt đầu ngay/i }).click();

    await expect(
      page.getByText("Chào bạn, chúng ta bắt đầu nhé!"),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Kết thúc phiên")).toBeVisible();
  });

  test("shows mic button after entering chat step", async ({ page }) => {
    await mockInterviewStart(page, "Hello!");
    await page.goto("/interview");

    await page.getByRole("button", { name: /Bắt đầu ngay/i }).click();
    await expect(page.getByText("Hello!")).toBeVisible();

    // Mic button: round indigo button with no visible text label
    const micButton = page.locator("button.rounded-full.bg-indigo-600");
    await expect(micButton).toBeVisible();
  });

  test("returns to selection screen after ending session", async ({ page }) => {
    await mockInterviewStart(page, "Hello!");
    await page.goto("/interview");

    await page.getByRole("button", { name: /Bắt đầu ngay/i }).click();
    await expect(page.getByText("Hello!")).toBeVisible();

    // The end-session button calls window.confirm()
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByText("Kết thúc phiên").click();

    await expect(page.getByText("Luyện tập tự do")).toBeVisible();
  });

  test("shows error alert when interview start fails", async ({ page }) => {
    await page.route("**/interviews/start", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Server error" }),
      }),
    );

    page.on("dialog", (dialog) => {
      expect(dialog.message()).toMatch(/Server error|Không thể/i);
      dialog.dismiss();
    });

    await page.goto("/interview");
    await page.getByRole("button", { name: /Bắt đầu ngay/i }).click();

    // Must remain on SELECT step after a failed start
    await expect(
      page.getByText("Luyện tập tự do"),
    ).toBeVisible({ timeout: 10000 });
  });
});
