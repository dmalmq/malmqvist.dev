const CESIUM_VERSION = "1.134.0";
const CESIUM_BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`;

type CesiumNamespace = typeof window & { Cesium?: any; CESIUM_BASE_URL?: string };

let loading: Promise<any> | null = null;

function injectStylesheet(href: string): void {
  const id = "cesium-widgets-css";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function injectScript(src: string): Promise<void> {
  const id = "cesium-js";
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    if ((window as CesiumNamespace).Cesium) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load CesiumJS")), {
        once: true,
      });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load CesiumJS"));
    document.head.appendChild(script);
  });
}

/**
 * Load CesiumJS from a CDN only after the user asks for the demo.
 * Does not run on first paint.
 */
export function loadCesium(): Promise<any> {
  const existing = (window as CesiumNamespace).Cesium;
  if (existing) return Promise.resolve(existing);
  if (loading) return loading;

  loading = (async () => {
    (window as CesiumNamespace).CESIUM_BASE_URL = CESIUM_BASE;
    injectStylesheet(`${CESIUM_BASE}Widgets/widgets.css`);
    await injectScript(`${CESIUM_BASE}Cesium.js`);
    const Cesium = (window as CesiumNamespace).Cesium;
    if (!Cesium) throw new Error("CesiumJS loaded without a global");
    return Cesium;
  })();

  return loading.catch((error) => {
    loading = null;
    throw error;
  });
}

export const PUBLIC_SAMPLE_TILESET =
  "/demos/3d-tiles-viewer/synthetic-indoor/tileset.json?v=3";
