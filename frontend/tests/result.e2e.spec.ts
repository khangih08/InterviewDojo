import { test, expect, type Page } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  full_name: "Test User",
};

const mockReport = {
  avgScore: 8.5,
  theory: 7.5,
  coding: 6.5,
  softSkills: 5.5,
  summary: "### Đánh giá AI chi tiết\nĐây là đánh giá mẫu từ AI.",
  radarData: [85, 75, 65, 85, 90]
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

function mockReportById(page: Page, sessionId = "sess-1", report = mockReport) {
  return page.route(`**/interviews/${sessionId}/report`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(report),
    }),
  );
}

test.describe("Interview Result Page", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test("displays scores from session AI analysis", async ({ page }) => {
    await mockReportById(page);
    await page.goto("/result?sessionId=sess-1");

    await expect(page.getByText("Báo Cáo Phỏng Vấn Chi Tiết")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("8.5").first()).toBeVisible();
    await expect(page.getByText("7.5").first()).toBeVisible();
  });

  test("shows core evaluation metrics and summary sections", async ({ page }) => {
    await mockReportById(page);
    await page.goto("/result?sessionId=sess-1");

    await expect(page.getByText("Đang cập nhật đánh giá chi tiết...")).not.toBeVisible();
    await expect(page.getByText("Đây là đánh giá mẫu từ AI.")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Biểu đồ năng lực")).toBeVisible();
    await expect(page.getByText("Chi tiết kỹ năng")).toBeVisible();
  });

  test("shows close button and exit works", async ({ page }) => {
    await mockReportById(page);
    await page.goto("/result?sessionId=sess-1");

    const closeButton = page.locator("button:has-text('×')");
    await expect(closeButton).toBeVisible({ timeout: 10000 });
  });

  test("shows analysis unavailable state when session is not found", async ({ page }) => {
    await page.route("**/interviews/bad-id/report", (route) =>
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Session not found" }),
      }),
    );

    await page.goto("/result?sessionId=bad-id");

    await expect(page.getByText("Không thể tải báo cáo", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Quay lại Lịch sử/i })).toBeVisible();
  });
});

