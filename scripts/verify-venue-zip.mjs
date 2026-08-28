/**
 * Rerunnable check for opening a `venue-web` bundle from a zip.
 * Builds archives in-process, so it does not depend on the authoring app.
 * Does not read workplace or JR station data.
 */
import { readdir, readFile, rm } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outFile = path.join(tmpdir(), `venue-zip-${Date.now()}.mjs`);

await build({
  entryPoints: [path.join(root, "src/lib/zipFolder.ts")],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "neutral",
  logLevel: "silent",
});

const localOut = path.join(tmpdir(), `venue-zip-local-${Date.now()}.mjs`);
await build({
  entryPoints: [path.join(root, "src/lib/localTileset.ts")],
  outfile: localOut,
  bundle: true,
  format: "esm",
  platform: "neutral",
  logLevel: "silent",
});

const { filesFromVenueZip } = await import(pathToFileURL(outFile).href);
const { prepareLocalVenue } = await import(pathToFileURL(localOut).href);

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Minimal writer so the parser is checked against an independent producer. */
function makeZip(entries) {
  const encoder = new TextEncoder();
  const locals = [];
  const central = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const raw = typeof entry.data === "string" ? encoder.encode(entry.data) : entry.data;
    const deflated = entry.deflate ? new Uint8Array(deflateRawSync(raw)) : raw;
    const method = entry.deflate ? 8 : 0;
    const crc = crc32(raw);

    const local = new Uint8Array(30 + name.length + deflated.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, method, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, deflated.length, true);
    localView.setUint32(22, raw.length, true);
    localView.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(deflated, 30 + name.length);
    locals.push(local);

    const header = new Uint8Array(46 + name.length);
    const headerView = new DataView(header.buffer);
    headerView.setUint32(0, 0x02014b50, true);
    headerView.setUint16(4, 20, true);
    headerView.setUint16(6, 20, true);
    headerView.setUint16(8, 0x0800, true);
    headerView.setUint16(10, method, true);
    headerView.setUint32(16, crc, true);
    headerView.setUint32(20, deflated.length, true);
    headerView.setUint32(24, raw.length, true);
    headerView.setUint16(28, name.length, true);
    headerView.setUint32(42, offset, true);
    header.set(name, 46);
    central.push(header);
    offset += local.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const part of [...locals, ...central, end]) {
    out.set(part, cursor);
    cursor += part.length;
  }
  return out;
}

function zipFile(bytes, name = "bundle.zip") {
  return new File([bytes], name, { type: "application/zip" });
}

async function rejects(promise, pattern, message) {
  try {
    await promise;
  } catch (error) {
    assert(pattern.test(error.message), `${message} (got: ${error.message})`);
    return;
  }
  throw new Error(message);
}

const sampleDir = path.join(root, "public/demos/3d-tiles-viewer/synthetic-indoor");
const bundleEntries = [];
for (const dirent of await readdir(sampleDir, { recursive: true, withFileTypes: true })) {
  if (!dirent.isFile()) continue;
  const abs = path.join(dirent.parentPath ?? dirent.path, dirent.name);
  const rel = path.relative(sampleDir, abs).split(path.sep).join("/");
  bundleEntries.push({ path: `synthetic-indoor/${rel}`, data: new Uint8Array(await readFile(abs)) });
}

const files = await filesFromVenueZip(zipFile(makeZip(bundleEntries)));
assert(files.length === bundleEntries.length, "every zip entry becomes a file");
assert(
  files.some((file) => file.relativePath === "synthetic-indoor/venue.json"),
  "nested bundle paths survive extraction",
);

const venue = await prepareLocalVenue(files);
assert(venue.source.manifest.levels.length === 2, "a zipped bundle exposes its levels");
assert(venue.source.manifest.layers.length === 2, "a zipped bundle exposes its layers");
for (const building of venue.source.manifest.buildings) {
  for (const ref of building.tilesets) {
    assert(
      venue.source.resolve(ref.uri).startsWith("blob:"),
      `zipped tileset ${ref.uri} resolves to a blob URL`,
    );
  }
}
for (const layer of venue.source.manifest.layers) {
  const collection = await fetch(venue.source.resolve(layer.uri)).then((res) => res.json());
  assert(collection.features.length > 0, `zipped layer ${layer.id} carries features`);
  const icon = venue.source.resolve(
    `${venue.source.manifest.iconBase}${collection.features[0].properties.image}`,
  );
  assert(icon.startsWith("blob:"), "zipped icons resolve to blob URLs");
}
venue.cleanup();

const glb = bundleEntries.find((entry) => entry.path.endsWith("1f.glb"));
const deflated = await filesFromVenueZip(
  zipFile(
    makeZip([
      { path: "venue.json", data: '{"format":"venue-web","version":1}', deflate: true },
      { path: "tiles/main/1f/1f.glb", data: glb.data, deflate: true },
    ]),
  ),
);
const deflatedGlb = deflated.find((file) => file.relativePath === "tiles/main/1f/1f.glb");
assert(deflatedGlb.size === glb.data.length, "a deflated entry expands to its recorded size");
assert(
  new Uint8Array(await deflatedGlb.arrayBuffer())[0] === glb.data[0],
  "a deflated entry expands to its original bytes",
);

await rejects(
  filesFromVenueZip(zipFile(makeZip([{ path: "../escape.json", data: "{}" }]))),
  /escapes its bundle folder/,
  "a traversal path must be refused",
);
await rejects(
  filesFromVenueZip(zipFile(makeZip([{ path: "/etc/passwd", data: "{}" }]))),
  /absolute path/,
  "an absolute path must be refused",
);
await rejects(
  filesFromVenueZip(zipFile(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))),
  /not a readable zip|too small/,
  "a non-zip file must be refused",
);

const withDirectory = await filesFromVenueZip(
  zipFile(
    makeZip([
      { path: "tiles/", data: new Uint8Array(0) },
      { path: "venue.json", data: '{"format":"venue-web","version":1}' },
    ]),
  ),
);
assert(withDirectory.length === 1, "directory entries are skipped");

await rm(outFile, { force: true });
await rm(localOut, { force: true });
console.log("venue zip checks passed");
