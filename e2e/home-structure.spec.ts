import { test, expect } from "@playwright/test";

test.describe("home structure (evidence-first layout)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("selected work leads; claims grid is gone", async ({ page }) => {
    await page.goto("/en/");
    // Evidence before biography: Selected Work precedes the About split in DOM order.
    const order = await page.$$eval("section[aria-labelledby]", (sections) =>
      sections.map((s) => s.getAttribute("aria-labelledby")),
    );
    const selected = order.indexOf("selected-work-title");
    const about = order.indexOf("about-split-title");
    expect(selected).toBeGreaterThanOrEqual(0);
    expect(about).toBeGreaterThan(selected);
    expect(order).not.toContain("triptych-title");
  });

  test("section headings render at display scale, not body size", async ({ page }) => {
    await page.goto("/en/");
    const size = await page
      .locator("#selected-work-title")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    // --font-h2 is clamp(2rem, 4vw, 2.75rem): ≥32px on desktop.
    expect(size).toBeGreaterThanOrEqual(32);
  });

  test("each featured project carries a role annotation", async ({ page }) => {
    await page.goto("/en/");
    const roles = page.locator(".project-card .font-mono");
    await expect(roles).toHaveCount(3);
    await expect(roles.first()).toContainText("—");
  });

  test("exactly one deliberate kicker survives (Stockholm → Tokyo)", async ({ page }) => {
    await page.goto("/en/");
    const eyebrows = page.locator("main .eyebrow");
    await expect(eyebrows).toHaveCount(1);
    await expect(eyebrows.first()).toHaveText(/STOCKHOLM → TOKYO/);
  });

  test("belief ladder: practice leads, covers are unique", async ({ page }) => {
    // Normalize cover stems across generated vs source paths so uniqueness is real.
    // e.g. projects__shinjuku-nav-1-optimized-1600w.webp and shinjuku-nav-1-optimized.jpg
    // both become shinjuku-nav-1-optimized.
    const normalizeCoverStem = (url: string) => {
      const basename = url.split("/").pop() ?? url;
      return basename
        .replace(/^(?:[a-z0-9-]+__)+/i, "")
        .replace(/-\d+w(?=\.|$)/, "")
        .replace(/\.[^.]+$/, "");
    };
    expect(
      normalizeCoverStem(
        "/_generated/projects__shinjuku-nav-1-optimized-1600w.webp",
      ),
    ).toBe(
      normalizeCoverStem("/images/projects/shinjuku-nav-1-optimized.jpg"),
    );
    expect(
      normalizeCoverStem(
        "/_generated/projects__shinjuku-nav-1-optimized-1600w.webp",
      ),
    ).toBe("shinjuku-nav-1-optimized");

    await page.goto("/en/");
    // Ladder order: Ersta (practice) → Shinjuku (systems bridge) → GeoPackage (tooling).
    const hrefs = await page.$$eval(".project-card a[href]", (links) =>
      links.map((a) => a.getAttribute("href")),
    );
    expect(hrefs[0]).toContain("/projects/ersta-sjukhus/");
    expect(hrefs[1]).toContain("/projects/shinjuku-nav/");
    expect(hrefs[2]).toContain("/projects/revit-geopackage/");
    // Evidence integrity: no image file may appear twice on the homepage.
    const sources = (
      await page.$$eval("main img", (imgs) =>
        imgs.map((img) => img.currentSrc || img.src),
      )
    ).map(normalizeCoverStem);
    expect(new Set(sources).size).toBe(sources.length);
  });

  test("CTA band offers the resume as a secondary path", async ({ page }) => {
    await page.goto("/en/");
    const band = page.locator(".cta-band");
    await expect(band.getByRole("link", { name: "Discuss a role" })).toBeVisible();
    await expect(band.locator('a[href="/cv/resume-en.pdf"]')).toBeAttached();
    // Social links live in header and footer only — not a third cluster here.
    await expect(band.locator('a[href*="github.com"]')).toHaveCount(0);
  });

  test("first tab stop is a skip link that targets main content", async ({ page }) => {
    await page.goto("/en/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", "#main-content");
    await expect(focused).toBeVisible();
    await expect(page.locator("main#main-content")).toBeAttached();
  });
});
