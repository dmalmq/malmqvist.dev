import { test, expect } from "@playwright/test";

const PHONE = { width: 390, height: 844 };
const IPAD_PORTRAIT = { width: 834, height: 1194 };
const DESKTOP = { width: 1440, height: 900 };

test.describe("bottom navigation (phone)", () => {
  test.use({ viewport: PHONE });

  test("shows the four destinations and no hamburger", async ({ page }) => {
    await page.goto("/en/");
    const bar = page.getByRole("navigation", { name: "Primary", exact: true });
    await expect(bar).toBeVisible();
    for (const label of ["Projects", "Consulting", "About", "Contact"]) {
      await expect(bar.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveCount(0);
  });

  test("navigates and marks the active destination", async ({ page }) => {
    await page.goto("/en/");
    const bar = page.getByRole("navigation", { name: "Primary", exact: true });
    await bar.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/en\/projects\/$/);
    await expect(
      page
        .getByRole("navigation", { name: "Primary", exact: true })
        .getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("More sheet exposes language, theme, and social controls", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: "More" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("button", { name: "EN" })).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Toggle theme" })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "LinkedIn" })).toBeVisible();
  });

  test("bottom bar does not obscure the footer", async ({ page }) => {
    await page.goto("/en/");
    const copyright = page.getByText(/© \d{4} Daniel Malmqvist/);
    await copyright.scrollIntoViewIfNeeded();
    const footerBox = await copyright.boundingBox();
    const barBox = await page
      .getByRole("navigation", { name: "Primary", exact: true })
      .boundingBox();
    expect(footerBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(barBox!.y + 1);
  });
});

test.describe("bottom navigation (iPad portrait)", () => {
  test.use({ viewport: IPAD_PORTRAIT });

  test("uses the bottom bar, not the top pill nav", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeHidden();
  });
});

test.describe("bottom navigation (desktop)", () => {
  test.use({ viewport: DESKTOP });

  test("hides the bottom bar and keeps the top nav", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toBeHidden();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
  });
});

test.describe("bottom navigation (Japanese locale)", () => {
  test.use({ viewport: PHONE });

  test("renders localized destination labels", async ({ page }) => {
    await page.goto("/ja/");
    const bar = page.getByRole("navigation", { name: "Primary", exact: true });
    await expect(bar.getByRole("link", { name: "プロジェクト" })).toBeVisible();
    await expect(bar.getByRole("link", { name: "お問い合わせ" })).toBeVisible();
  });
});
