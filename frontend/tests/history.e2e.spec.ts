import { test, expect, type Page } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  full_name: "Test User",
};

const mockSessions = [
  {
    id: "sess-1",
    question_content: "Phỏng vấn tự do",
    status: "COMPLETED",
    created_at: new Date().toISOString(),
    ai_analysis: {
      technical_score: 85,
      communication_score: 80,
      feedback: "Good performance overall.",
    },
  },
  {
    id: "sess-2",
    question_content: "Phỏng vấn theo CV",
    status: "COMPLETED",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ai_analysis: {
      technical_score: 70,
      communication_score: 75,
      feedback: "Need to improve depth of answers.",
    },
  },
];

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

function mockSessionsApi(page: Page, sessions = mockSessions) {
  return page.route("**/interviews", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessions),
    }),
  );
}

test.describe("Interview History", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test("displays session history header and stats", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Session History")).toBeVisible();
    await expect(page.getByText("Review your interview trail")).toBeVisible();
  });

  test("shows list of completed sessions", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Phỏng vấn theo CV")).toBeVisible();
  });

  test("shows total session count in stats", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByText("2").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows empty state when no sessions match filter", async ({ page }) => {
    await mockSessionsApi(page, []);
    await page.goto("/history");

    await expect(
      page.getByText("No sessions match the current filters"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("filters sessions using the search input", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder("Search question or category");
    await searchInput.fill("CV");

    await expect(page.getByText("Phỏng vấn theo CV")).toBeVisible();
    await expect(page.getByText("Phỏng vấn tự do")).not.toBeVisible();
  });

  test("shows View result link for each session", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByRole("link", { name: /View result/i }).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("navigates to result page when clicking View result", async ({ page }) => {
    await mockSessionsApi(page);

    await page.route("**/analysis/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sessionId: "sess-1",
          status: "done",
          technicalScore: 85,
          communicationScore: 80,
          strengths: ["Clear"],
          weaknesses: ["Speed"],
          suggestions: ["Practice"],
        }),
      }),
    );

    await page.goto("/history");
    await expect(page.getByRole("link", { name: /View result/i }).first()).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("link", { name: /View result/i }).first().click();
    await expect(page).toHaveURL(/\/result\?sessionId=sess-1/, { timeout: 10000 });
  });

  test("resets all filters when clicking Reset filters on empty state", async ({
    page,
  }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder("Search question or category");
    await searchInput.fill("nonexistent-query-xyz");

    await expect(
      page.getByText("No sessions match the current filters"),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Reset filters" }).click();

    await expect(page.getByText("Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });
  });
});
