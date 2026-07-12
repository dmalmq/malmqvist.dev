import { test, expect, type Page } from "@playwright/test";

const languages = ["en", "ja", "sv"] as const;
const projectSlugs = [
  "3d-cesium-viewer",
  "ersta-sjukhus",
  "imdf-converter",
  "revit-geopackage",
  "shinjuku-nav",
] as const;
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const;

async function expectPeerGap(page: Page, selector: string) {
  const groups = page.locator(selector);
  expect(await groups.count()).toBeGreaterThan(0);

  for (const group of await groups.all()) {
    const result = await group.evaluate((element) => {
      const children = [...element.children].filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      const style = getComputedStyle(element);
      const gap = Math.min(
        parseFloat(style.rowGap),
        parseFloat(style.columnGap),
      );
      const overlaps = children.some((child, index) => {
        const a = child.getBoundingClientRect();
        return children.slice(index + 1).some((other) => {
          const b = other.getBoundingClientRect();
          return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
          );
        });
      });
      return { gap, overlaps };
    });
    expect(result.gap).toBeGreaterThanOrEqual(32);
    expect(result.overlaps).toBe(false);
  }
}

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const lang of languages) {
      test(`${lang} project index separates cards`, async ({ page }) => {
        await page.goto(`/${lang}/projects/`);
        await expectPeerGap(page, "[data-project-grid]");
      });

      for (const slug of projectSlugs) {
        test(`${lang}/${slug} separates detail cards`, async ({ page }) => {
          await page.goto(`/${lang}/projects/${slug}/`);
          await expectPeerGap(page, "[data-project-overview-grid]");
          await expectPeerGap(page, "[data-project-sidebar]");
          await expectPeerGap(page, "[data-related-project-grid]");
        });
      }
    }
  });
}
