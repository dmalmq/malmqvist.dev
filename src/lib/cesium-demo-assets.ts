import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VIEWER_ASSET_INDEX } from "./cesium-demo";

/**
 * Server/build-time check: is the allowlisted viewer build present under public/?
 * Uses VIEWER_ASSET_INDEX → public/demos/cesium-viewer/viewer.html.
 * Must not be imported from client islands (Node fs only).
 */
export function isCesiumViewerAssetAvailable(
  assetIndex: string = VIEWER_ASSET_INDEX,
): boolean {
  const publicRel = assetIndex.replace(/^\//, "");
  try {
    const fromMeta = fileURLToPath(
      new URL(`../../public/${publicRel}`, import.meta.url),
    );
    if (existsSync(fromMeta)) return true;
  } catch {
    /* import.meta.url may not map cleanly in some runtimes */
  }
  return existsSync(path.join(process.cwd(), "public", publicRel));
}
