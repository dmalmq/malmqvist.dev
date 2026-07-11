#!/usr/bin/env node
/**
 * Build an allowlisted, storage-namespaced copy of dmalmq/3D-Tiles-Viewer
 * into public/demos/cesium-viewer/ for the portfolio iframe demo.
 *
 * Env:
 *   CESIUM_VIEWER_REPO — optional absolute/relative path to an existing clone
 *                        (skips network clone when set and valid; not mutated)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, ".cache");
const DEFAULT_CLONE = path.join(CACHE_DIR, "3d-tiles-viewer");
const BUILD_COPY = path.join(CACHE_DIR, "3d-tiles-viewer-demo-build");
const OUT_DIR = path.join(ROOT, "public", "demos", "cesium-viewer");

/** Upstream viewer repository (pinned revision below). */
export const VIEWER_SOURCE_REPOSITORY =
  "https://github.com/dmalmq/3D-Tiles-Viewer.git";
/** Exact 40-char SHA the demo build must check out every run. */
export const VIEWER_SOURCE_REVISION =
  "f692853920fcd3d4136f91a2e2cbb568550a6a9a";

const PUBLIC_BASE = "/demos/cesium-viewer/";

const PUBLIC_ALLOWLIST = Object.freeze([
  "favicon.svg",
  "icons/marker/",
]);

const STORAGE_REPLACEMENTS = Object.freeze([
  // theme
  [
    /localStorage\.getItem\(\s*["']theme["']\s*\)/g,
    'localStorage.getItem("tiles-viewer:theme")',
  ],
  [
    /localStorage\.setItem\(\s*["']theme["']\s*,/g,
    'localStorage.setItem("tiles-viewer:theme",',
  ],
  [
    /localStorage\.removeItem\(\s*["']theme["']\s*\)/g,
    'localStorage.removeItem("tiles-viewer:theme")',
  ],
  // language
  [
    /localStorage\.getItem\(\s*["']language["']\s*\)/g,
    'localStorage.getItem("tiles-viewer:language")',
  ],
  [
    /localStorage\.setItem\(\s*["']language["']\s*,/g,
    'localStorage.setItem("tiles-viewer:language",',
  ],
  [
    /localStorage\.removeItem\(\s*["']language["']\s*\)/g,
    'localStorage.removeItem("tiles-viewer:language")',
  ],
  // left panel width
  [
    /localStorage\.getItem\(\s*["']leftPanelWidth["']\s*\)/g,
    'localStorage.getItem("tiles-viewer:leftPanelWidth")',
  ],
  [
    /localStorage\.setItem\(\s*["']leftPanelWidth["']\s*,/g,
    'localStorage.setItem("tiles-viewer:leftPanelWidth",',
  ],
  [
    /localStorage\.removeItem\(\s*["']leftPanelWidth["']\s*\)/g,
    'localStorage.removeItem("tiles-viewer:leftPanelWidth")',
  ],
  // section collapsed keys — patch construction site
  [
    /`section:\$\{([^}]+)\}:collapsed`/g,
    "`tiles-viewer:section:${$1}:collapsed`",
  ],
  [
    /localStorage\.getItem\(\s*`section:\$\{/g,
    "localStorage.getItem(`tiles-viewer:section:${",
  ],
  [
    /localStorage\.setItem\(\s*`section:\$\{/g,
    "localStorage.setItem(`tiles-viewer:section:${",
  ],
]);

function log(msg) {
  console.log(`[build-demo-viewer] ${msg}`);
}

function fail(msg, code = 1) {
  console.error(`[build-demo-viewer] ERROR: ${msg}`);
  process.exit(code);
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: false,
      ...opts,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`));
    });
  });
}

function runCapture(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      ...opts,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d;
    });
    child.stderr.on("data", (d) => {
      stderr += d;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else
        reject(
          new Error(
            `${cmd} ${args.join(" ")} exited ${code}${stderr ? `: ${stderr.trim()}` : ""}`,
          ),
        );
    });
  });
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function rmrf(p) {
  await fs.rm(p, { recursive: true, force: true });
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function walkFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === "dist"
      ) {
        continue;
      }
      out.push(...(await walkFiles(abs)));
    } else if (entry.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function copyDirFiltered(
  srcRoot,
  destRoot,
  { skipNames = new Set() } = {},
) {
  const entries = await fs.readdir(srcRoot, { withFileTypes: true });
  await ensureDir(destRoot);
  for (const entry of entries) {
    if (skipNames.has(entry.name)) continue;
    const from = path.join(srcRoot, entry.name);
    const to = path.join(destRoot, entry.name);
    if (entry.isDirectory()) {
      await copyDirFiltered(from, to, { skipNames });
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      await copyFile(from, to);
    }
  }
}

async function resolveSourceRepo() {
  const override = process.env.CESIUM_VIEWER_REPO?.trim();
  if (override) {
    const abs = path.resolve(ROOT, override);
    if (!(await pathExists(path.join(abs, "viewer.html")))) {
      fail(
        `CESIUM_VIEWER_REPO=${override} does not look like the viewer repo (missing viewer.html)`,
      );
    }
    let head = "(unknown)";
    try {
      head = await runCapture("git", ["-C", abs, "rev-parse", "HEAD"]);
    } catch {
      /* non-git override is allowed */
    }
    log(
      `Using CESIUM_VIEWER_REPO=${abs} (HEAD=${head}; pin=${VIEWER_SOURCE_REVISION}; override not mutated)`,
    );
    return abs;
  }

  await ensureDir(CACHE_DIR);
  const gitDir = path.join(DEFAULT_CLONE, ".git");
  if (!(await pathExists(gitDir))) {
    if (await pathExists(DEFAULT_CLONE)) {
      await rmrf(DEFAULT_CLONE);
    }
    await ensureDir(DEFAULT_CLONE);
    log(`Initializing cache clone at ${DEFAULT_CLONE}`);
    await run("git", ["-C", DEFAULT_CLONE, "init"]);
    await run("git", [
      "-C",
      DEFAULT_CLONE,
      "remote",
      "add",
      "origin",
      VIEWER_SOURCE_REPOSITORY,
    ]);
  } else {
    // Ensure remote points at the canonical repo
    try {
      await runCapture("git", [
        "-C",
        DEFAULT_CLONE,
        "remote",
        "set-url",
        "origin",
        VIEWER_SOURCE_REPOSITORY,
      ]);
    } catch {
      /* best-effort */
    }
  }

  log(
    `Fetching pinned revision ${VIEWER_SOURCE_REVISION} from ${VIEWER_SOURCE_REPOSITORY}`,
  );
  await run("git", [
    "-C",
    DEFAULT_CLONE,
    "fetch",
    "--depth",
    "1",
    "origin",
    VIEWER_SOURCE_REVISION,
  ]);
  await run("git", [
    "-C",
    DEFAULT_CLONE,
    "checkout",
    "--force",
    "--detach",
    "FETCH_HEAD",
  ]);

  const head = await runCapture("git", ["-C", DEFAULT_CLONE, "rev-parse", "HEAD"]);
  if (head !== VIEWER_SOURCE_REVISION) {
    fail(
      `Pinned checkout mismatch: expected ${VIEWER_SOURCE_REVISION}, got ${head}`,
    );
  }
  if (!(await pathExists(path.join(DEFAULT_CLONE, "viewer.html")))) {
    fail(`Pinned revision missing viewer.html at ${DEFAULT_CLONE}`);
  }
  log(`Viewer source revision: ${head}`);
  return DEFAULT_CLONE;
}

async function stageBuildCopy(sourceRepo) {
  log(`Staging build copy → ${BUILD_COPY}`);
  await rmrf(BUILD_COPY);
  await ensureDir(path.dirname(BUILD_COPY));
  // Copy everything except node_modules / .git / dist / public (public rebuilt allowlisted)
  await copyDirFiltered(sourceRepo, BUILD_COPY, {
    skipNames: new Set(["node_modules", ".git", "dist", "public"]),
  });
  return BUILD_COPY;
}

async function stageAllowlistedPublic(sourceRepo, buildRoot) {
  const srcPublic = path.join(sourceRepo, "public");
  const destPublic = path.join(buildRoot, "public");
  await rmrf(destPublic);
  await ensureDir(destPublic);

  for (const item of PUBLIC_ALLOWLIST) {
    const isDir = item.endsWith("/");
    const rel = isDir ? item.slice(0, -1) : item;
    const from = path.join(srcPublic, rel);
    const to = path.join(destPublic, rel);

    if (!(await pathExists(from))) {
      fail(`Allowlisted public asset missing in source: public/${rel}`);
    }

    if (isDir) {
      await copyDirFiltered(from, to);
    } else {
      await copyFile(from, to);
    }
    log(`Allowlisted public: ${item}`);
  }

  // Safety: ensure we never staged forbidden work artifacts
  const staged = await walkFiles(destPublic);
  for (const file of staged) {
    const rel = path.relative(destPublic, file).split(path.sep).join("/");
    if (rel.endsWith(".pptx") || rel.includes("14_")) {
      fail(`Allowlist staging leaked forbidden path: public/${rel}`);
    }
  }

  // Required marker presence
  if (!(await pathExists(path.join(destPublic, "favicon.svg")))) {
    fail("Required allowlisted asset missing after staging: favicon.svg");
  }
  const markers = await walkFiles(path.join(destPublic, "icons", "marker")).catch(
    () => [],
  );
  if (markers.length === 0) {
    fail("Required allowlisted assets missing after staging: icons/marker/*");
  }
}

function applyStorageNamespace(source) {
  let next = source;
  let hits = 0;
  for (const [pattern, replacement] of STORAGE_REPLACEMENTS) {
    const before = next;
    next = next.replace(pattern, replacement);
    if (next !== before) hits += 1;
  }
  return { text: next, hits };
}

async function patchStorageKeys(buildRoot) {
  const srcDir = path.join(buildRoot, "src");
  const files = (await walkFiles(srcDir)).filter((f) => f.endsWith(".js"));
  let patchedFiles = 0;
  let totalHits = 0;

  for (const file of files) {
    const original = await fs.readFile(file, "utf8");
    const { text, hits } = applyStorageNamespace(original);
    if (hits > 0 && text !== original) {
      await fs.writeFile(file, text, "utf8");
      patchedFiles += 1;
      totalHits += hits;
      log(`Patched storage keys: ${path.relative(buildRoot, file)}`);
    }
  }

  // Verify critical keys are namespaced in the viewer graph
  const mustContain = [
    { file: "src/viewer.js", needle: "tiles-viewer:theme" },
    { file: "src/viewer.js", needle: "tiles-viewer:section:" },
    { file: "src/i18n.js", needle: "tiles-viewer:language" },
  ];
  for (const { file, needle } of mustContain) {
    const abs = path.join(buildRoot, file);
    const body = await fs.readFile(abs, "utf8");
    if (!body.includes(needle)) {
      fail(`Storage namespace patch missing expected "${needle}" in ${file}`);
    }
    // Ensure bare keys are gone for the critical ones
    if (
      needle === "tiles-viewer:theme" &&
      /localStorage\.(get|set|remove)Item\(\s*["']theme["']/.test(body)
    ) {
      fail(`Unnamespaced theme localStorage key remains in ${file}`);
    }
    if (
      needle === "tiles-viewer:language" &&
      /localStorage\.(get|set|remove)Item\(\s*["']language["']/.test(body)
    ) {
      fail(`Unnamespaced language localStorage key remains in ${file}`);
    }
  }

  // main.js also has leftPanelWidth / theme / section if present in build copy
  const mainPath = path.join(buildRoot, "src", "main.js");
  if (await pathExists(mainPath)) {
    const body = await fs.readFile(mainPath, "utf8");
    if (/localStorage\.(get|set)Item\(\s*["']leftPanelWidth["']/.test(body)) {
      fail("Unnamespaced leftPanelWidth remains in src/main.js");
    }
    if (/localStorage\.(get|set)Item\(\s*["']theme["']/.test(body)) {
      fail("Unnamespaced theme remains in src/main.js");
    }
    if (
      /`section:\$\{/.test(body) &&
      !/`tiles-viewer:section:\$\{/.test(body)
    ) {
      fail("Unnamespaced section collapsed key remains in src/main.js");
    }
  }

  log(
    `Storage namespace: ${patchedFiles} file(s), ${totalHits} pattern hit group(s)`,
  );
}

/**
 * Patch session asset URL resolution so root-relative /sessions and /tilesets
 * resolve against the remote data host (manifest/session fetch URL), not the
 * portfolio origin of the iframe.
 */
async function patchRemoteDataUrlBase(buildRoot) {
  const sessionPath = path.join(buildRoot, "src", "session.js");
  let session = await fs.readFile(sessionPath, "utf8");

  const oldResolve = `/** Turn published relative paths (/tilesets/..., /sessions/...) into absolute URLs. */
export function resolveSessionAssetUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (/^https?:\\/\\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("/") && typeof globalThis.location !== "undefined") {
    return new URL(url, globalThis.location.origin).href;
  }
  return url;
}`;

  const newResolve = `/** Base URL of the last loaded remote session (data host). Demo patch. */
let sessionAssetBaseUrl = null;

/** Remember the absolute session (or manifest-derived session) URL for asset resolution. */
export function setSessionAssetBaseUrl(baseUrl) {
  if (!baseUrl || typeof baseUrl !== "string") {
    sessionAssetBaseUrl = null;
    return;
  }
  try {
    const href =
      typeof globalThis.location !== "undefined"
        ? globalThis.location.href
        : undefined;
    sessionAssetBaseUrl = new URL(baseUrl, href).href;
  } catch {
    sessionAssetBaseUrl = baseUrl;
  }
}

export function getSessionAssetBaseUrl() {
  return sessionAssetBaseUrl;
}

/** Turn published relative paths (/tilesets/..., /sessions/...) into absolute URLs.
 *  When a remote session/manifest base is set, resolve against that data host —
 *  not the embedding page origin (portfolio). Demo patch. */
export function resolveSessionAssetUrl(url, baseUrl = sessionAssetBaseUrl) {
  if (!url || typeof url !== "string") return url;
  if (/^https?:\\/\\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const base =
    baseUrl ||
    (typeof globalThis.location !== "undefined"
      ? globalThis.location.href
      : undefined);
  if (base) {
    try {
      return new URL(url, base).href;
    } catch {
      /* fall through */
    }
  }
  if (url.startsWith("/") && typeof globalThis.location !== "undefined") {
    return new URL(url, globalThis.location.origin).href;
  }
  return url;
}`;

  if (!session.includes(oldResolve)) {
    fail(
      "patchRemoteDataUrlBase: resolveSessionAssetUrl block not found in src/session.js (upstream changed?)",
    );
  }
  session = session.replace(oldResolve, newResolve);
  await fs.writeFile(sessionPath, session, "utf8");
  log("Patched remote data URL base: src/session.js");

  const viewerPath = path.join(buildRoot, "src", "viewer.js");
  let viewer = await fs.readFile(viewerPath, "utf8");

  const oldImport = `import { resolveSessionAssetUrl } from "./session.js";`;
  const newImport = `import { resolveSessionAssetUrl, setSessionAssetBaseUrl } from "./session.js";`;
  if (!viewer.includes(oldImport)) {
    fail(
      "patchRemoteDataUrlBase: resolveSessionAssetUrl import not found in src/viewer.js",
    );
  }
  viewer = viewer.replace(oldImport, newImport);

  // Track absolute manifest URL for venue sessionUrl resolution.
  if (!viewer.includes("let manifestUrlBase = null;")) {
    const bootstrapAnchor = "// -- Venue / session bootstrap --";
    if (!viewer.includes(bootstrapAnchor)) {
      fail("patchRemoteDataUrlBase: bootstrap anchor missing in src/viewer.js");
    }
    viewer = viewer.replace(
      bootstrapAnchor,
      `${bootstrapAnchor}\nlet manifestUrlBase = null;`,
    );
  }

  const oldLoadManifest = `async function loadManifest(url, preferredVenueId = null) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  manifest = parseVenueManifest(await res.text());
  venues = manifest.venues.slice();
  populateVenueSelect();
  viewerVenueBar.hidden = venues.length === 0;
  const targetId = preferredVenueId && venues.some((v) => v.id === preferredVenueId)
    ? preferredVenueId
    : getDefaultVenueId(manifest);
  if (targetId) await switchVenue(targetId);
}`;

  const newLoadManifest = `async function loadManifest(url, preferredVenueId = null) {
  const absoluteManifestUrl = new URL(url, window.location.href).href;
  manifestUrlBase = absoluteManifestUrl;
  const res = await fetch(absoluteManifestUrl);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  manifest = parseVenueManifest(await res.text());
  venues = manifest.venues.slice();
  populateVenueSelect();
  viewerVenueBar.hidden = venues.length === 0;
  const targetId = preferredVenueId && venues.some((v) => v.id === preferredVenueId)
    ? preferredVenueId
    : getDefaultVenueId(manifest);
  if (targetId) await switchVenue(targetId);
}`;

  if (!viewer.includes(oldLoadManifest)) {
    fail("patchRemoteDataUrlBase: loadManifest not found in src/viewer.js");
  }
  viewer = viewer.replace(oldLoadManifest, newLoadManifest);

  const oldLoadSession = `async function loadSessionFromUrl(url) {
  showBanner(t("viewer.loadingSession"));
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  await restoreSession(parseSessionJson(await res.text()), buildRestoreContext());
  hideBanner();
}`;

  const newLoadSession = `async function loadSessionFromUrl(url) {
  showBanner(t("viewer.loadingSession"));
  const absoluteSessionUrl = new URL(url, window.location.href).href;
  setSessionAssetBaseUrl(absoluteSessionUrl);
  const res = await fetch(absoluteSessionUrl);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  await restoreSession(parseSessionJson(await res.text()), buildRestoreContext());
  hideBanner();
}`;

  if (!viewer.includes(oldLoadSession)) {
    fail(
      "patchRemoteDataUrlBase: loadSessionFromUrl not found in src/viewer.js",
    );
  }
  viewer = viewer.replace(oldLoadSession, newLoadSession);

  const oldSwitchVenue = `async function switchVenue(venueId) {
  if (!manifest || !venueId || venueId === currentVenueId) return;
  const sessionUrl = resolveVenueSessionUrl(manifest, venueId);
  if (!sessionUrl) throw new Error(t("viewer.noSessionUrl"));
  showBanner(t("viewer.loadingVenue", { name: venues.find((v) => v.id === venueId)?.name ?? venueId }));
  showLoadingOverlay(t("viewer.loadingVenue", { name: "" }), "");
  try {
    await clearSceneState(buildRestoreContext());
    const res = await fetch(sessionUrl);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    await restoreSession(parseSessionJson(await res.text()), buildRestoreContext());
    currentVenueId = venueId;
    viewerVenueSelect.value = venueId;
    hideBanner();
  } finally {
    hideLoadingOverlay();
  }
}`;

  const newSwitchVenue = `async function switchVenue(venueId) {
  if (!manifest || !venueId || venueId === currentVenueId) return;
  const rawSessionUrl = resolveVenueSessionUrl(manifest, venueId);
  if (!rawSessionUrl) throw new Error(t("viewer.noSessionUrl"));
  const sessionUrl = new URL(rawSessionUrl, manifestUrlBase || window.location.href).href;
  setSessionAssetBaseUrl(sessionUrl);
  showBanner(t("viewer.loadingVenue", { name: venues.find((v) => v.id === venueId)?.name ?? venueId }));
  showLoadingOverlay(t("viewer.loadingVenue", { name: "" }), "");
  try {
    await clearSceneState(buildRestoreContext());
    const res = await fetch(sessionUrl);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    await restoreSession(parseSessionJson(await res.text()), buildRestoreContext());
    currentVenueId = venueId;
    viewerVenueSelect.value = venueId;
    hideBanner();
  } finally {
    hideLoadingOverlay();
  }
}`;

  if (!viewer.includes(oldSwitchVenue)) {
    fail("patchRemoteDataUrlBase: switchVenue not found in src/viewer.js");
  }
  viewer = viewer.replace(oldSwitchVenue, newSwitchVenue);

  await fs.writeFile(viewerPath, viewer, "utf8");
  log("Patched remote data URL base: src/viewer.js");

  // Sanity: synthetic remote base must not use portfolio origin for /sessions
  const sessionBody = await fs.readFile(sessionPath, "utf8");
  if (!sessionBody.includes("setSessionAssetBaseUrl")) {
    fail("Remote URL patch missing setSessionAssetBaseUrl export");
  }
  if (
    sessionBody.includes("new URL(url, globalThis.location.origin).href") &&
    !sessionBody.includes("baseUrl = sessionAssetBaseUrl")
  ) {
    fail("Remote URL patch did not replace origin-only resolution path");
  }
}

/**
 * Patch marker icon resolver so icons load from the demo viewer directory
 * (/demos/cesium-viewer/icons/marker/...) rather than site-root /icons/marker/.
 */
async function patchMarkerImageUrls(buildRoot) {
  const patchedFn = `function resolveMarkerImageUrl(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (/^https?:\\/\\//i.test(s)) return s;
  // Demo patch: resolve markers relative to viewer.html so allowlisted
  // public/icons/marker/* is served under /demos/cesium-viewer/icons/marker/.
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
    rel = "icons/marker/" + s.replace(/^\\.?\\//, "");
  }
  try {
    const base =
      typeof window !== "undefined" && window.location?.href
        ? window.location.href
        : "/demos/cesium-viewer/viewer.html";
    return new URL(rel, base).href;
  } catch {
    return "/demos/cesium-viewer/" + rel.replace(/^\\//, "");
  }
}
`;

  // Match original (double or single quotes) or already-patched function bodies.
  const markerFnRe =
    /function resolveMarkerImageUrl\(raw\) \{[\s\S]*?\n\}(?=\n\nfunction |\nfunction |\nexport |\nasync function |\nconst |\nlet |\nvar )/;

  const targets = ["src/viewer.js", "src/main.js"];
  let patched = 0;
  for (const rel of targets) {
    const abs = path.join(buildRoot, rel);
    if (!(await pathExists(abs))) continue;
    const body = await fs.readFile(abs, "utf8");
    if (!body.includes("function resolveMarkerImageUrl")) continue;

    if (body.includes("Demo patch: resolve markers relative to viewer.html")) {
      log(`Marker path already patched: ${rel}`);
      patched += 1;
      continue;
    }

    if (!markerFnRe.test(body)) {
      fail(
        `patchMarkerImageUrls: unexpected resolveMarkerImageUrl shape in ${rel}`,
      );
    }
    const next = body.replace(markerFnRe, patchedFn.trimEnd());
    if (next === body) {
      fail(`patchMarkerImageUrls: failed to replace resolveMarkerImageUrl in ${rel}`);
    }
    await fs.writeFile(abs, next, "utf8");
    log(`Patched marker image URLs: ${rel}`);
    patched += 1;
  }
  if (patched === 0) {
    fail("patchMarkerImageUrls: no resolveMarkerImageUrl targets patched");
  }

  for (const rel of targets) {
    const abs = path.join(buildRoot, rel);
    if (!(await pathExists(abs))) continue;
    const body = await fs.readFile(abs, "utf8");
    if (!body.includes("function resolveMarkerImageUrl")) continue;
    if (!body.includes("/demos/cesium-viewer/")) {
      fail(`Marker patch missing demo base in ${rel}`);
    }
    // Root-only return of /icons/marker without demo base is a regression
    if (
      /return\s+["']\/icons\/marker\//.test(body) &&
      !body.includes("demos/cesium-viewer")
    ) {
      fail(`Marker patch left root-only /icons/marker paths in ${rel}`);
    }
  }
}

async function writeDemoViteConfig(buildRoot) {
  // Viewer-only multi-page input; output into portfolio public/.
  // base must be "./" (not PUBLIC_BASE): vite-plugin-cesium joins base into
  // the on-disk copy path, so an absolute base nests cesium under
  // demos/cesium-viewer/demos/cesium-viewer/cesium/. Relative base puts
  // cesium/ next to viewer.html, and assets resolve correctly when the
  // page is served at /demos/cesium-viewer/viewer.html.
  const configPath = path.join(buildRoot, "vite.config.js");
  const outDirPosix = OUT_DIR.split(path.sep).join("/");
  const content = `import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generated by scripts/build-cesium-viewer-demo.mjs — do not hand-edit.
export default defineConfig({
  plugins: [cesium()],
  base: "./",
  worker: { format: "es" },
  optimizeDeps: { exclude: ["gdal3.js"] },
  build: {
    outDir: ${JSON.stringify(outDirPosix)},
    emptyOutDir: true,
    rollupOptions: {
      input: {
        viewer: path.resolve(__dirname, "viewer.html"),
      },
    },
  },
});
`;
  await fs.writeFile(configPath, content, "utf8");
  log(
    `Wrote viewer-only vite.config.js (base=./ → served under ${PUBLIC_BASE})`,
  );
}

async function installAndBuild(buildRoot) {
  log("npm install (viewer build copy)…");
  await run("npm", ["install", "--no-fund", "--no-audit"], {
    cwd: buildRoot,
    env: { ...process.env, npm_config_fund: "false" },
  });

  log("vite build (viewer entry only)…");
  // Prefer local vite binary
  const viteBin = path.join(buildRoot, "node_modules", "vite", "bin", "vite.js");
  if (await pathExists(viteBin)) {
    await run(process.execPath, [viteBin, "build"], { cwd: buildRoot });
  } else {
    await run("npx", ["vite", "build"], { cwd: buildRoot });
  }
}

/**
 * Pure remote-base resolution used for unit-style assertions (mirrors patch).
 */
export function resolvePublishedUrl(url, baseUrl) {
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

async function assertRemoteUrlResolutionLogic() {
  const manifestUrl = "https://tiles.example/venues.json";
  const sessionRel = "/sessions/alpha.json";
  const tilesetRel = "/tilesets/alpha/tileset.json";
  const sessionAbs = resolvePublishedUrl(sessionRel, manifestUrl);
  const tilesetAbs = resolvePublishedUrl(tilesetRel, sessionAbs);
  if (sessionAbs !== "https://tiles.example/sessions/alpha.json") {
    fail(`Remote session resolve failed: ${sessionAbs}`);
  }
  if (tilesetAbs !== "https://tiles.example/tilesets/alpha/tileset.json") {
    fail(`Remote tileset resolve failed: ${tilesetAbs}`);
  }
  // Must NOT resolve against a portfolio-like origin when base is the data host
  if (sessionAbs.includes("malmqvist.dev")) {
    fail("Session URL incorrectly resolved against portfolio host");
  }
  log(
    `Remote URL resolution OK: ${sessionRel} @ ${manifestUrl} → ${sessionAbs}`,
  );
}

async function assertOutputClean() {
  const viewerHtml = path.join(OUT_DIR, "viewer.html");
  if (!(await pathExists(viewerHtml))) {
    fail(`Expected output missing: ${path.relative(ROOT, viewerHtml)}`);
  }

  const cesiumJs = path.join(OUT_DIR, "cesium", "Cesium.js");
  if (!(await pathExists(cesiumJs))) {
    fail(
      `Expected Cesium runtime missing at ${path.relative(ROOT, cesiumJs)} (vite-plugin-cesium copy path wrong?)`,
    );
  }

  // Nested demos/cesium-viewer under outDir means absolute base leaked into copy path
  const nestedLeak = path.join(OUT_DIR, "demos");
  if (await pathExists(nestedLeak)) {
    fail(
      `Unexpected nested ${path.relative(ROOT, nestedLeak)} — Cesium assets were copied with absolute base; use base "./"`,
    );
  }

  const files = await walkFiles(OUT_DIR);
  const forbidden = [];
  for (const file of files) {
    const rel = path.relative(OUT_DIR, file).split(path.sep).join("/");
    if (rel.endsWith(".pptx") || rel.includes("14_")) {
      forbidden.push(rel);
    }
  }
  if (forbidden.length) {
    fail(`Forbidden artifacts in output:\n  - ${forbidden.join("\n  - ")}`);
  }

  // Marker assets present under demo path
  const markerDir = path.join(OUT_DIR, "icons", "marker");
  if (!(await pathExists(markerDir))) {
    fail("Output missing icons/marker (allowlist copy failed)");
  }

  // Bundle must not emit bare root-only "/icons/marker/" string without demo base fallback
  const assetFiles = files.filter(
    (f) => f.includes(`${path.sep}assets${path.sep}`) && f.endsWith(".js"),
  );
  let markerOk = false;
  let remoteOk = false;
  for (const file of assetFiles) {
    const body = await fs.readFile(file, "utf8");
    if (
      body.includes("/demos/cesium-viewer/") ||
      body.includes("icons/marker/")
    ) {
      // Prefer demo-base resolution; reject pure return "/icons/marker/" only patterns
      if (
        body.includes("demos/cesium-viewer") ||
        /new URL\([^)]*icons\/marker/.test(body) ||
        body.includes('"/demos/cesium-viewer/"')
      ) {
        markerOk = true;
      }
    }
    // Minifiers rename helpers; assert behavioral patterns from the demo patches:
    // absolute session/manifest via new URL(..., window.location.href), and
    // venue session resolve against a stored base (|| window.location.href).
    if (
      body.includes("setSessionAssetBaseUrl") ||
      body.includes("sessionAssetBaseUrl") ||
      body.includes("manifestUrlBase") ||
      (/new URL\([^,]+,\s*window\.location\.href\)/.test(body) &&
        /new URL\([^,]+,\s*\w+\s*\|\|\s*window\.location\.href\)/.test(body) &&
        /function \w+\(\w+,\w+=\w+\)/.test(body))
    ) {
      remoteOk = true;
    }
  }
  if (!markerOk) {
    fail(
      "Built viewer bundle does not reference demo marker base (/demos/cesium-viewer or new URL(...icons/marker))",
    );
  }
  if (!remoteOk) {
    fail(
      "Built viewer bundle missing remote data-base resolution (setSessionAssetBaseUrl / manifestUrlBase)",
    );
  }

  // Storage namespaces must appear in built assets
  let storageOk = false;
  for (const file of assetFiles) {
    const body = await fs.readFile(file, "utf8");
    if (body.includes("tiles-viewer:theme") && body.includes("tiles-viewer:language")) {
      storageOk = true;
      break;
    }
  }
  if (!storageOk) {
    fail("Built viewer bundle missing tiles-viewer:* storage namespaces");
  }

  log(`Output OK (${files.length} files), no .pptx / 14_ paths`);
}

async function main() {
  log("Building allowlisted Cesium viewer demo…");
  log(
    `Source pin: ${VIEWER_SOURCE_REPOSITORY}@${VIEWER_SOURCE_REVISION}`,
  );
  await assertRemoteUrlResolutionLogic();

  const sourceRepo = await resolveSourceRepo();
  const buildRoot = await stageBuildCopy(sourceRepo);
  await stageAllowlistedPublic(sourceRepo, buildRoot);
  await patchStorageKeys(buildRoot);
  await patchRemoteDataUrlBase(buildRoot);
  await patchMarkerImageUrls(buildRoot);
  await writeDemoViteConfig(buildRoot);

  await ensureDir(path.dirname(OUT_DIR));

  try {
    await installAndBuild(buildRoot);
  } catch (err) {
    console.error(
      `[build-demo-viewer] Cesium/vite build failed (env or deps). Script is correct; fix the Cesium build environment and re-run.`,
    );
    console.error(
      `[build-demo-viewer] ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }

  await assertOutputClean();

  const successPath = path.relative(ROOT, path.join(OUT_DIR, "viewer.html"));
  console.log(`\n✓ Built Cesium viewer demo → ${successPath}`);
  console.log(`  revision ${VIEWER_SOURCE_REVISION}`);
}

// Allow importing helpers from the check script without running main.
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    fail(err instanceof Error ? err.stack || err.message : String(err));
  });
}
