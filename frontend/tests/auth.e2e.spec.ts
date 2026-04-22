import { test, expect } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  full_name: "Test User",
  target_role: "Backend Developer",
  experience_level: "junior",
};

test.describe("Login", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login");

    // CardTitle renders as a <div>, not a heading element
    await expect(page.getByText("Sign in").first()).toBeVisible();
    await expect(
      page.getByText("Use your email and password to continue."),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    // exact: true avoids matching the "Show password" toggle button
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("redirects to /dashboard on successful login", async ({ page }) => {
    await page.route("**/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          user: mockUser,
        }),
      }),
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("shows error message on invalid credentials", async ({ page }) => {
    await page.route("**/auth/login", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid email or password" }),
      }),
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password", { exact: true }).fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(/Incorrect email or password/i)).toBeVisible();
  });

  test("shows success banner when arriving from registration", async ({ page }) => {
    await page.goto("/login?registered=1");

    await expect(
      page.getByText(/Account created successfully/i),
    ).toBeVisible();
  });
});

test.describe("Register", () => {
  test("renders the registration form", async ({ page }) => {
    await page.goto("/register");

    // CardTitle renders as <div>; exact: true avoids matching the sidebar blurb
    await expect(page.getByText("Create your account", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Email").fill("test@example.com");
    await page.getByPlaceholder("Full Name").fill("Test User");
    await page.getByPlaceholder("Password", { exact: true }).fill("Password123!");
    await page.getByPlaceholder("Confirm Password").fill("DifferentPass!");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
  });

  test("redirects to /login?registered=1 on successful registration", async ({ page }) => {
    await page.route("**/auth/register", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ message: "User registered successfully" }),
      }),
    );

    await page.goto("/register");
    await page.getByPlaceholder("Email").fill("newuser@example.com");
    await page.getByPlaceholder("Full Name").fill("New User");
    await page.getByPlaceholder("Password", { exact: true }).fill("Password123!");
    await page.getByPlaceholder("Confirm Password").fill("Password123!");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/login\?registered=1/, { timeout: 10000 });
  });
});
