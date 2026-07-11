import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";

const viewerHtml = path.join(
  process.cwd(),
  "public/demos/cesium-viewer/viewer.html",
);

test("cesium demo gate shows pending without loading Cesium", async ({
  page,
}) => {
  const cesiumRequests: string[] = [];
  page.on("request", (req) => {
    const u = req.url();
    // Project slug contains "cesium"; ignore document navigations for that page.
    if (req.resourceType() === "document") return;
    if (/cesium|cesium-viewer\/assets/i.test(u)) cesiumRequests.push(u);
  });

  await page.goto("/en/projects/3d-cesium-viewer/");
  await expect(
    page.getByRole("heading", { name: /3D Cesium Viewer/i }),
  ).toBeVisible();
  await expect(page.getByText("Interactive demo", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Published-session 3D Tiles viewer/i }),
  ).toBeVisible();

  const loadBtn = page.getByRole("button", { name: /Load interactive demo/i });
  // Without PUBLIC_CESIUM_DEMO_MANIFEST_URL, button is disabled
  if (await loadBtn.isDisabled()) {
    // Either data pending or missing viewer assets — both keep Cesium unloaded.
    const pending = page.getByText(/not published on this site yet/i);
    const missing = page.getByText(/viewer build is not available/i);
    await expect(pending.or(missing)).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    expect(cesiumRequests).toEqual([]);
    return;
  }

  // If env is set and assets exist: click and expect iframe (do not require remote manifest)
  await loadBtn.click();
  await expect(page.locator("iframe[title]")).toBeVisible();
});

test("cesium demo gate reflects viewer asset availability", async ({ page }) => {
  await page.goto("/en/projects/3d-cesium-viewer/");
  const loadBtn = page.getByRole("button", { name: /Load interactive demo/i });

  if (!existsSync(viewerHtml)) {
    // Missing build: must show missing-assets copy and stay disabled.
    await expect(
      page.getByText(/viewer build is not available/i),
    ).toBeVisible();
    await expect(loadBtn).toBeDisabled();
    await expect(page.locator("iframe")).toHaveCount(0);
    return;
  }

  // Assets present: if no manifest, pending (not missing-assets); button still disabled.
  const manifestConfigured = Boolean(
    process.env.PUBLIC_CESIUM_DEMO_MANIFEST_URL?.trim(),
  );
  if (!manifestConfigured) {
    await expect(
      page.getByText(/not published on this site yet/i),
    ).toBeVisible();
    await expect(
      page.getByText(/viewer build is not available/i),
    ).toHaveCount(0);
    await expect(loadBtn).toBeDisabled();
  } else {
    await expect(loadBtn).toBeEnabled();
  }
});
