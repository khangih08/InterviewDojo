import { test, expect } from "@playwright/test";

test.describe("True E2E Test (No Mocking)", () => {
  const testEmail = `real-test-${Date.now()}@example.com`;
  const testPassword = "Password123!";
  const testFullName = "True E2E Tester";

  // Sau khi tất cả các test hoàn tất, dọn dẹp tài khoản test trong cơ sở dữ liệu thật
  test.afterAll(async ({ request }) => {
    console.log(`🧹 Bắt đầu dọn dẹp tài khoản test: ${testEmail}`);
    try {
      const response = await request.post("http://localhost:8000/auth/cleanup-test-user", {
        data: { email: testEmail },
      });
      if (response.ok()) {
        const result = await response.json();
        console.log(`✅ Dọn dẹp hoàn tất: ${result.message}`);
      } else {
        console.error(`❌ Lỗi dọn dẹp tài khoản (Status ${response.status()}):`, await response.text());
      }
    } catch (error) {
      console.error("❌ Exception trong quá trình dọn dẹp tài khoản:", error);
    }
  });

  test("Luồng hoàn chỉnh: Đăng ký -> Đăng nhập -> Bắt đầu phỏng vấn tự do", async ({ page }) => {
    // 1. Đi tới trang đăng ký
    await page.goto("/register");
    await expect(page.getByText("Create your account", { exact: true })).toBeVisible();

    // 2. Điền thông tin đăng ký
    await page.getByPlaceholder("Email").fill(testEmail);
    await page.getByPlaceholder("Full Name").fill(testFullName);
    await page.getByPlaceholder("Password", { exact: true }).fill(testPassword);
    await page.getByPlaceholder("Confirm Password").fill(testPassword);
    
    // Click nút đăng ký
    await page.getByRole("button", { name: "Register" }).click();

    // 3. Đảm bảo chuyển hướng về trang login với thông báo thành công
    await expect(page).toHaveURL(/\/login\?registered=1/, { timeout: 15000 });
    await expect(page.getByText(/Account created successfully/i)).toBeVisible();

    // 4. Thực hiện đăng nhập bằng tài khoản vừa tạo
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password", { exact: true }).fill(testPassword);
    await page.getByRole("button", { name: "Sign in" }).click();

    // 5. Đảm bảo chuyển hướng thành công tới Dashboard và hiển thị thông tin thật
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/True E2E Tester/i)).toBeVisible();

    // 6. Truy cập trang phỏng vấn
    await page.goto("/interview");
    await expect(page.getByText("AI Interview Agent")).toBeVisible();
    await expect(page.getByText("Luyện tập tự do")).toBeVisible();

    // 7. Nhấn nút "Bắt đầu ngay" trong luồng phỏng vấn tự do
    await page.getByRole("button", { name: /Bắt đầu ngay/i }).click();

    // 8. Đảm bảo nhận được câu hỏi đầu tiên thật từ AI Engine (chờ tối đa 20s cho AI phản hồi)
    await expect(page.getByText(/Chào bạn/i)).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Kết thúc phiên/i)).toBeVisible();
  });
});
