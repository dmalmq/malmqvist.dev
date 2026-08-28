#!/usr/bin/env node
/**
 * Generates a tiny made-up indoor 3D Tiles 1.1 sample (glTF/GLB content).
 * Geometry is invented: a two-storey lobby + rooms. Not a real building,
 * station, workplace, or client dataset.
 *
 * Usage: node scripts/generate-synthetic-indoor-tileset.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(
  __dirname,
  "../public/demos/3d-tiles-viewer/synthetic-indoor",
);

// Fictional globe origin so Cesium can place the tile. Not a real venue.
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
    east[0],
    east[1],
    east[2],
    0,
    north[0],
    north[1],
    north[2],
    0,
    up[0],
    up[1],
    up[2],
    0,
    origin.x,
    origin.y,
    origin.z,
    1,
  ];
}

/**
 * glTF is Y-up. 3D Tiles applies a +90° rotation about X to get Z-up:
 * (x, y, z) -> (x, -z, y). Author X=east, Y=up, Z=south so the converted
 * frame is east / north / up.
 */
const positions = [];
const normals = [];
const colors = [];
const indices = [];

function pushVertex(x, y, z, nx, ny, nz, r, g, b) {
  positions.push(x, y, z);
  normals.push(nx, ny, nz);
  colors.push(r, g, b, 255);
}

function addBox(x0, y0, z0, x1, y1, z1, rgb) {
  const [r, g, b] = rgb;
  const faces = [
    { n: [0, 0, -1], quad: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] },
    { n: [0, 0, 1], quad: [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]] },
    { n: [0, -1, 0], quad: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]] },
    { n: [0, 1, 0], quad: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] },
    { n: [-1, 0, 0], quad: [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]] },
    { n: [1, 0, 0], quad: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]] },
  ];
  for (const face of faces) {
    const base = positions.length / 3;
    for (const [x, y, z] of face.quad) {
      pushVertex(x, y, z, face.n[0], face.n[1], face.n[2], r, g, b);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
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

const WALL = [232, 224, 210];
const FLOOR1 = [196, 168, 132];
const FLOOR2 = [176, 186, 176];
const LOBBY = [214, 186, 154];
const ROOM_A = [186, 154, 138];
const ROOM_B = [168, 176, 186];
const ROOM_C = [154, 168, 162];
const ROOM_D = [176, 162, 154];
const STAIR = [201, 58, 34];
const CEIL = [244, 240, 232];
const EXT = [210, 204, 192];

const W = 18;
const D = 12;
const T = 0.18;
const H1 = 3.6;
const H2 = 7.2;
const DOOR_W = 1.1;
const DOOR_H = 2.2;

// Ground slab and first-floor finishes
addBox(0, -0.2, 0, W, 0, D, [120, 118, 112]);
addBox(0, 0, 0, 7, 0.08, D, LOBBY);
addBox(7, 0, 0, W, 0.08, 5, ROOM_A);
addBox(7, 0, 7, W, 0.08, D, ROOM_B);
addBox(7, 0, 5, W, 0.08, 7, FLOOR1);

// Second-floor plates (gap for the stair well at x 1.1–3.4, z 1.0–3.6)
addBox(0, H1 - 0.12, 0, 1.1, H1, D, FLOOR2);
addBox(3.4, H1 - 0.12, 0, 7, H1, D, FLOOR2);
addBox(1.1, H1 - 0.12, 0, 3.4, H1, 1.0, FLOOR2);
addBox(1.1, H1 - 0.12, 3.6, 3.4, H1, D, FLOOR2);
addBox(7, H1 - 0.12, 0, W, H1, 5, ROOM_C);
addBox(7, H1 - 0.12, 7, W, H1, D, ROOM_D);
addBox(7, H1 - 0.12, 5, W, H1, 7, FLOOR2);

// Roof
addBox(0, H2, 0, W, H2 + 0.16, D, CEIL);

// Exterior walls, first floor (door on +Z south facade)
addBox(0, 0, 0, W, H2, T, EXT);
addBox(0, 0, D - T, 8.2, H1, D, EXT);
addBox(9.4, 0, D - T, W, H1, D, EXT);
addBox(8.2, DOOR_H, D - T, 9.4, H1, D, EXT);
addBox(0, H1, D - T, W, H2, D, EXT);
addBox(0, 0, 0, T, H2, D, EXT);
addBox(W - T, 0, 0, W, H2, D, EXT);

// Interior: lobby | rooms split at x=7, corridor at z=5–7
addWallWithDoor(7 - T / 2, 0, 0, 7 + T / 2, H1, 5, [1.6, 1.6 + DOOR_W, DOOR_H], WALL);
addWallWithDoor(7 - T / 2, 0, 7, 7 + T / 2, H1, D, [8.4, 8.4 + DOOR_W, DOOR_H], WALL);
addBox(7 - T / 2, 0, 5, 7 + T / 2, H1, 7, WALL);
addWallWithDoor(7, 0, 5 - T / 2, W, H1, 5 + T / 2, [11.2, 11.2 + DOOR_W, DOOR_H], WALL);
addWallWithDoor(7, 0, 7 - T / 2, W, H1, 7 + T / 2, [11.2, 11.2 + DOOR_W, DOOR_H], WALL);

addWallWithDoor(7 - T / 2, H1, 0, 7 + T / 2, H2, 5, [1.6, 1.6 + DOOR_W, H1 + DOOR_H], WALL);
addWallWithDoor(7 - T / 2, H1, 7, 7 + T / 2, H2, D, [8.4, 8.4 + DOOR_W, H1 + DOOR_H], WALL);
addBox(7 - T / 2, H1, 5, 7 + T / 2, H2, 7, WALL);
addWallWithDoor(7, H1, 5 - T / 2, W, H2, 5 + T / 2, [11.2, 11.2 + DOOR_W, H1 + DOOR_H], WALL);
addWallWithDoor(7, H1, 7 - T / 2, W, H2, 7 + T / 2, [11.2, 11.2 + DOOR_W, H1 + DOOR_H], WALL);

// Stair flight in the lobby well
const steps = 12;
const stepRun = (3.4 - 1.1) / steps;
const stepRise = H1 / steps;
for (let i = 0; i < steps; i++) {
  const x0 = 1.1 + i * stepRun;
  addBox(x0, i * stepRise, 1.0, x0 + stepRun + 0.02, (i + 1) * stepRise, 3.6, STAIR);
}

function align(bytes, size, pad = 0x20) {
  const extra = (size - (bytes.length % size)) % size;
  if (!extra) return bytes;
  const out = Buffer.alloc(bytes.length + extra, pad);
  bytes.copy(out);
  return out;
}

const posF32 = new Float32Array(positions);
const nrmF32 = new Float32Array(normals);
const colU8 = new Uint8Array(colors);
const maxIndex = Math.max(...indices);
const idxArray =
  maxIndex > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
const idxBytes = Buffer.from(
  idxArray.buffer,
  idxArray.byteOffset,
  idxArray.byteLength,
);
const idxPadded = align(idxBytes, 4, 0x00);

const binParts = [
  Buffer.from(posF32.buffer, posF32.byteOffset, posF32.byteLength),
  Buffer.from(nrmF32.buffer, nrmF32.byteOffset, nrmF32.byteLength),
  Buffer.from(colU8.buffer, colU8.byteOffset, colU8.byteLength),
];
binParts[2] = align(binParts[2], 4, 0x00);

let offset = 0;
const bufferViews = [];
for (const part of [...binParts, idxPadded]) {
  bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: part.length });
  offset += part.length;
}
const bin = Buffer.concat([...binParts, idxPadded]);

let minX = Infinity,
  minY = Infinity,
  minZ = Infinity,
  maxX = -Infinity,
  maxY = -Infinity,
  maxZ = -Infinity;
for (let i = 0; i < positions.length; i += 3) {
  minX = Math.min(minX, positions[i]);
  minY = Math.min(minY, positions[i + 1]);
  minZ = Math.min(minZ, positions[i + 2]);
  maxX = Math.max(maxX, positions[i]);
  maxY = Math.max(maxY, positions[i + 1]);
  maxZ = Math.max(maxZ, positions[i + 2]);
}

const componentType = maxIndex > 65535 ? 5125 : 5123;
const gltf = {
  asset: {
    version: "2.0",
    generator: "malmqvist.dev synthetic indoor tileset",
  },
  extensionsUsed: ["KHR_materials_unlit"],
  scenes: [{ nodes: [0] }],
  scene: 0,
  nodes: [{ mesh: 0, name: "SyntheticIndoor" }],
  meshes: [
    {
      name: "SyntheticIndoor",
      primitives: [
        {
          attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 },
          indices: 3,
          material: 0,
        },
      ],
    },
  ],
  materials: [
    {
      name: "UnlitVertexColor",
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
        roughnessFactor: 1,
      },
      extensions: { KHR_materials_unlit: {} },
    },
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count: positions.length / 3,
      type: "VEC3",
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
    },
    {
      bufferView: 1,
      componentType: 5126,
      count: normals.length / 3,
      type: "VEC3",
    },
    {
      bufferView: 2,
      componentType: 5121,
      count: colors.length / 4,
      type: "VEC4",
      normalized: true,
    },
    {
      bufferView: 3,
      componentType,
      count: indices.length,
      type: "SCALAR",
    },
  ],
  bufferViews: [
    { ...bufferViews[0], target: 34962 },
    { ...bufferViews[1], target: 34962 },
    { ...bufferViews[2], target: 34962 },
    { ...bufferViews[3], target: 34963 },
  ],
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

// Bounding volume is in the tile's Z-up frame after glTF Y-up → Z-up:
// (x, y, z)_gltf -> (x, -z, y)
const zUpMin = [minX, -maxZ, minY];
const zUpMax = [maxX, -minZ, maxY];
const cx = (zUpMin[0] + zUpMax[0]) / 2;
const cy = (zUpMin[1] + zUpMax[1]) / 2;
const cz = (zUpMin[2] + zUpMax[2]) / 2;
const hx = (zUpMax[0] - zUpMin[0]) / 2;
const hy = (zUpMax[1] - zUpMin[1]) / 2;
const hz = (zUpMax[2] - zUpMin[2]) / 2;

const tileset = {
  asset: {
    version: "1.1",
    tilesetVersion: "synthetic-indoor-1",
    extras: {
      attribution:
        "Synthetic indoor sample generated for malmqvist.dev. Invented geometry — not a real building, JR station, workplace, or client dataset.",
    },
  },
  extras: {
    name: "Synthetic indoor sample",
    floors: ["1F lobby + two rooms", "2F gallery + two rooms"],
    license: "Made-up sample for this site. No third-party data.",
  },
  geometricError: 80,
  root: {
    boundingVolume: {
      box: [cx, cy, cz, hx, 0, 0, 0, hy, 0, 0, 0, hz],
    },
    geometricError: 0,
    refine: "ADD",
    transform: enuToEcefMatrix(ORIGIN.lat, ORIGIN.lon, ORIGIN.height),
    content: { uri: "building.glb" },
  },
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "building.glb"), glb);
await writeFile(
  path.join(OUT_DIR, "tileset.json"),
  `${JSON.stringify(tileset, null, 2)}\n`,
);

console.log(
  `Wrote ${path.relative(process.cwd(), OUT_DIR)} (${glb.length} byte GLB, ${positions.length / 3} verts)`,
);
