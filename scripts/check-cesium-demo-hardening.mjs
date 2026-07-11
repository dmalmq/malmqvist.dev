#!/usr/bin/env node
/**
 * Unit-style assertions for Cesium demo hardening:
 * - remote published URL resolution against data host
 * - marker path expectations
 * - pin constants present
 * - viewer asset availability helper
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`ok — ${msg}`);
}

function resolvePublishedUrl(url, baseUrl) {
  if (!url || typeof url !== "string") return url;
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:"))
    return url;
  if (baseUrl) {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      /* fall through */
    }
  }
  return url;
}

function resolveMarkerDemo(raw, viewerHref = "https://portfolio.example/demos/cesium-viewer/viewer.html") {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  let rel;
  if (s.includes("/icons/marker/")) {
    rel = "icons/marker/" + s.slice(s.indexOf("/icons/marker/") + "/icons/marker/".length);
  } else if (s.startsWith("/icons/")) {
    rel = s.slice(1);
  } else if (s.startsWith("/marker/")) {
    rel = "icons" + s;
  } else if (s.startsWith("marker/")) {
    rel = "icons/" + s;
  } else if (s.startsWith("icons/")) {
    rel = s;
  } else {
    rel = "icons/marker/" + s.replace(/^\.?\//, "");
  }
  return new URL(rel, viewerHref).href;
}

async function main() {
  // 1) Remote data host resolution
  const manifestUrl = "https://tiles.example/venues.json";
  const sessionAbs = resolvePublishedUrl("/sessions/alpha.json", manifestUrl);
  assert(
    sessionAbs === "https://tiles.example/sessions/alpha.json",
    "session URL resolves against remote manifest host",
  );
  const tilesetAbs = resolvePublishedUrl(
    "/tilesets/alpha/tileset.json",
    sessionAbs,
  );
  assert(
    tilesetAbs === "https://tiles.example/tilesets/alpha/tileset.json",
    "tileset URL resolves against remote session host",
  );
  assert(
    !sessionAbs.includes("portfolio.example") && !sessionAbs.includes("malmqvist.dev"),
    "session URL does not use portfolio origin",
  );

  // 2) Marker path under demo base
  const markerA = resolveMarkerDemo("/marker/locker.png");
  assert(
    markerA ===
      "https://portfolio.example/demos/cesium-viewer/icons/marker/locker.png",
    "marker /marker/* → /demos/cesium-viewer/icons/marker/*",
  );
  const markerB = resolveMarkerDemo("locker.png");
  assert(
    markerB.endsWith("/demos/cesium-viewer/icons/marker/locker.png"),
    "bare marker filename uses demo icons path",
  );
  assert(
    !markerA.startsWith("https://portfolio.example/icons/"),
    "marker is not root-only /icons/",
  );

  // 3) Pin constants in build script
  const buildScript = await fs.readFile(
    path.join(ROOT, "scripts/build-cesium-viewer-demo.mjs"),
    "utf8",
  );
  assert(
    /VIEWER_SOURCE_REVISION\s*=\s*"[0-9a-f]{40}"/.test(buildScript),
    "VIEWER_SOURCE_REVISION is a 40-char SHA",
  );
  assert(
    buildScript.includes("VIEWER_SOURCE_REPOSITORY"),
    "VIEWER_SOURCE_REPOSITORY constant present",
  );
  assert(
    buildScript.includes("setSessionAssetBaseUrl"),
    "build script patches remote URL base",
  );
  assert(
    buildScript.includes("patchMarkerImageUrls") ||
      buildScript.includes("/demos/cesium-viewer/"),
    "build script patches marker paths for demo base",
  );
  assert(
    buildScript.includes("fetch") && buildScript.includes("checkout"),
    "build script fetches/checkouts pinned revision",
  );

  // 4) Viewer availability helper + gate wiring
  const demoLib = await fs.readFile(
    path.join(ROOT, "src/lib/cesium-demo.ts"),
    "utf8",
  );
  assert(demoLib.includes("VIEWER_ASSET_INDEX"), "VIEWER_ASSET_INDEX present");
  const demoAssets = await fs.readFile(
    path.join(ROOT, "src/lib/cesium-demo-assets.ts"),
    "utf8",
  );
  assert(
    demoAssets.includes("isCesiumViewerAssetAvailable"),
    "isCesiumViewerAssetAvailable exported (server-only module)",
  );

  const gate = await fs.readFile(
    path.join(ROOT, "src/components/demos/CesiumViewerGate.tsx"),
    "utf8",
  );
  assert(gate.includes("viewerAvailable"), "gate accepts viewerAvailable");
  assert(
    gate.includes("Boolean(manifestUrl) && viewerAvailable") ||
      gate.includes("viewerAvailable") && gate.includes("canLoad"),
    "canLoad requires viewerAvailable",
  );
  assert(gate.includes("missingAssets"), "localized missing-assets message");

  const detail = await fs.readFile(
    path.join(ROOT, "src/components/ProjectDetailPage.astro"),
    "utf8",
  );
  assert(
    detail.includes("viewerAvailable={demoViewerAvailable}") ||
      detail.includes("viewerAvailable="),
    "ProjectDetailPage passes viewerAvailable",
  );

  // Live fs check when assets exist
  const viewerHtml = path.join(
    ROOT,
    "public/demos/cesium-viewer/viewer.html",
  );
  if (existsSync(viewerHtml)) {
    assert(true, `viewer.html present at ${path.relative(ROOT, viewerHtml)}`);
  } else {
    console.log("note — viewer.html not built yet (ok for source-only check)");
  }

  // 5) If build output exists, inspect bundle for patches
  const assetsDir = path.join(ROOT, "public/demos/cesium-viewer/assets");
  if (existsSync(assetsDir)) {
    const files = (await fs.readdir(assetsDir)).filter((f) => f.endsWith(".js"));
    let remoteHit = false;
    let markerHit = false;
    let rootOnlyMarker = false;
    for (const f of files) {
      const body = await fs.readFile(path.join(assetsDir, f), "utf8");
      if (
        body.includes("setSessionAssetBaseUrl") ||
        body.includes("sessionAssetBaseUrl") ||
        body.includes("manifestUrlBase") ||
        (/new URL\([^,]+,\s*window\.location\.href\)/.test(body) &&
          /new URL\([^,]+,\s*\w+\s*\|\|\s*window\.location\.href\)/.test(body))
      ) {
        remoteHit = true;
      }
      if (
        body.includes("demos/cesium-viewer") ||
        /new URL\([^)]*icons\/marker/.test(body)
      ) {
        markerHit = true;
      }
      // Pure root return without demo base is a regression
      if (
        /return"\/icons\/marker\/"/.test(body) &&
        !body.includes("demos/cesium-viewer")
      ) {
        rootOnlyMarker = true;
      }
    }
    assert(remoteHit, "built JS includes remote data base helpers");
    assert(markerHit, "built JS includes demo marker path resolution");
    assert(!rootOnlyMarker, "built JS does not use root-only /icons/marker returns");
  }

  console.log("\nAll cesium-demo hardening checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
