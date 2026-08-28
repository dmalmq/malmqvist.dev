/**
 * Rerunnable check for local-folder URI rewrite.
 * Covers the public synthetic sample, a tiny implicit+glTF fixture, cyclic
 * external tilesets, and redirect isolation from same-origin site URLs.
 * Does not load workplace or JR station data.
 */
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outFile = path.join(tmpdir(), `local-tileset-rewrite-${Date.now()}.mjs`);

await build({
  entryPoints: [path.join(root, "src/lib/localTileset.ts")],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "neutral",
  logLevel: "silent",
});

const { prepareLocalTileset } = await import(pathToFileURL(outFile).href);

function fileFromBytes(relPath, bytes, type = "application/octet-stream") {
  const file = new File([bytes], path.posix.basename(relPath), { type });
  Object.defineProperty(file, "relativePath", {
    value: relPath,
    configurable: true,
  });
  return file;
}

function fileFromText(relPath, text, type = "application/json") {
  return fileFromBytes(relPath, new TextEncoder().encode(text), type);
}

function pad4(n) {
  return (n + 3) & ~3;
}

function makeGlb(json, bin) {
  const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jsonPadded = pad4(jsonBytes.length);
  const binPadded = bin ? pad4(bin.length) : 0;
  const total = 12 + 8 + jsonPadded + (bin ? 8 + binPadded : 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonPadded, true);
  view.setUint32(16, 0x4e4f534a, true);
  out.set(jsonBytes, 20);
  out.fill(0x20, 20 + jsonBytes.length, 20 + jsonPadded);
  if (bin) {
    const at = 20 + jsonPadded;
    view.setUint32(at, binPadded, true);
    view.setUint32(at + 4, 0x004e4942, true);
    out.set(bin, at + 8);
  }
  return out;
}

async function readBlobJson(url) {
  const res = await fetch(url);
  return res.json();
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const sampleDir = path.join(root, "public/demos/3d-tiles-viewer/synthetic-indoor");
const sampleFiles = [
  fileFromText(
    "synthetic-indoor/tileset.json",
    await readFile(path.join(sampleDir, "tileset.json"), "utf8"),
  ),
  fileFromBytes(
    "synthetic-indoor/building.glb",
    await readFile(path.join(sampleDir, "building.glb")),
    "model/gltf-binary",
  ),
];

const sample = await prepareLocalTileset(sampleFiles);
const sampleJson = await readBlobJson(sample.url);
assert(sampleJson.root.content.uri.startsWith("blob:"), "sample content.uri should be a blob URL");
assert(
  !sampleJson.root.content.uri.includes("building.glb"),
  "sample should not leave the relative glb path",
);
sample.cleanup();

const remoteKept = "https://example.invalid/keep/{level}/{x}/{y}.glb";
const implicitFiles = [
  fileFromText(
    "implicit/tileset.json",
    JSON.stringify({
      asset: { version: "1.1" },
      geometricError: 10,
      schemaUri: "schema.json",
      root: {
        boundingVolume: { box: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1] },
        geometricError: 1,
        refine: "REPLACE",
        content: { uri: "content/{level}/{x}/{y}.glb" },
        implicitTiling: {
          subdivisionScheme: "QUADTREE",
          subtreeLevels: 1,
          availableLevels: 1,
          subtrees: { uri: "subtrees/{level}/{x}/{y}.json" },
        },
        extras: { remote: { uri: remoteKept } },
      },
    }),
  ),
  fileFromText(
    "implicit/schema.json",
    JSON.stringify({ classes: {} }),
  ),
  fileFromText(
    "implicit/subtrees/0/0/0.json",
    JSON.stringify({
      tileAvailability: { constant: 1 },
      contentAvailability: [{ constant: 1 }],
      childSubtreeAvailability: { constant: 0 },
      buffers: [{ uri: "../../availability.bin", byteLength: 4 }],
    }),
  ),
  fileFromBytes("implicit/subtrees/availability.bin", new Uint8Array([1, 2, 3, 4])),
  fileFromBytes(
    "implicit/content/0/0/0.glb",
    makeGlb(
      {
        asset: { version: "2.0" },
        buffers: [{ uri: "chunk.bin", byteLength: 4 }],
        bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 4 }],
        images: [{ uri: "albedo.png" }],
        meshes: [],
      },
      null,
    ),
    "model/gltf-binary",
  ),
  fileFromBytes("implicit/content/0/0/chunk.bin", new Uint8Array([9, 8, 7, 6])),
  fileFromBytes("implicit/content/0/0/albedo.png", new Uint8Array([137, 80, 78, 71])),
];

const implicit = await prepareLocalTileset(implicitFiles);
const implicitJson = await readBlobJson(implicit.url);
assert(implicitJson.schemaUri.startsWith("blob:"), "schemaUri should be rewritten");
assert(
  implicitJson.root.content.uri === "content/{level}/{x}/{y}.glb",
  "implicit content template must keep substitution tokens",
);
assert(
  implicitJson.root.implicitTiling.subtrees.uri === "subtrees/{level}/{x}/{y}.json",
  "subtree template must keep substitution tokens",
);
assert(
  implicitJson.root.extras.remote.uri === remoteKept,
  "http(s) URIs must stay as authored",
);

const contentBlob = await fetch("content/0/0/0.glb");
assert(contentBlob.ok, "template match should redirect content/0/0/0.glb");
const glbBytes = new Uint8Array(await contentBlob.arrayBuffer());
const jsonLen = new DataView(glbBytes.buffer).getUint32(12, true);
const gltfText = new TextDecoder().decode(glbBytes.subarray(20, 20 + jsonLen)).trim();
const gltf = JSON.parse(gltfText);
assert(String(gltf.buffers[0].uri).startsWith("blob:"), "glTF buffer uri should be a blob URL");
assert(String(gltf.images[0].uri).startsWith("blob:"), "glTF image uri should be a blob URL");

const subtreeBlob = await fetch("subtrees/0/0/0.json");
assert(subtreeBlob.ok, "template match should redirect subtree json");
const subtree = await subtreeBlob.json();
assert(String(subtree.buffers[0].uri).startsWith("blob:"), "subtree buffer uri should be a blob URL");

implicit.cleanup();

let missingThrew = false;
try {
  await prepareLocalTileset([
    fileFromText(
      "missing/tileset.json",
      JSON.stringify({
        asset: { version: "1.1" },
        geometricError: 1,
        root: {
          boundingVolume: { box: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1] },
          geometricError: 0,
          content: { uri: "nope.glb" },
        },
      }),
    ),
  ]);
} catch (error) {
  missingThrew = error instanceof Error && error.message.includes("not in the selected folder");
}
assert(missingThrew, "missing relative URI must throw");

let emptyThrew = false;
try {
  await prepareLocalTileset([]);
} catch (error) {
  emptyThrew = error instanceof Error && error.message === "No files selected.";
}
assert(emptyThrew, "empty selection must throw");

const cycleFiles = [
  fileFromText(
    "cycle/a/tileset.json",
    JSON.stringify({
      asset: { version: "1.1" },
      geometricError: 1,
      root: {
        boundingVolume: { box: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1] },
        geometricError: 0,
        content: { uri: "../b/tileset.json" },
      },
    }),
  ),
  fileFromText(
    "cycle/b/tileset.json",
    JSON.stringify({
      asset: { version: "1.1" },
      geometricError: 1,
      root: {
        boundingVolume: { box: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1] },
        geometricError: 0,
        content: { uri: "../a/tileset.json" },
      },
    }),
  ),
];

const cycle = await prepareLocalTileset(cycleFiles);
const cycleRoot = await readBlobJson(cycle.url);
assert(
  String(cycleRoot.root.content.uri).startsWith("blob:"),
  "root cycle edge should rewrite to a blob URL",
);
const cycleChild = await readBlobJson(cycleRoot.root.content.uri);
assert(
  cycleChild.root.content.uri === "../a/tileset.json",
  "back-edge must keep the relative URI",
);
const cycleRedirect = await fetch("../a/tileset.json");
assert(cycleRedirect.ok, "cycle relative URI should redirect to the finished blob");
const redirectedRoot = await cycleRedirect.json();
assert(
  String(redirectedRoot.root.content.uri).startsWith("blob:"),
  "redirected cycle tileset should be the rewritten root",
);
cycle.cleanup();

const selfCycleFolder = await prepareLocalTileset([
  fileFromText(
    "tileset.json",
    JSON.stringify({
      asset: { version: "1.1" },
      geometricError: 1,
      extras: { mark: "local" },
      root: {
        boundingVolume: { box: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1] },
        geometricError: 0,
        content: { uri: "tileset.json" },
      },
    }),
  ),
]);

const SAMPLE_URL = "/demos/3d-tiles-viewer/synthetic-indoor/tileset.json?v=3";

async function sampleUrlReachesRealFetch() {
  try {
    await fetch(SAMPLE_URL);
    return false;
  } catch (error) {
    return error instanceof TypeError;
  }
}

const hijacked = await fetch(SAMPLE_URL).then((res) => res.json());
assert(
  hijacked.extras?.mark === "local",
  "a self-referencing folder registers a tileset.json redirect that shadows the sample URL",
);

selfCycleFolder.detach();
assert(
  await sampleUrlReachesRealFetch(),
  "detach must let the public sample URL reach the real fetch",
);

selfCycleFolder.attach();
const rehijacked = await fetch(SAMPLE_URL).then((res) => res.json());
assert(
  rehijacked.extras?.mark === "local",
  "attach must restore the redirect for a still-live local tileset",
);

selfCycleFolder.cleanup();
assert(
  await sampleUrlReachesRealFetch(),
  "cleanup must remove the local redirect",
);

selfCycleFolder.attach();
assert(
  await sampleUrlReachesRealFetch(),
  "attach after cleanup must not resurrect revoked blobs",
);

await rm(outFile, { force: true });
console.log("local tileset rewrite checks passed");
