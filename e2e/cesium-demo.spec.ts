import { test, expect } from "@playwright/test";

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
    await expect(
      page.getByText(/not published on this site yet/i),
    ).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    expect(cesiumRequests).toEqual([]);
    return;
  }

  // If env is set: click and expect iframe (do not require remote manifest)
  await loadBtn.click();
  await expect(page.locator("iframe[title]")).toBeVisible();
});
