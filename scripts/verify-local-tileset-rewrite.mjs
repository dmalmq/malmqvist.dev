/**
 * Rerunnable check for local-folder URI rewrite.
 * Covers the public synthetic bundle, a tiny implicit+glTF fixture, cyclic
 * external tilesets, redirect isolation from same-origin site URLs, and
 * opening a whole `venue-web` bundle from a picked folder.
 * Does not load workplace or JR station data.
 */
import { readdir, readFile, rm } from "node:fs/promises";
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

const { prepareLocalTileset, prepareLocalVenue } = await import(
  pathToFileURL(outFile).href
);

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
    "synthetic-indoor/tiles/main/1f/tileset.json",
    await readFile(path.join(sampleDir, "tiles/main/1f/tileset.json"), "utf8"),
  ),
  fileFromBytes(
    "synthetic-indoor/tiles/main/1f/1f.glb",
    await readFile(path.join(sampleDir, "tiles/main/1f/1f.glb")),
    "model/gltf-binary",
  ),
];

const sample = await prepareLocalTileset(sampleFiles);
const sampleJson = await readBlobJson(sample.url);
assert(sampleJson.root.content.uri.startsWith("blob:"), "sample content.uri should be a blob URL");
assert(
  !sampleJson.root.content.uri.includes("1f.glb"),
  "sample should not leave the relative glb path",
);

const versionSuffix = `?v=${sampleJson.asset.tilesetVersion}`;
assert(
  (await fetch(`${sample.url}${versionSuffix}`)).ok,
  "a versioned request for the rewritten tileset must resolve",
);
const versionedContent = await fetch(`${sampleJson.root.content.uri}${versionSuffix}`);
assert(
  versionedContent.ok,
  "Cesium appends ?v=<asset.tilesetVersion> to content, so the content blob must resolve with a query",
);
assert(
  (await versionedContent.arrayBuffer()).byteLength > 0,
  "a versioned content request must return the GLB bytes",
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

function selfCycleFolderFiles(mark) {
  return [
    fileFromText(
      "tileset.json",
      JSON.stringify({
        asset: { version: "1.1" },
        geometricError: 1,
        extras: { mark },
        root: {
          boundingVolume: { box: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1] },
          geometricError: 0,
          content: { uri: "tileset.json" },
        },
      }),
    ),
  ];
}

const selfCycleFolder = await prepareLocalTileset(selfCycleFolderFiles("local"));

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

const folderA = await prepareLocalTileset(selfCycleFolderFiles("A"));
const folderB = await prepareLocalTileset(selfCycleFolderFiles("B"));
assert(
  (await fetch("tileset.json").then((res) => res.json())).extras.mark === "A",
  "two attached folders share one redirect table and the older keys win",
);
folderA.detach();
assert(
  (await fetch("tileset.json").then((res) => res.json())).extras.mark === "B",
  "detaching the previous folder leaves the new one its own colliding keys",
);
folderA.cleanup();
folderB.cleanup();

const bundleFiles = [];
for (const rel of await readdir(sampleDir, { recursive: true, withFileTypes: true })) {
  if (!rel.isFile()) continue;
  const abs = path.join(rel.parentPath ?? rel.path, rel.name);
  const relPath = path.relative(sampleDir, abs).split(path.sep).join("/");
  bundleFiles.push(fileFromBytes(`picked/${relPath}`, await readFile(abs)));
}

const venue = await prepareLocalVenue(bundleFiles);
assert(venue.source.manifest.levels.length === 2, "bundle should expose both levels");
assert(venue.source.manifest.layers.length === 2, "bundle should expose both layers");
for (const building of venue.source.manifest.buildings) {
  for (const ref of building.tilesets) {
    assert(
      venue.source.resolve(ref.uri).startsWith("blob:"),
      `tileset ${ref.uri} should resolve to a blob URL`,
    );
  }
}
for (const layer of venue.source.manifest.layers) {
  const layerUrl = venue.source.resolve(layer.uri);
  assert(layerUrl.startsWith("blob:"), `layer ${layer.id} should resolve to a blob URL`);
  const fc = await fetch(layerUrl).then((res) => res.json());
  assert(fc.features.length > 0, `layer ${layer.id} should carry features`);
  const iconUrl = venue.source.resolve(
    `${venue.source.manifest.iconBase}${fc.features[0].properties.image}`,
  );
  assert(iconUrl.startsWith("blob:"), "feature icons should resolve to blob URLs");
}
venue.cleanup();

const plainFolder = await prepareLocalVenue(sampleFiles);
assert(
  plainFolder.source.manifest.buildings[0].tilesets[0].uri.startsWith("blob:"),
  "a folder without venue.json still resolves its single tileset",
);
assert(
  plainFolder.source.manifest.levels.length === 0,
  "a folder without venue.json reports no levels",
);
plainFolder.cleanup();

await rm(outFile, { force: true });
console.log("local tileset rewrite checks passed");
