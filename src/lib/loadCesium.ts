import type { CesiumApi } from "./cesiumApi";

const CESIUM_VERSION = "1.134.0";
const CESIUM_BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`;

const SCRIPT_ID = "cesium-js";

type CesiumNamespace = typeof window & {
  Cesium?: CesiumApi;
  CESIUM_BASE_URL?: string;
};

let loading: Promise<CesiumApi> | null = null;

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
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    if ((window as CesiumNamespace).Cesium) return Promise.resolve();
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    existing.addEventListener("load", () => resolve(), { once: true });
    existing.addEventListener("error", () => reject(new Error("Failed to load CesiumJS")), {
      once: true,
    });
    return promise;
  }
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = src;
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error("Failed to load CesiumJS"));
  document.head.appendChild(script);
  return promise;
}

/**
 * Load CesiumJS from a CDN only after the user asks for the demo.
 * Does not run on first paint.
 */
export function loadCesium(): Promise<CesiumApi> {
  const existing = (window as CesiumNamespace).Cesium;
  if (existing) return Promise.resolve(existing);
  if (loading) return loading;

  loading = (async () => {
    try {
      (window as CesiumNamespace).CESIUM_BASE_URL = CESIUM_BASE;
      injectStylesheet(`${CESIUM_BASE}Widgets/widgets.css`);
      await injectScript(`${CESIUM_BASE}Cesium.js`);
      const Cesium = (window as CesiumNamespace).Cesium;
      if (!Cesium) throw new Error("CesiumJS loaded without a global");
      return Cesium;
    } catch (error) {
      document.getElementById(SCRIPT_ID)?.remove();
      loading = null;
      throw error;
    }
  })();

  return loading;
}

export const PUBLIC_SAMPLE_VENUE =
  "/demos/3d-tiles-viewer/synthetic-indoor/venue.json";
