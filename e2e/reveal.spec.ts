import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const PHONE = { width: 390, height: 844 };

/** Computed opacity of every reveal-managed element on the page. */
async function revealOpacities(page: Page): Promise<string[]> {
  return page.$$eval(".reveal, .scroll-reveal", (els) =>
    els.map((el) => getComputedStyle(el).opacity),
  );
}

test.describe("reveal safety (automation / headless path)", () => {
  test.use({ viewport: PHONE });

  test("all sections are fully visible without any scrolling", async ({ page }) => {
    await page.goto("/en/");
    // No scroll, no waiting on IntersectionObserver: content must already be legible.
    const opacities = await revealOpacities(page);
    expect(opacities.length).toBeGreaterThan(0);
    for (const opacity of opacities) expect(opacity).toBe("1");
  });
});

test.describe("reveal safety (JavaScript disabled)", () => {
  test.use({ viewport: PHONE, javaScriptEnabled: false });

  test("server HTML never hides content", async ({ page }) => {
    await page.goto("/en/");
    const opacities = await revealOpacities(page);
    expect(opacities.length).toBeGreaterThan(0);
    for (const opacity of opacities) expect(opacity).toBe("1");
  });
});

test.describe("reveal enhancement (real-browser path)", () => {
  test.use({ viewport: PHONE });

  test.beforeEach(async ({ page }) => {
    // Impersonate a non-automated browser so the motion path activates.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
  });

  test("above-fold hero is never hidden; below-fold content reveals on scroll", async ({ page }) => {
    await page.goto("/en/");

    // Hero (first .reveal) must be visible immediately — no entrance flash.
    const hero = page.locator(".reveal").first();
    await expect(hero).toHaveCSS("opacity", "1");

    // The last reveal on the page (About split) starts pending — proof the
    // enhancement engaged — then becomes fully visible once scrolled to.
    const last = page.locator(".reveal").last();
    await expect(last).toHaveClass(/is-pending/);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveCSS("opacity", "1", { timeout: 5000 });
  });

  test("a section taller than the viewport still reveals", async ({ page }) => {
    await page.goto("/en/");
    // Selected Work section is taller than 80% of a phone viewport; the old
    // 0.8 threshold could never fire for it. Scroll through and require visibility.
    const selected = page.locator("#selected-work-title");
    await selected.scrollIntoViewIfNeeded();
    const wrapper = selected.locator("xpath=ancestor-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' reveal ')]");
    await expect(wrapper).toHaveCSS("opacity", "1", { timeout: 5000 });
  });
});

test.describe("reveal failsafe (broken IntersectionObserver)", () => {
  test.use({ viewport: PHONE });

  test("pending content force-reveals within the failsafe window", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      // IO exists but never reports intersections.
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return []; }
      } as unknown as typeof IntersectionObserver;
    });
    await page.goto("/en/");
    const last = page.locator(".reveal").last();
    await expect(last).toHaveClass(/is-pending/); // enhancement engaged, IO is dead
    // Wait for the hide transition to settle — otherwise opacity is still 1
    // from the progressive-enhancement initial paint and the assertion is a false green.
    await expect(last).toHaveCSS("opacity", "0", { timeout: 2000 });
    await expect(last).toHaveCSS("opacity", "1", { timeout: 7000 }); // failsafe cleared it
  });
});
