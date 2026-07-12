import { test, expect } from "@playwright/test";

test.describe("home structure (evidence-first layout)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  const localeCopy = {
    en: {
      bridge: "From delivery models to deployable city data.",
      heroAlt: "Shinjuku indoor navigation Revit model",
      mandate:
        "In Tokyo, I work across BIM delivery, geospatial pipelines, and the tooling that connects authored models to operational systems.",
    },
    ja: {
      bridge: "実施設計モデルから、運用できる都市データへ。",
      heroAlt: "新宿屋内ナビゲーションのRevitモデル",
      mandate:
        "東京では、BIMの実務、地理空間データのパイプライン、そして設計モデルを運用システムへつなぐツール開発に取り組んでいます。",
    },
    sv: {
      bridge: "Från leveransmodeller till användbar stadsdata.",
      heroAlt: "Revit-modell för inomhusnavigering i Shinjuku",
      mandate:
        "I Tokyo arbetar jag med BIM-leveranser, geospatiala dataflöden och verktyg som kopplar projekterade modeller till operativa system.",
    },
  } as const;

  for (const [lang, copy] of Object.entries(localeCopy)) {
    test(`${lang} localizes the bridge, hero image, and current mandate`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      await expect(page.locator("[data-selected-work-bridge]")).toHaveText(
        copy.bridge,
      );
      await expect(page.locator(".hero-section img")).toHaveAttribute(
        "alt",
        copy.heroAlt,
      );
      await expect(page.locator("[data-current-mandate]")).toHaveText(
        copy.mandate,
      );
    });
  }

  test("homepage desktop header removes socials without removing other paths", async ({
    page,
  }) => {
    await page.goto("/en/");
    await expect(page.locator('header a[href*="github.com"]')).toHaveCount(0);
    await expect(page.locator('header a[href*="linkedin.com"]')).toHaveCount(0);
    await expect(page.locator('footer a[href*="github.com"]')).toHaveCount(1);

    await page.goto("/en/about/");
    await expect(page.locator('header a[href*="github.com"]')).toHaveCount(1);
    await expect(page.locator('header a[href*="linkedin.com"]')).toHaveCount(1);
  });

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

  test("featured role annotations stay concise on phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const lang of ["en", "ja", "sv"]) {
      await page.goto(`/${lang}/`);
      const roles = page.locator(".project-card .font-mono");
      await expect(roles).toHaveCount(3);

      for (const role of await roles.all()) {
        const text = (await role.textContent())?.trim() ?? "";
        expect(text).not.toMatch(/[—→]/);
        expect(text.length).toBeLessThanOrEqual(50);
        const lines = await role.evaluate((element) => {
          const style = getComputedStyle(element);
          return Math.round(
            element.getBoundingClientRect().height /
              parseFloat(style.lineHeight),
          );
        });
        expect(lines).toBeLessThanOrEqual(2);
      }
    }
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
        imgs.map((img) => {
          const el = img as HTMLImageElement;
          return el.currentSrc || el.src;
        }),
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
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("route kicker is visible on phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/");
    await expect(page.locator("main .eyebrow")).toBeVisible();
  });
});
