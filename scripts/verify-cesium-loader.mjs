/**
 * Rerunnable check for the click-to-load Cesium bootstrap.
 * A failed CDN inject must not block a later Load retry.
 * Runs against a minimal DOM stub: no network, no browser, no Cesium download.
 */
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outFile = path.join(tmpdir(), `cesium-loader-${Date.now()}.mjs`);

await build({
  entryPoints: [path.join(root, "src/lib/loadCesium.ts")],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "neutral",
  logLevel: "silent",
});

class StubElement {
  constructor(tag) {
    this.tag = tag;
    this.id = "";
    this.listeners = {};
    this.onload = null;
    this.onerror = null;
  }
  addEventListener(type, fn) {
    (this.listeners[type] ??= []).push(fn);
  }
  fire(type) {
    if (type === "load") this.onload?.();
    if (type === "error") this.onerror?.();
    for (const fn of this.listeners[type] ?? []) fn();
  }
  remove() {
    byId.delete(this.id);
  }
}

const byId = new Map();
const injected = [];

globalThis.document = {
  getElementById: (id) => byId.get(id) ?? null,
  createElement: (tag) => new StubElement(tag),
  head: {
    appendChild: (el) => {
      byId.set(el.id, el);
      if (el.tag === "script") injected.push(el);
      return el;
    },
  },
};
globalThis.window = globalThis;

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function resetDom() {
  byId.clear();
  injected.length = 0;
  delete globalThis.Cesium;
}

async function freshLoader(tag) {
  const mod = await import(`${pathToFileURL(outFile).href}?${tag}`);
  return mod.loadCesium;
}

function settle(promise, ms = 250) {
  return Promise.race([
    promise.then(
      () => "resolved",
      (error) => `rejected:${error.message}`,
    ),
    new Promise((resolve) => setTimeout(() => resolve("pending"), ms)),
  ]);
}

resetDom();
const loadAfterCdnError = await freshLoader("cdn-error");
const firstAttempt = settle(loadAfterCdnError());
injected.at(-1).fire("error");
assert(
  (await firstAttempt) === "rejected:Failed to load CesiumJS",
  "a CDN error must reject the load",
);
assert(!byId.has("cesium-js"), "a failed inject must not leave its script in the DOM");

injected.length = 0;
const retry = settle(loadAfterCdnError());
assert(injected.length === 1, "a retry must inject a fresh script");
globalThis.Cesium = { stub: true };
injected.at(-1).fire("load");
assert((await retry) === "resolved", "a retry after a failed inject must settle");

resetDom();
const loadWithoutGlobal = await freshLoader("no-global");
const missingGlobal = settle(loadWithoutGlobal());
injected.at(-1).fire("load");
assert(
  (await missingGlobal) === "rejected:CesiumJS loaded without a global",
  "a script that loads without window.Cesium must reject",
);
assert(
  !byId.has("cesium-js"),
  "a script that loads without the global must not block a retry",
);

await rm(outFile, { force: true });
console.log("cesium loader checks passed");
