import { test, expect, type Page } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  full_name: "Test User",
  plan: "FREE",
  credits: 5,
};

async function injectAuth(page: Page) {
  await page.context().addCookies([
    {
      name: "idc_access_token",
      value: "test-access-token",
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.addInitScript((user) => {
    sessionStorage.setItem("idc_user_session", JSON.stringify(user));
  }, mockUser);
}

function mockInterviewStart(page: Page) {
  return page.route("**/interviews/start", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "interview-123",
      }),
    }),
  );
}

function mockInterviewState(page: Page, firstMessage = "Chào bạn, chúng ta bắt đầu nhé!") {
  return page.route("**/interviews/interview-123/state?userId=*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        interviewId: "interview-123",
        currentPhase: "THEORY",
        chatHistory: [
          { role: "assistant", content: firstMessage }
        ],
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

    await expect(page.getByText("Phòng chờ")).toBeVisible();
    await expect(page.getByRole("button", { name: "PHỎNG VẤN VỚI CV" })).toBeVisible();
    await expect(page.getByRole("button", { name: "BẮT ĐẦU NHANH" })).toBeVisible();
  });

  test("transitions to chat step and shows AI first message", async ({ page }) => {
    await mockInterviewStart(page);
    await mockInterviewState(page, "Chào bạn, chúng ta bắt đầu nhé!");
    await page.goto("/interview");

    await page.getByRole("button", { name: "BẮT ĐẦU NHANH" }).click();

    await expect(
      page.getByText("Chào bạn, chúng ta bắt đầu nhé!"),
    ).toBeVisible({ timeout: 15000 });
  });

  test("shows mic button after entering chat step", async ({ page }) => {
    await mockInterviewStart(page);
    await mockInterviewState(page, "Hello!");
    await page.goto("/interview");

    await page.getByRole("button", { name: "BẮT ĐẦU NHANH" }).click();
    await expect(page.getByText("Hello!")).toBeVisible({ timeout: 15000 });

    const micButton = page.locator("button:has(svg.lucide-mic)");
    await expect(micButton).toBeVisible();
  });

  test("returns to selection screen after ending session", async ({ page }) => {
    await mockInterviewStart(page);
    await mockInterviewState(page, "Hello!");
    await page.goto("/interview");

    await page.getByRole("button", { name: "BẮT ĐẦU NHANH" }).click();
    await expect(page.getByText("Hello!")).toBeVisible({ timeout: 15000 });

    // The cancel button redirects back to dashboard via handleReset
    const endButton = page.getByText("THOÁT");
    await expect(endButton).toBeVisible();
    await endButton.click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("shows error alert when interview start fails", async ({ page }) => {
    await page.route("**/interviews/start", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Không thể bắt đầu phỏng vấn." }),
      }),
    );

    page.on("dialog", (dialog) => {
      expect(dialog.message()).toMatch(/Không thể/i);
      dialog.dismiss();
    });

    await page.goto("/interview");
    await page.getByRole("button", { name: "BẮT ĐẦU NHANH" }).click();

    await expect(page.getByText("Phòng chờ")).toBeVisible({ timeout: 10000 });
  });
});

