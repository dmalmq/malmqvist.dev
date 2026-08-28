import type { CesiumApi } from "./cesiumApi";

const CESIUM_VERSION = "1.134.0";
const CESIUM_BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`;

const SCRIPT_ID = "cesium-js";

type CesiumNamespace = typeof window & {
  Cesium?: CesiumApi;
  CESIUM_BASE_URL?: string;
};

/** A blocked or black-holed CDN never fires load or error; do not wait forever. */
export const CESIUM_INJECT_TIMEOUT_MS = 45_000;

let loading: Promise<CesiumApi> | null = null;
let pending: { script: HTMLScriptElement; promise: Promise<void> } | null = null;

function injectStylesheet(href: string): void {
  const id = "cesium-widgets-css";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function injectScript(src: string, timeoutMs: number): Promise<void> {
  if ((window as CesiumNamespace).Cesium) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID);
  if (pending && existing === pending.script) return pending.promise;
  // Any other #cesium-js tag is one nobody is watching. A tag that already
  // errored never fires load or error again, so attaching listeners to it
  // hangs the retry forever. Replace it instead.
  existing?.remove();

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = src;
  script.async = true;

  const promise = new Promise<void>((resolve, reject) => {
    const settle = (failure?: Error) => {
      clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
      if (pending?.script === script) pending = null;
      if (!failure) {
        resolve();
        return;
      }
      script.remove();
      reject(failure);
    };
    const timer = setTimeout(
      () => settle(new Error("CesiumJS did not load in time")),
      timeoutMs,
    );
    script.onload = () => settle();
    script.onerror = () => settle(new Error("Failed to load CesiumJS"));
  });

  pending = { script, promise };
  document.head.appendChild(script);
  return promise;
}

/**
 * Load CesiumJS from a CDN only after the user asks for the demo.
 * Does not run on first paint.
 */
export function loadCesium(
  timeoutMs: number = CESIUM_INJECT_TIMEOUT_MS,
): Promise<CesiumApi> {
  const existing = (window as CesiumNamespace).Cesium;
  if (existing) return Promise.resolve(existing);
  if (loading) return loading;

  loading = (async () => {
    try {
      (window as CesiumNamespace).CESIUM_BASE_URL = CESIUM_BASE;
      injectStylesheet(`${CESIUM_BASE}Widgets/widgets.css`);
      await injectScript(`${CESIUM_BASE}Cesium.js`, timeoutMs);
      const Cesium = (window as CesiumNamespace).Cesium;
      if (!Cesium) throw new Error("CesiumJS loaded without a global");
      return Cesium;
    } catch (error) {
      document.getElementById(SCRIPT_ID)?.remove();
      pending = null;
      loading = null;
      throw error;
    }
  })();

  return loading;
}

export const PUBLIC_SAMPLE_VENUE =
  "/demos/3d-tiles-viewer/synthetic-indoor/venue.json";
