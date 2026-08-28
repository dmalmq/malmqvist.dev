#!/usr/bin/env node
/**
 * Generates a tiny made-up indoor `venue-web` bundle: two levels of 3D Tiles,
 * two point layers, and the marker icons those layers reference.
 *
 * Geometry, rooms, and every point feature are invented. Not a real building,
 * station, workplace, or client dataset.
 *
 * Usage: node scripts/generate-synthetic-indoor-tileset.mjs
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(
  __dirname,
  "../public/demos/3d-tiles-viewer/synthetic-indoor",
);

// Fictional globe origin so Cesium can place the tiles. Not a real venue.
const ORIGIN = { lat: 35.64, lon: 139.75, height: 48 };

const WGS84_A = 6378137.0;
const WGS84_F = 1 / 298.257223563;
const WGS84_E2 = WGS84_F * (2 - WGS84_F);

function geodeticToEcef(latDeg, lonDeg, h) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);
  const n = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
  return {
    x: (n + h) * cosLat * cosLon,
    y: (n + h) * cosLat * sinLon,
    z: (n * (1 - WGS84_E2) + h) * sinLat,
  };
}

function enuToEcefMatrix(latDeg, lonDeg, h) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);
  const origin = geodeticToEcef(latDeg, lonDeg, h);
  const east = [-sinLon, cosLon, 0];
  const north = [-sinLat * cosLon, -sinLat * sinLon, cosLat];
  const up = [cosLat * cosLon, cosLat * sinLon, sinLat];
  return [
    east[0], east[1], east[2], 0,
    north[0], north[1], north[2], 0,
    up[0], up[1], up[2], 0,
    origin.x, origin.y, origin.z, 1,
  ];
}

/**
 * Local authoring frame: X east, Y up, Z south. glTF is Y-up and 3D Tiles
 * rotates it to Z-up as (x, y, z) -> (x, -z, y), which lands as east/north/up.
 */
function localToWgs84(x, y, z) {
  const north = -z;
  const latitude = ORIGIN.lat + north / 111320;
  const longitude =
    ORIGIN.lon + x / (111320 * Math.cos((ORIGIN.lat * Math.PI) / 180));
  return [
    Number(longitude.toFixed(9)),
    Number(latitude.toFixed(9)),
    Number((ORIGIN.height + y).toFixed(3)),
  ];
}

const LEVELS = [
  { levelKey: "1F", levelName: "1F", levelElevationMeters: 0 },
  { levelKey: "2F", levelName: "2F", levelElevationMeters: 3.6 },
];

const geometryByLevel = new Map(LEVELS.map((level) => [level.levelKey, new Map()]));
let activeLevel = "1F";

function batchFor(rgb) {
  const batches = geometryByLevel.get(activeLevel);
  const key = rgb.join(",");
  let batch = batches.get(key);
  if (!batch) {
    batch = { rgb, positions: [], normals: [], indices: [] };
    batches.set(key, batch);
  }
  return batch;
}

function addBox(x0, y0, z0, x1, y1, z1, rgb) {
  const batch = batchFor(rgb);
  const faces = [
    { n: [0, 0, -1], quad: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] },
    { n: [0, 0, 1], quad: [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]] },
    { n: [0, -1, 0], quad: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]] },
    { n: [0, 1, 0], quad: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] },
    { n: [-1, 0, 0], quad: [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]] },
    { n: [1, 0, 0], quad: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]] },
  ];
  for (const face of faces) {
    const base = batch.positions.length / 3;
    for (const [x, y, z] of face.quad) {
      batch.positions.push(x, y, z);
      batch.normals.push(face.n[0], face.n[1], face.n[2]);
    }
    batch.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

function addWallWithDoor(x0, y0, z0, x1, y1, z1, door, rgb) {
  const axis = Math.abs(x1 - x0) >= Math.abs(z1 - z0) ? "x" : "z";
  if (axis === "x") {
    addBox(x0, y0, z0, door[0], y1, z1, rgb);
    addBox(door[1], y0, z0, x1, y1, z1, rgb);
    addBox(door[0], door[2], z0, door[1], y1, z1, rgb);
  } else {
    addBox(x0, y0, z0, x1, y1, door[0], rgb);
    addBox(x0, y0, door[1], x1, y1, z1, rgb);
    addBox(x0, door[2], door[0], x1, y1, door[1], rgb);
  }
}

const WALL = [214, 201, 184];
const FLOOR1 = [196, 168, 132];
const FLOOR2 = [142, 168, 150];
const LOBBY = [232, 176, 112];
const ROOM_A = [201, 96, 84];
const ROOM_B = [96, 148, 186];
const ROOM_C = [92, 158, 132];
const ROOM_D = [176, 122, 168];
const STAIR = [201, 58, 34];
const CEIL = [244, 236, 220];
const EXT = [168, 158, 146];

const W = 18;
const D = 12;
const T = 0.18;
const H1 = 3.6;
const H2 = 7.2;
const DOOR_W = 1.1;
const DOOR_H = 2.2;

activeLevel = "1F";
addBox(0, -0.2, 0, W, 0, D, [120, 118, 112]);
addBox(0, 0, 0, 7, 0.08, D, LOBBY);
addBox(7, 0, 0, W, 0.08, 5, ROOM_A);
addBox(7, 0, 7, W, 0.08, D, ROOM_B);
addBox(7, 0, 5, W, 0.08, 7, FLOOR1);

addBox(0, 0, 0, T, H1, D, EXT);
addBox(W - T, 0, 0, W, H1, D, EXT);
addBox(0, 0, 0, 0.55, H1, T, EXT);
addBox(W - 0.55, 0, 0, W, H1, T, EXT);
addBox(0, 0, D - T, 0.55, H1, D, EXT);
addBox(W - 0.55, 0, D - T, W, H1, D, EXT);

addWallWithDoor(7 - T / 2, 0, 0, 7 + T / 2, H1, 5, [1.6, 1.6 + DOOR_W, DOOR_H], WALL);
addWallWithDoor(7 - T / 2, 0, 7, 7 + T / 2, H1, D, [8.4, 8.4 + DOOR_W, DOOR_H], WALL);
addBox(7 - T / 2, 0, 5, 7 + T / 2, H1, 7, WALL);
addWallWithDoor(7, 0, 5 - T / 2, W, H1, 5 + T / 2, [11.2, 11.2 + DOOR_W, DOOR_H], WALL);
addWallWithDoor(7, 0, 7 - T / 2, W, H1, 7 + T / 2, [11.2, 11.2 + DOOR_W, DOOR_H], WALL);

const steps = 12;
const stepRun = (3.4 - 1.1) / steps;
const stepRise = H1 / steps;
for (let i = 0; i < steps; i++) {
  const x0 = 1.1 + i * stepRun;
  addBox(x0, i * stepRise, 1.0, x0 + stepRun + 0.02, (i + 1) * stepRise, 3.6, STAIR);
}

activeLevel = "2F";
// Second-floor plates, with the stair well left open at x 1.1-3.4, z 1.0-3.6
addBox(0, H1 - 0.12, 0, 1.1, H1, D, FLOOR2);
addBox(3.4, H1 - 0.12, 0, 7, H1, D, FLOOR2);
addBox(1.1, H1 - 0.12, 0, 3.4, H1, 1.0, FLOOR2);
addBox(1.1, H1 - 0.12, 3.6, 3.4, H1, D, FLOOR2);
addBox(7, H1 - 0.12, 0, W, H1, 5, ROOM_C);
addBox(7, H1 - 0.12, 7, W, H1, D, ROOM_D);
addBox(7, H1 - 0.12, 5, W, H1, 7, FLOOR2);
addBox(0, H2, 0, W, H2 + 0.16, D, CEIL);

addBox(0, H1, 0, T, H2, D, EXT);
addBox(W - T, H1, 0, W, H2, D, EXT);
addBox(0, H1, 0, 0.55, H2, T, EXT);
addBox(W - 0.55, H1, 0, W, H2, T, EXT);
addBox(0, H1, D - T, 0.55, H2, D, EXT);
addBox(W - 0.55, H1, D - T, W, H2, D, EXT);

addWallWithDoor(7 - T / 2, H1, 0, 7 + T / 2, H2, 5, [1.6, 1.6 + DOOR_W, H1 + DOOR_H], WALL);
addWallWithDoor(7 - T / 2, H1, 7, 7 + T / 2, H2, D, [8.4, 8.4 + DOOR_W, H1 + DOOR_H], WALL);
addBox(7 - T / 2, H1, 5, 7 + T / 2, H2, 7, WALL);
addWallWithDoor(7, H1, 5 - T / 2, W, H2, 5 + T / 2, [11.2, 11.2 + DOOR_W, H1 + DOOR_H], WALL);
addWallWithDoor(7, H1, 7 - T / 2, W, H2, 7 + T / 2, [11.2, 11.2 + DOOR_W, H1 + DOOR_H], WALL);

function align(bytes, size, pad = 0x20) {
  const extra = (size - (bytes.length % size)) % size;
  if (!extra) return bytes;
  const out = Buffer.alloc(bytes.length + extra, pad);
  bytes.copy(out);
  return out;
}

function buildGlb(batches) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  const binChunks = [];
  const bufferViews = [];
  const accessors = [];
  const materials = [];
  const primitives = [];
  let byteOffset = 0;
  let accessorIndex = 0;
  let totalVerts = 0;

  const pushBufferView = (bytes, target) => {
    const padded = align(bytes, 4, 0x00);
    bufferViews.push({ buffer: 0, byteOffset, byteLength: padded.length, target });
    binChunks.push(padded);
    byteOffset += padded.length;
    return bufferViews.length - 1;
  };

  for (const batch of batches.values()) {
    const posF32 = new Float32Array(batch.positions);
    const nrmF32 = new Float32Array(batch.normals);
    const maxIndex = Math.max(0, ...batch.indices);
    const idxArray =
      maxIndex > 65535 ? new Uint32Array(batch.indices) : new Uint16Array(batch.indices);

    let bMinX = Infinity, bMinY = Infinity, bMinZ = Infinity;
    let bMaxX = -Infinity, bMaxY = -Infinity, bMaxZ = -Infinity;
    for (let i = 0; i < batch.positions.length; i += 3) {
      bMinX = Math.min(bMinX, batch.positions[i]);
      bMinY = Math.min(bMinY, batch.positions[i + 1]);
      bMinZ = Math.min(bMinZ, batch.positions[i + 2]);
      bMaxX = Math.max(bMaxX, batch.positions[i]);
      bMaxY = Math.max(bMaxY, batch.positions[i + 1]);
      bMaxZ = Math.max(bMaxZ, batch.positions[i + 2]);
    }
    minX = Math.min(minX, bMinX); minY = Math.min(minY, bMinY); minZ = Math.min(minZ, bMinZ);
    maxX = Math.max(maxX, bMaxX); maxY = Math.max(maxY, bMaxY); maxZ = Math.max(maxZ, bMaxZ);

    const posView = pushBufferView(
      Buffer.from(posF32.buffer, posF32.byteOffset, posF32.byteLength), 34962);
    const nrmView = pushBufferView(
      Buffer.from(nrmF32.buffer, nrmF32.byteOffset, nrmF32.byteLength), 34962);
    const idxView = pushBufferView(
      Buffer.from(idxArray.buffer, idxArray.byteOffset, idxArray.byteLength), 34963);

    const posAccessor = accessorIndex++;
    const nrmAccessor = accessorIndex++;
    const idxAccessor = accessorIndex++;
    accessors.push(
      {
        bufferView: posView,
        componentType: 5126,
        count: batch.positions.length / 3,
        type: "VEC3",
        min: [bMinX, bMinY, bMinZ],
        max: [bMaxX, bMaxY, bMaxZ],
      },
      {
        bufferView: nrmView,
        componentType: 5126,
        count: batch.normals.length / 3,
        type: "VEC3",
      },
      {
        bufferView: idxView,
        componentType: maxIndex > 65535 ? 5125 : 5123,
        count: batch.indices.length,
        type: "SCALAR",
      },
    );

    const materialIndex = materials.length;
    materials.push({
      name: `Unlit_${batch.rgb.join("_")}`,
      pbrMetallicRoughness: {
        baseColorFactor: [batch.rgb[0] / 255, batch.rgb[1] / 255, batch.rgb[2] / 255, 1],
        metallicFactor: 0,
        roughnessFactor: 1,
      },
      extensions: { KHR_materials_unlit: {} },
    });
    primitives.push({
      attributes: { POSITION: posAccessor, NORMAL: nrmAccessor },
      indices: idxAccessor,
      material: materialIndex,
    });
    totalVerts += batch.positions.length / 3;
  }

  const bin = Buffer.concat(binChunks);
  const gltf = {
    asset: { version: "2.0", generator: "malmqvist.dev synthetic indoor bundle" },
    extensionsUsed: ["KHR_materials_unlit"],
    scenes: [{ nodes: [0] }],
    scene: 0,
    nodes: [{ mesh: 0, name: "SyntheticIndoor" }],
    meshes: [{ name: "SyntheticIndoor", primitives }],
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: bin.length }],
  };

  const json = align(Buffer.from(JSON.stringify(gltf), "utf8"), 4, 0x20);
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(json.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(bin.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4);
  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  const glb = Buffer.concat([header, jsonChunkHeader, json, binChunkHeader, bin]);
  glb.writeUInt32LE(glb.length, 8);

  return { glb, bounds: { minX, minY, minZ, maxX, maxY, maxZ }, totalVerts };
}

function tilesetJson(contentUri, bounds, tilesetVersion) {
  // Bounding volume is in the tile's Z-up frame: (x, y, z)_gltf -> (x, -z, y).
  const zUpMin = [bounds.minX, -bounds.maxZ, bounds.minY];
  const zUpMax = [bounds.maxX, -bounds.minZ, bounds.maxY];
  const cx = (zUpMin[0] + zUpMax[0]) / 2;
  const cy = (zUpMin[1] + zUpMax[1]) / 2;
  const cz = (zUpMin[2] + zUpMax[2]) / 2;
  const hx = (zUpMax[0] - zUpMin[0]) / 2;
  const hy = (zUpMax[1] - zUpMin[1]) / 2;
  const hz = (zUpMax[2] - zUpMin[2]) / 2;
  return {
    asset: {
      version: "1.1",
      tilesetVersion,
      extras: {
        attribution:
          "Synthetic indoor sample generated for malmqvist.dev. Invented geometry — not a real building, JR station, workplace, or client dataset.",
      },
    },
    geometricError: 80,
    root: {
      boundingVolume: { box: [cx, cy, cz, hx, 0, 0, 0, hy, 0, 0, 0, hz] },
      geometricError: 0,
      refine: "ADD",
      transform: enuToEcefMatrix(ORIGIN.lat, ORIGIN.lon, ORIGIN.height),
      content: { uri: contentUri },
    },
  };
}

const EYE = 1.6;

function feature(symbolId, levelKey, x, z, en, ja) {
  const level = LEVELS.find((l) => l.levelKey === levelKey);
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: localToWgs84(x, level.levelElevationMeters + EYE, z),
    },
    properties: {
      symbol_id: symbolId,
      image: `${symbolId}.svg`,
      levelKey,
      name: { en, ja },
    },
  };
}

const circulation = {
  type: "FeatureCollection",
  features: [
    feature("elevator", "1F", 5.2, 2.0, "Lobby lift", "ロビーエレベーター"),
    feature("stairs-up", "1F", 2.2, 2.3, "Stair to 2F", "2Fへの階段"),
    feature("escalator", "1F", 5.2, 9.0, "Escalator up", "上りエスカレーター"),
    feature("elevator", "2F", 5.2, 2.0, "Gallery lift", "ギャラリーエレベーター"),
    feature("stairs-down", "2F", 2.2, 2.3, "Stair to 1F", "1Fへの階段"),
    feature("escalator", "2F", 5.2, 9.0, "Escalator down", "下りエスカレーター"),
  ],
};

const facilities = {
  type: "FeatureCollection",
  features: [
    feature("restroom", "1F", 9.5, 2.5, "Restroom", "トイレ"),
    feature("information", "1F", 5.5, 10.4, "Information", "案内所"),
    feature("locker", "1F", 12.0, 6.0, "Coin lockers", "コインロッカー"),
    feature("ticket", "1F", 3.0, 10.0, "Ticket machine", "券売機"),
    feature("restroom", "2F", 9.5, 2.5, "Restroom", "トイレ"),
    feature("information", "2F", 12.5, 6.0, "Gallery desk", "ギャラリー受付"),
    feature("locker", "2F", 13.0, 9.5, "Day lockers", "一時ロッカー"),
  ],
};

const SHU = "#c93a22";
const AI = "#2b4c6f";

/** Marker plate: warm paper disc, ring and glyph in the layer colour. */
function icon(color, glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="18" fill="#fcfaf3" stroke="${color}" stroke-width="2.5"/>
  <g fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
${glyph}
  </g>
</svg>
`;
}

const ICONS = {
  "elevator": icon(SHU, `    <rect x="13" y="11" width="14" height="18" rx="1.5"/>
    <path d="M20 11v18"/>
    <path d="M16.4 17.6 15 16.2l-1.4 1.4" transform="translate(1.6 -1.2)"/>
    <path d="M23 22.4 24.4 23.8 25.8 22.4" transform="translate(-1.6 1.2)"/>`),
  "escalator": icon(SHU, `    <path d="M11 27h5l10-14h4"/>
    <path d="M11 27v-3h3"/>
    <path d="M23 13h3v3"/>`),
  "stairs-up": icon(SHU, `    <path d="M11 28h5v-4h5v-4h5v-4h4"/>
    <path d="M26 13h4v4"/>`),
  "stairs-down": icon(SHU, `    <path d="M11 12h5v4h5v4h5v4h4"/>
    <path d="M26 27h4v-4"/>`),
  "restroom": icon(AI, `    <circle cx="15" cy="13.5" r="2.2"/>
    <path d="M15 16.5v6M12.6 19h4.8M13.4 28l1.6-5.5 1.6 5.5"/>
    <circle cx="25.5" cy="13.5" r="2.2"/>
    <path d="M25.5 16.5 22.8 24h5.4z M25.5 24v4"/>`),
  "information": icon(AI, `    <circle cx="20" cy="13.5" r="1.6" fill="${AI}" stroke="none"/>
    <path d="M20 18v10"/>`),
  "locker": icon(AI, `    <rect x="12" y="11" width="16" height="18" rx="1.5"/>
    <path d="M20 11v18M12 20h16"/>
    <path d="M17.4 15.5h.01M17.4 24.5h.01M22.6 15.5h.01M22.6 24.5h.01"/>`),
  "ticket": icon(AI, `    <rect x="11" y="14" width="18" height="12" rx="1.5"/>
    <path d="M15 20h10"/>
    <path d="M11 18.5a1.6 1.6 0 0 0 0 3M29 18.5a1.6 1.6 0 0 1 0 3"/>`),
};

const oneF = buildGlb(geometryByLevel.get("1F"));
const twoF = buildGlb(geometryByLevel.get("2F"));

const levels = [
  {
    levelKey: "1F",
    levelName: "1F",
    levelElevationMeters: 0,
    minZMeters: Number(oneF.bounds.minY.toFixed(3)),
    maxZMeters: Number(oneF.bounds.maxY.toFixed(3)),
  },
  {
    levelKey: "2F",
    levelName: "2F",
    levelElevationMeters: H1,
    minZMeters: Number(twoF.bounds.minY.toFixed(3)),
    maxZMeters: Number(twoF.bounds.maxY.toFixed(3)),
  },
];

const venue = {
  format: "venue-web",
  version: 1,
  id: "synthetic-indoor",
  name: { en: "Synthetic indoor sample", ja: "合成屋内サンプル" },
  generator: "malmqvist.dev/scripts/generate-synthetic-indoor-tileset.mjs",
  generatedAt: "2026-08-28T00:00:00.000Z",
  synthetic: true,
  levels,
  buildings: [
    {
      id: "main",
      name: "Main building",
      tilesets: [
        { levelKey: "1F", uri: "tiles/main/1f/tileset.json" },
        { levelKey: "2F", uri: "tiles/main/2f/tileset.json" },
      ],
    },
  ],
  layers: [
    {
      id: "circulation",
      name: { en: "Vertical circulation", ja: "縦動線" },
      uri: "layers/circulation.geojson",
      geometry: "point",
      color: SHU,
      defaultVisible: true,
    },
    {
      id: "facilities",
      name: { en: "Facilities", ja: "設備" },
      uri: "layers/facilities.geojson",
      geometry: "point",
      color: AI,
      defaultVisible: true,
    },
  ],
  iconBase: "icons/marker/",
  camera: { heading: 182, pitch: -20, rangeMeters: 34 },
};

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(path.join(OUT_DIR, "tiles/main/1f"), { recursive: true });
await mkdir(path.join(OUT_DIR, "tiles/main/2f"), { recursive: true });
await mkdir(path.join(OUT_DIR, "layers"), { recursive: true });
await mkdir(path.join(OUT_DIR, "icons/marker"), { recursive: true });

const written = [];
async function emit(relPath, data) {
  const full = path.join(OUT_DIR, relPath);
  await writeFile(full, data);
  written.push([relPath, Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)]);
}

await emit("tiles/main/1f/1f.glb", oneF.glb);
await emit("tiles/main/2f/2f.glb", twoF.glb);
await emit(
  "tiles/main/1f/tileset.json",
  `${JSON.stringify(tilesetJson("1f.glb", oneF.bounds, "synthetic-indoor-1f-1"), null, 2)}\n`,
);
await emit(
  "tiles/main/2f/tileset.json",
  `${JSON.stringify(tilesetJson("2f.glb", twoF.bounds, "synthetic-indoor-2f-1"), null, 2)}\n`,
);
await emit("layers/circulation.geojson", `${JSON.stringify(circulation, null, 2)}\n`);
await emit("layers/facilities.geojson", `${JSON.stringify(facilities, null, 2)}\n`);
for (const [slug, svg] of Object.entries(ICONS)) {
  await emit(`icons/marker/${slug}.svg`, svg);
}
await emit("venue.json", `${JSON.stringify(venue, null, 2)}\n`);

const total = written.reduce((sum, [, size]) => sum + size, 0);
for (const [relPath, size] of written) {
  console.log(`${String(size).padStart(8)}  ${relPath}`);
}
console.log(
  `${String(total).padStart(8)}  total (${oneF.totalVerts + twoF.totalVerts} verts)`,
);
