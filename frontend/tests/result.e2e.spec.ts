import { test, expect, type Page } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  full_name: "Test User",
};

const mockSession = {
  id: "sess-1",
  question_content: "Phỏng vấn tự do",
  status: "COMPLETED",
  created_at: new Date().toISOString(),
  ai_analysis: {
    technical_score: 85,
    communication_score: 80,
    feedback: "Good problem solving. Solid communication skills.",
    transcript: "Interviewer: Tell me about your background...",
  },
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

function mockSessionById(page: Page, session = mockSession) {
  return page.route(`**/interviews/${session.id}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(session),
    }),
  );
}

test.describe("Interview Result Page", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test("displays scores from session AI analysis", async ({ page }) => {
    await mockSessionById(page);
    await page.goto("/result?sessionId=sess-1");

    // Use .first() to avoid strict-mode violation when "85" appears in multiple elements (score card + metric bar)
    await expect(page.getByText("85").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("80").first()).toBeVisible();
  });

  test("shows Strengths, Weaknesses, and Suggestions sections", async ({ page }) => {
    await mockSessionById(page);
    await page.goto("/result?sessionId=sess-1");

    await expect(page.getByText("Strengths")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Weaknesses")).toBeVisible();
    await expect(page.getByText("Suggestions")).toBeVisible();
  });

  test("shows back button and Back to Dashboard button", async ({ page }) => {
    await mockSessionById(page);
    await page.goto("/result?sessionId=sess-1");

    await expect(page.getByRole("button", { name: "Back", exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Back to Dashboard" })).toBeVisible();
  });

  test("navigates to dashboard when clicking Back to Dashboard", async ({ page }) => {
    await mockSessionById(page);
    await page.goto("/result?sessionId=sess-1");

    await expect(page.getByRole("button", { name: "Back to Dashboard" })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: "Back to Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("shows Try Another Question button", async ({ page }) => {
    await mockSessionById(page);
    await page.goto("/result?sessionId=sess-1");

    await expect(page.getByRole("button", { name: "Try Another Question" })).toBeVisible({ timeout: 10000 });
  });

  test("shows analysis unavailable state when session is not found", async ({ page }) => {
    await page.route("**/interviews/bad-id", (route) =>
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Session not found" }),
      }),
    );

    await page.goto("/result?sessionId=bad-id");

    await expect(page.getByText("Analysis unavailable")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Back to Interview" })).toBeVisible();
  });

  test("displays Performance breakdown heading and overall score", async ({ page }) => {
    await mockSessionById(page);
    await page.goto("/result?sessionId=sess-1");

    await expect(page.getByText("Performance breakdown")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Interview Result")).toBeVisible();
  });
});
