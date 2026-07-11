#!/usr/bin/env node
/**
 * Build an allowlisted, storage-namespaced copy of dmalmq/3D-Tiles-Viewer
 * into public/demos/cesium-viewer/ for the portfolio iframe demo.
 *
 * Env:
 *   CESIUM_VIEWER_REPO — optional absolute/relative path to an existing clone
 *                        (skips network clone when set and valid)
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
const REPO_URL = "https://github.com/dmalmq/3D-Tiles-Viewer.git";
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
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
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

async function copyDirFiltered(srcRoot, destRoot, { skipNames = new Set() } = {}) {
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
    log(`Using CESIUM_VIEWER_REPO=${abs}`);
    return abs;
  }

  await ensureDir(CACHE_DIR);
  if (await pathExists(path.join(DEFAULT_CLONE, "viewer.html"))) {
    log(`Reusing clone at ${DEFAULT_CLONE}`);
    return DEFAULT_CLONE;
  }

  if (await pathExists(DEFAULT_CLONE)) {
    await rmrf(DEFAULT_CLONE);
  }

  log(`Shallow cloning ${REPO_URL} → ${DEFAULT_CLONE}`);
  await run("git", ["clone", "--depth", "1", REPO_URL, DEFAULT_CLONE], {
    cwd: ROOT,
  });
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
  const markers = await walkFiles(path.join(destPublic, "icons", "marker")).catch(() => []);
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
    if (needle === "tiles-viewer:theme" && /localStorage\.(get|set|remove)Item\(\s*["']theme["']/.test(body)) {
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
    if (/`section:\$\{/.test(body) && !/`tiles-viewer:section:\$\{/.test(body)) {
      fail("Unnamespaced section collapsed key remains in src/main.js");
    }
  }

  log(`Storage namespace: ${patchedFiles} file(s), ${totalHits} pattern hit group(s)`);
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
  log(`Wrote viewer-only vite.config.js (base=./ → served under ${PUBLIC_BASE})`);
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
    fail(
      `Forbidden artifacts in output:\n  - ${forbidden.join("\n  - ")}`,
    );
  }

  log(`Output OK (${files.length} files), no .pptx / 14_ paths`);
}

async function main() {
  log("Building allowlisted Cesium viewer demo…");
  const sourceRepo = await resolveSourceRepo();
  const buildRoot = await stageBuildCopy(sourceRepo);
  await stageAllowlistedPublic(sourceRepo, buildRoot);
  await patchStorageKeys(buildRoot);
  await writeDemoViteConfig(buildRoot);

  await ensureDir(path.dirname(OUT_DIR));

  try {
    await installAndBuild(buildRoot);
  } catch (err) {
    console.error(
      `[build-demo-viewer] Cesium/vite build failed (env or deps). Script is correct; fix the Cesium build environment and re-run.`,
    );
    console.error(`[build-demo-viewer] ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  await assertOutputClean();

  const successPath = path.relative(ROOT, path.join(OUT_DIR, "viewer.html"));
  console.log(`\n✓ Built Cesium viewer demo → ${successPath}`);
}

main().catch((err) => {
  fail(err instanceof Error ? err.stack || err.message : String(err));
});
