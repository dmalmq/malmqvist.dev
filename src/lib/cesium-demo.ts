export type CesiumDemoConfig = {
  type: "cesium-viewer";
  manifestUrl?: string;
  poster?: string;
};

/** Frontmatter wins over env; empty string treated as unset. */
export function resolveCesiumDemoManifestUrl(
  frontmatterUrl?: string,
  envUrl: string | undefined = import.meta.env.PUBLIC_CESIUM_DEMO_MANIFEST_URL,
): string | null {
  const fromFm = frontmatterUrl?.trim();
  if (fromFm) return fromFm;
  const fromEnv = envUrl?.trim();
  if (fromEnv) return fromEnv;
  return null;
}

export function buildViewerIframeSrc(manifestUrl: string): string {
  const base = "/demos/cesium-viewer/viewer.html";
  return `${base}?manifest=${encodeURIComponent(manifestUrl)}`;
}

export const VIEWER_ASSET_INDEX = "/demos/cesium-viewer/viewer.html";
