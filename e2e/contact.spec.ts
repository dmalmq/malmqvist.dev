import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helper: fill the form with minimal valid data (call before each submission)
// ---------------------------------------------------------------------------
async function fillFormValid(page: Page) {
  await page.locator('[name="name"]').fill("Alex Tester");
  await page.locator('[name="email"]').fill("alex@example.com");
  await page.locator('[name="subject"]').selectOption("collab");
  await page
    .locator('[name="message"]')
    .fill("This is a test message that is long enough to pass validation.");
}

// ---------------------------------------------------------------------------
// Spec 1 — happy path
// Mock returns 200 { success: true, delivered: false, mode: 'dev-log' }
// Assert: success toast is visible
// ---------------------------------------------------------------------------
test("happy — submit valid form, mock 200, success toast visible", async ({
  page,
}) => {
  // Arrange: mock the API
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, delivered: false, mode: "dev-log" }),
    });
  });

  // Act: load the contact page and fill the form
  await page.goto("/en/contact/");
  await expect(page.locator("form")).toBeVisible();

  await fillFormValid(page);
  await page.locator('button[type="submit"]').click();

  // Assert: success toast visible
  await expect(
    page.getByText("Message sent! I'll get back to you soon.")
  ).toBeVisible({ timeout: 5000 });
});

// ---------------------------------------------------------------------------
// Spec 2 — invalid submission
// Mock returns 400 { error: 'Missing required fields' }
// Leave email empty, submit
// Assert: email field has aria-invalid="true"
// ---------------------------------------------------------------------------
test("invalid — mock 400, leave email empty, aria-invalid on email", async ({
  page,
}) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Missing required fields" }),
    });
  });

  await page.goto("/en/contact/");
  await expect(page.locator("form")).toBeVisible();

  // Fill everything except email
  await page.locator('[name="name"]').fill("Alex Tester");
  await page.locator('[name="subject"]').selectOption("inquiry");
  await page
    .locator('[name="message"]')
    .fill("This is a test message that is long enough to pass validation.");

  await page.locator('button[type="submit"]').click();

  // Assert: email field has aria-invalid
  const emailInput = page.locator('[name="email"]');
  await expect(emailInput).toHaveAttribute("aria-invalid", "true", { timeout: 3000 });
});

// ---------------------------------------------------------------------------
// Spec 3 — honeypot trap
// Fill bot_field='spam', mock returns 200 { success: true, delivered: false, mode: 'honeypot' }
// Assert: success toast visible (user never knows they were trapped)
// ---------------------------------------------------------------------------
test("honeypot — fill bot_field='spam', mock 200 honeypot, success toast", async ({
  page,
}) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        delivered: false,
        mode: "honeypot",
      }),
    });
  });

  await page.goto("/en/contact/");
  await expect(page.locator("form")).toBeVisible();

  // Fill the honeypot field (visually hidden but accessible to bots)
  await page.locator('[name="bot_field"]').fill("spam");

  // Fill rest of form normally
  await fillFormValid(page);
  await page.locator('button[type="submit"]').click();

  // Assert: success toast is shown (honeypot is silent — user sees success)
  await expect(
    page.getByText("Message sent! I'll get back to you soon.")
  ).toBeVisible({ timeout: 5000 });
});

// ---------------------------------------------------------------------------
// Spec 4 — rate-limit
// Intercept consecutive POSTs; 6th request returns 429
// Assert: toast with 'contact.error.rate' text ("Please wait a bit")
// ---------------------------------------------------------------------------
test("rate-limit — 6th consecutive POST returns 429, rate-limit toast", async ({
  page,
}) => {
  let requestCount = 0;

  await page.route("**/api/contact", async (route) => {
    requestCount += 1;
    if (requestCount >= 6) {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Too many requests. Please try again later.",
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, delivered: false, mode: "dev-log" }),
      });
    }
  });

  await page.goto("/en/contact/");
  await expect(page.locator("form")).toBeVisible();

  // Submit 5 times (each should succeed)
  for (let i = 0; i < 5; i++) {
    await fillFormValid(page);
    await page.locator('button[type="submit"]').click();
    // Wait briefly between submissions
    await page.waitForTimeout(200);
  }

  // 6th submission — should trigger rate-limit toast
  await fillFormValid(page);
  await page.locator('button[type="submit"]').click();

  // Assert: toast with rate-limit message
  await expect(page.getByText("Please wait a bit")).toBeVisible({ timeout: 5000 });
});
