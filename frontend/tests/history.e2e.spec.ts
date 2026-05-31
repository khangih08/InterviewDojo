import { test, expect, type Page } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  full_name: "Test User",
};

const mockSessions = [
  {
    id: "sess-1",
    job_title: "Phỏng vấn tự do",
    status: "COMPLETED",
    created_at: new Date().toISOString(),
    average_score: 85,
    final_report: "Good performance overall.",
  },
  {
    id: "sess-2",
    job_title: "Phỏng vấn theo CV",
    status: "COMPLETED",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    average_score: 70,
    final_report: "Need to improve depth of answers.",
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
  return page.route("**/interviews?userId=*", (route) =>
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

    await expect(page.getByText("Lịch sử phỏng vấn")).toBeVisible();
    await expect(page.getByText("Xem lại các phiên phỏng vấn và đánh giá sự tiến bộ qua thời gian.")).toBeVisible();
  });

  test("shows list of completed sessions", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Vị trí: Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Vị trí: Phỏng vấn theo CV")).toBeVisible();
  });

  test("shows total session count in stats", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Tổng cộng")).toBeVisible();
    await expect(page.getByText("2").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows empty state when no sessions match filter", async ({ page }) => {
    await mockSessionsApi(page, []);
    await page.goto("/history");

    await expect(
      page.getByText("Không tìm thấy phiên phỏng vấn nào"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("filters sessions using the search input", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Vị trí: Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder("Tìm kiếm vị trí phỏng vấn...");
    await searchInput.fill("CV");

    await expect(page.getByText("Vị trí: Phỏng vấn theo CV")).toBeVisible();
    await expect(page.getByText("Vị trí: Phỏng vấn tự do")).not.toBeVisible();
  });

  test("shows Xem báo cáo button for each session", async ({ page }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByRole("button", { name: /Xem báo cáo/i }).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("opens report modal when clicking Xem báo cáo", async ({ page }) => {
    await mockSessionsApi(page);

    await page.route("**/interviews/sess-1/report", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          avgScore: 8.5,
          theory: 7.5,
          coding: 6.5,
          softSkills: 5.5,
          summary: "### Đánh giá AI chi tiết\nĐây là báo cáo chi tiết",
          radarData: [80, 70, 90, 80, 90]
        }),
      }),
    );

    await page.goto("/history");
    await expect(page.getByRole("button", { name: /Xem báo cáo/i }).first()).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: /Xem báo cáo/i }).first().click();
    await expect(page.getByText("Báo Cáo Phỏng Vấn Chi Tiết")).toBeVisible({ timeout: 10000 });
  });

  test("resets all filters when clicking Xóa bộ lọc on empty state", async ({
    page,
  }) => {
    await mockSessionsApi(page);
    await page.goto("/history");

    await expect(page.getByText("Vị trí: Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder("Tìm kiếm vị trí phỏng vấn...");
    await searchInput.fill("nonexistent-query-xyz");

    await expect(
      page.getByText("Không tìm thấy phiên phỏng vấn nào"),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Xóa bộ lọc" }).click();

    await expect(page.getByText("Vị trí: Phỏng vấn tự do")).toBeVisible({ timeout: 10000 });
  });
});

