/**
 * Rerunnable check for the dataset selector in CesiumTilesetDemo.
 * Drives the real React control in jsdom with a stubbed Cesium global:
 * no CDN download, no WebGL, no network beyond files under public/.
 *
 * What it pins down:
 * - Cesium does not start on first paint.
 * - A local folder pick installs the blob intercept, and every exit from that
 *   state (sample switch, failed switch, replacement, unmount) uninstalls it.
 * - Switching back to the public sample commits only on success, fetches the
 *   same-origin sample rather than a local blob, and revokes local blobs after
 *   the live tileset has left the scene.
 */
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const sampleDir = path.join(publicDir, "demos/3d-tiles-viewer/synthetic-indoor");
const SAMPLE_VENUE = "/demos/3d-tiles-viewer/synthetic-indoor/venue.json";

const stamp = Date.now();
const stubFile = path.join(tmpdir(), `dataset-switch-cesium-${stamp}.js`);
const outFile = path.join(tmpdir(), `dataset-switch-${stamp}.mjs`);

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

// The demo imports "./loadCesium"; the real module injects a CDN <script>.
// Swap it for a resolved stub while keeping the sample URL the real constant.
await writeFile(
  stubFile,
  `export { PUBLIC_SAMPLE_VENUE } from ${JSON.stringify(path.join(root, "src/lib/loadCesium.ts"))};
export function loadCesium() {
  globalThis.__cesiumLoads = (globalThis.__cesiumLoads ?? 0) + 1;
  if (globalThis.__cesiumFails) {
    return Promise.reject(new Error("Failed to load CesiumJS"));
  }
  return Promise.resolve(globalThis.__cesium);
}
`,
);

await build({
  stdin: {
    contents: `import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import Demo from ${JSON.stringify(path.join(root, "src/components/CesiumTilesetDemo.tsx"))};
export { act, createElement, createRoot, Demo };
`,
    resolveDir: root,
    sourcefile: "dataset-switch-entry.jsx",
    loader: "jsx",
  },
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "browser",
  jsx: "automatic",
  logLevel: "silent",
  define: { "process.env.NODE_ENV": '"development"' },
  plugins: [
    {
      name: "stub-load-cesium",
      setup(builder) {
        builder.onResolve({ filter: /(^|\/)loadCesium$/ }, () => ({ path: stubFile }));
      },
    },
  ],
});

const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
  url: "https://example.test/",
  pretendToBeVisual: true,
});

// Keep Node's fetch, URL, Blob, File and DOMException: blob URLs minted by
// localTileset must stay fetchable by the same runtime that minted them.
for (const key of [
  "window",
  "document",
  "navigator",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "Node",
  "Element",
  "HTMLElement",
  "HTMLInputElement",
  "SVGElement",
  "DocumentFragment",
  "Event",
  "CustomEvent",
  "MouseEvent",
  "KeyboardEvent",
  "MutationObserver",
]) {
  globalThis[key] = dom.window[key];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const requested = [];
const nodeFetch = globalThis.fetch;
const baseFetch = async (input, init) => {
  const href =
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  requested.push(href);
  if (href.startsWith("blob:") || href.startsWith("data:")) {
    return nodeFetch(input, init);
  }
  const clean = href.split("#")[0].split("?")[0];
  const origin = dom.window.location.origin;
  const samePath = clean.startsWith(origin) ? clean.slice(origin.length) : clean;
  if (!samePath.startsWith("/")) {
    throw new TypeError(`unexpected cross-origin fetch: ${href}`);
  }
  if (globalThis.__sampleOffline) {
    return new Response("gone", { status: 503 });
  }
  try {
    return new Response(await readFile(path.join(publicDir, samePath)), { status: 200 });
  } catch {
    return new Response("not found", { status: 404 });
  }
};
globalThis.fetch = baseFetch;

const events = [];
const realRevoke = URL.revokeObjectURL.bind(URL);
URL.revokeObjectURL = (url) => {
  events.push(`revoke ${url}`);
  realRevoke(url);
};

const tilesetUrls = [];
let viewerCount = 0;

class StubHandler {
  setInputAction() {}
  destroy() {}
}

function makeViewer() {
  viewerCount += 1;
  const viewer = {
    destroyed: false,
    scene: {
      globe: {},
      backgroundColor: null,
      sun: { show: true },
      moon: { show: true },
      fog: { enabled: true },
      skyAtmosphere: { show: true },
      skyBox: { show: true },
      screenSpaceCameraController: {},
      light: null,
      canvas: {},
      primitives: {
        items: [],
        add(tileset) {
          this.items.push(tileset);
          events.push(`add ${tileset.url}`);
        },
        remove(tileset) {
          this.items = this.items.filter((item) => item !== tileset);
          events.push(`remove ${tileset.url}`);
        },
      },
      requestRender() {},
      pick: () => undefined,
    },
    dataSources: { add: async () => {}, remove: () => {} },
    creditDisplay: { container: { style: {} } },
    zoomTo: async () => {},
    isDestroyed: () => viewer.destroyed,
    destroy: () => {
      viewer.destroyed = true;
    },
  };
  return viewer;
}

globalThis.__cesium = {
  Ion: { defaultAccessToken: "token" },
  Viewer: function Viewer() {
    return makeViewer();
  },
  Color: { fromCssColorString: () => ({}) },
  DirectionalLight: function DirectionalLight() {},
  Cartesian3: function Cartesian3() {},
  Cartographic: { fromCartesian: () => ({ height: 0 }) },
  Cesium3DTileset: {
    fromUrl: async (url) => {
      tilesetUrls.push(url);
      return { url, show: true, boundingSphere: { center: {}, radius: 10 } };
    },
  },
  GeoJsonDataSource: { load: async () => ({ entities: { values: [] } }) },
  ScreenSpaceEventHandler: StubHandler,
  ScreenSpaceEventType: { LEFT_CLICK: 0 },
  HeadingPitchRange: function HeadingPitchRange() {},
  Math: { toRadians: (deg) => deg },
};

function fileHandle(abs, name) {
  return {
    kind: "file",
    name,
    getFile: async () => new File([await readFile(abs)], name),
  };
}

function directoryHandle(abs, name) {
  return {
    kind: "directory",
    name,
    async *entries() {
      for (const entry of await readdir(abs, { withFileTypes: true })) {
        const child = path.join(abs, entry.name);
        yield [
          entry.name,
          entry.isDirectory() ? directoryHandle(child, entry.name) : fileHandle(child, entry.name),
        ];
      }
    },
  };
}

dom.window.showDirectoryPicker = async () => directoryHandle(sampleDir, "picked");

const { act, createElement, createRoot, Demo } = await import(pathToFileURL(outFile).href);

const container = dom.window.document.getElementById("root");
const reactRoot = createRoot(container);
await act(async () => {
  reactRoot.render(createElement(Demo, { lang: "en" }));
});

const radio = (value) =>
  dom.window.document.querySelector(`input[name="tileset-dataset"][value="${value}"]`);
const loadButton = () =>
  [...dom.window.document.querySelectorAll("button")].find(
    (node) => node.textContent === "Load 3D viewer",
  );
const bodyText = () => dom.window.document.body.textContent ?? "";
const click = async (node) => {
  assert(node, "clicked control must exist");
  await act(async () => {
    node.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
};
// Folder reads and blob rewrites are real async work, so a click settles over
// several turns rather than inside act().
const until = async (predicate, label) => {
  for (let turn = 0; turn < 400; turn += 1) {
    if (predicate()) return;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
  }
  throw new Error(`timed out waiting for: ${label}`);
};
const idle = () => !bodyText().includes("Loading viewer…");
const sampleBase = `${dom.window.location.origin}/demos/3d-tiles-viewer/synthetic-indoor/`;

assert(viewerCount === 0, "first paint must not construct a Cesium viewer");
assert(!globalThis.__cesiumLoads, "first paint must not load CesiumJS");
assert(radio("sample").checked, "the public sample must be the default dataset");
assert(loadButton(), "the click-to-load control must be on screen");

// A failed CesiumJS inject must stay retryable from the UI.
globalThis.__cesiumFails = true;
await click(loadButton());
await until(
  () => idle() && bodyText().includes("Failed to load CesiumJS"),
  "the failed inject to report",
);
globalThis.__cesiumFails = false;
assert(viewerCount === 0, "a failed inject must not construct a viewer");
assert(loadButton(), "a failed inject must leave the load control on screen");

await click(loadButton());
await until(
  () => idle() && bodyText().includes("Synthetic indoor sample loaded."),
  "the sample venue to load on the retry",
);
assert(globalThis.__cesiumLoads === 2, "the retry must ask for CesiumJS again");
assert(viewerCount === 1, "the retry must construct exactly one viewer");
assert(
  tilesetUrls.length === 2 && tilesetUrls.every((url) => url.startsWith(sampleBase)),
  "the default dataset must be the same-origin public sample",
);
assert(globalThis.fetch === baseFetch, "a sample-only session must never intercept fetch");

tilesetUrls.length = 0;
await click(radio("local"));
await until(
  () => idle() && bodyText().includes("Local venue loaded in this browser only."),
  "the local venue to finish loading",
);
assert(radio("local").checked, "picking a folder must select the local dataset");
assert(viewerCount === 1, "switching datasets must reuse the viewer");
assert(globalThis.fetch !== baseFetch, "a loaded local folder must install the blob intercept");
assert(
  tilesetUrls.length === 2 && tilesetUrls.every((url) => url.startsWith("blob:")),
  "a local venue must render from blob URLs",
);
const localTilesetUrls = [...tilesetUrls];

// A sample switch that fails must not commit: the local scene keeps its
// intercept and its blobs.
globalThis.__sampleOffline = true;
await click(radio("sample"));
await until(() => idle() && bodyText().includes("Could not"), "the failed sample load to report");
globalThis.__sampleOffline = false;
assert(radio("local").checked, "a failed sample load must leave the local dataset selected");
assert(
  globalThis.fetch !== baseFetch,
  "a failed sample load must put the local intercept back",
);
assert(
  (await fetch(localTilesetUrls[0])).ok,
  "a failed sample load must not revoke the live local blobs",
);
assert(
  !events.some((event) => event.startsWith("revoke ")),
  "a failed sample load must revoke nothing",
);

events.length = 0;
tilesetUrls.length = 0;
const beforeSwitch = requested.length;

await click(radio("sample"));
await until(
  () => idle() && bodyText().includes("Synthetic indoor sample loaded."),
  "the sample venue to finish loading",
);
const duringSwitch = requested.slice(beforeSwitch);

assert(radio("sample").checked, "a successful sample load must commit the radio");
assert(!radio("local").checked, "dataset must not stay local after a successful sample load");
assert(
  globalThis.fetch === baseFetch,
  "switching to the sample must uninstall the local intercept, restoring the original fetch",
);
assert(
  duringSwitch.includes(SAMPLE_VENUE),
  "the sample switch must fetch the same-origin manifest",
);
assert(
  !duringSwitch.some((url) => url.startsWith("blob:")),
  "no request during the sample switch may be answered by a local blob",
);
assert(
  tilesetUrls.length === 2 && tilesetUrls.every((url) => url.startsWith(sampleBase)),
  "sample tilesets must load from the same-origin sample folder",
);
assert(
  !bodyText().includes("Some parts of this bundle could not be loaded."),
  "every sample layer must load once the local intercept is gone",
);
const firstRemove = events.findIndex((event) => event.startsWith("remove blob:"));
const firstRevoke = events.findIndex((event) => event.startsWith("revoke "));
assert(firstRemove >= 0, "the local tileset must leave the scene on a sample switch");
assert(
  firstRevoke > firstRemove,
  "local blobs must be revoked only after the live tileset is gone",
);
for (const url of localTilesetUrls) {
  let stillLive = true;
  try {
    stillLive = (await fetch(url)).ok;
  } catch {
    stillLive = false;
  }
  assert(!stillLive, "a committed sample load must revoke the local blobs");
}
assert(
  bodyText().includes("Synthetic indoor sample loaded."),
  "a committed sample load must report the sample",
);

// Re-pick the same folder, then unmount: teardown must not leave an intercept.
await click(radio("local"));
await until(
  () => idle() && bodyText().includes("Local venue loaded in this browser only."),
  "the remembered folder to reload",
);
assert(radio("local").checked, "the remembered folder must reload on a second local switch");
assert(globalThis.fetch !== baseFetch, "a reloaded local folder must reinstall the intercept");
const repickedUrls = [...tilesetUrls].filter((url) => url.startsWith("blob:"));
assert(repickedUrls.length === 2, "the remembered folder must mint fresh blobs");

await act(async () => {
  reactRoot.unmount();
});
assert(
  globalThis.fetch === baseFetch,
  "unmount must uninstall the local intercept",
);
for (const url of repickedUrls) {
  let stillLive = true;
  try {
    stillLive = (await fetch(url)).ok;
  } catch {
    stillLive = false;
  }
  assert(!stillLive, "unmount must revoke the local blobs");
}

URL.revokeObjectURL = realRevoke;
// pretendToBeVisual keeps a rAF timer alive; without this the process hangs.
dom.window.close();
await rm(outFile, { force: true });
await rm(stubFile, { force: true });
// React 19 schedules through a MessageChannel port that keeps the loop alive.
process.stdout.write("dataset switch checks passed\n", () => process.exit(0));
