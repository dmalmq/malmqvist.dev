/**
 * Reader for the `venue-web` v1 bundle written by dmalmq/3D-Tiles-Viewer.
 * A bundle is a folder of relative paths, so the same parser serves a bundle
 * fetched from this site and one opened from the visitor's own disk.
 */

export const VENUE_FORMAT = "venue-web";
export const VENUE_VERSION = 1;

export type LocalizedText = string | { en?: string; ja?: string };

export type VenueLevel = {
  levelKey: string;
  levelName: string;
  levelElevationMeters: number;
  minZMeters: number | null;
  maxZMeters: number | null;
};

export type VenueTilesetRef = {
  levelKey: string | null;
  uri: string;
};

export type VenueBuilding = {
  id: string;
  name: string;
  tilesets: VenueTilesetRef[];
};

export type VenueLayerGeometry = "point" | "line" | "polygon";

export type VenueLayer = {
  id: string;
  name: LocalizedText;
  uri: string;
  geometry: VenueLayerGeometry;
  color: string | null;
  defaultVisible: boolean;
};

export type VenueCamera = {
  heading: number | null;
  pitch: number | null;
  rangeMeters: number | null;
};

export type VenueManifest = {
  id: string;
  name: LocalizedText;
  generator: string | null;
  generatedAt: string | null;
  synthetic: boolean;
  levels: VenueLevel[];
  buildings: VenueBuilding[];
  layers: VenueLayer[];
  iconBase: string;
  camera: VenueCamera | null;
};

/** Resolves a bundle-relative uri to something fetchable: an http URL or a blob URL. */
export type VenueSource = {
  manifest: VenueManifest;
  resolve: (uri: string) => string;
  cleanup: () => void;
};

export function pickText(value: LocalizedText | undefined, lang: "en" | "ja"): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? value.ja ?? "";
}

function asFiniteOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Venue manifest is missing ${field}.`);
  }
  return value;
}

function parseLevels(raw: unknown): VenueLevel[] {
  // A single-level venue exports no levels at all; tilesets then carry levelKey null.
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new Error("Venue manifest levels must be an array.");
  }
  const levels = raw.map((entry, index) => {
    const level = entry as Record<string, unknown>;
    const levelKey = requireString(level.levelKey, `levels[${index}].levelKey`);
    const elevation = asFiniteOrNull(level.levelElevationMeters);
    if (elevation === null) {
      throw new Error(`levels[${index}].levelElevationMeters must be a number.`);
    }
    return {
      levelKey,
      levelName:
        typeof level.levelName === "string" && level.levelName.trim() !== ""
          ? level.levelName
          : levelKey,
      levelElevationMeters: elevation,
      minZMeters: asFiniteOrNull(level.minZMeters),
      maxZMeters: asFiniteOrNull(level.maxZMeters),
    } satisfies VenueLevel;
  });
  const keys = new Set(levels.map((l) => l.levelKey));
  if (keys.size !== levels.length) {
    throw new Error("Venue manifest has duplicate levelKey values.");
  }
  return levels.sort((a, b) => a.levelElevationMeters - b.levelElevationMeters);
}

function parseBuildings(raw: unknown, levelKeys: Set<string>): VenueBuilding[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Venue manifest must list at least one building.");
  }
  return raw.map((entry, index) => {
    const building = entry as Record<string, unknown>;
    const id = requireString(building.id, `buildings[${index}].id`);
    const tilesetsRaw = building.tilesets;
    if (!Array.isArray(tilesetsRaw) || tilesetsRaw.length === 0) {
      throw new Error(`buildings[${index}] must list at least one tileset.`);
    }
    const tilesets = tilesetsRaw.map((tileEntry, tileIndex) => {
      const tile = tileEntry as Record<string, unknown>;
      const uri = requireString(tile.uri, `buildings[${index}].tilesets[${tileIndex}].uri`);
      const levelKey = tile.levelKey == null ? null : String(tile.levelKey);
      if (levelKey !== null && !levelKeys.has(levelKey)) {
        throw new Error(`Tileset references unknown level "${levelKey}".`);
      }
      return { levelKey, uri } satisfies VenueTilesetRef;
    });
    return {
      id,
      name: typeof building.name === "string" && building.name ? building.name : id,
      tilesets,
    } satisfies VenueBuilding;
  });
}

function parseLayers(raw: unknown): VenueLayer[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new Error("Venue manifest layers must be an array.");
  }
  return raw.map((entry, index) => {
    const layer = entry as Record<string, unknown>;
    const id = requireString(layer.id, `layers[${index}].id`);
    const geometry = layer.geometry === "line" || layer.geometry === "polygon" ? layer.geometry : "point";
    return {
      id,
      name: (layer.name as LocalizedText) ?? id,
      uri: requireString(layer.uri, `layers[${index}].uri`),
      geometry,
      color: typeof layer.color === "string" ? layer.color : null,
      defaultVisible: layer.defaultVisible !== false,
    } satisfies VenueLayer;
  });
}

export function parseVenueManifest(text: string): VenueManifest {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("venue.json is not valid JSON.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("venue.json did not contain a manifest object.");
  }
  if (data.format !== VENUE_FORMAT) {
    throw new Error(`Unsupported venue bundle format: ${String(data.format)}`);
  }
  if (Number(data.version) !== VENUE_VERSION) {
    throw new Error(`Unsupported venue bundle version: ${String(data.version)}`);
  }

  const levels = parseLevels(data.levels);
  const levelKeys = new Set(levels.map((level) => level.levelKey));
  const camera = data.camera as Record<string, unknown> | undefined;

  return {
    id: requireString(data.id, "id"),
    name: (data.name as LocalizedText) ?? String(data.id),
    generator: typeof data.generator === "string" ? data.generator : null,
    generatedAt: typeof data.generatedAt === "string" ? data.generatedAt : null,
    synthetic: data.synthetic === true,
    levels,
    buildings: parseBuildings(data.buildings, levelKeys),
    layers: parseLayers(data.layers),
    iconBase: typeof data.iconBase === "string" ? data.iconBase : "icons/marker/",
    camera: camera
      ? {
          heading: asFiniteOrNull(camera.heading),
          pitch: asFiniteOrNull(camera.pitch),
          rangeMeters: asFiniteOrNull(camera.rangeMeters),
        }
      : null,
  };
}

/** Joins a bundle-relative uri onto a base, keeping the result inside the bundle. */
export function joinBundleUri(base: string, uri: string): string {
  if (/^(https?:|blob:|data:)/i.test(uri)) return uri;
  return new URL(uri, base).href;
}

/** A bundle served from this site: everything resolves against the manifest URL. */
export async function loadVenueFromUrl(manifestUrl: string): Promise<VenueSource> {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Could not read venue.json (${response.status}).`);
  }
  const manifest = parseVenueManifest(await response.text());
  const base = new URL(manifestUrl, window.location.href).href;
  return {
    manifest,
    resolve: (uri) => joinBundleUri(base, uri),
    cleanup: () => {},
  };
}

/**
 * Resolves the icon for a point feature. Icons always come from the bundle, so a
 * real venue's artwork stays wherever the bundle is and never needs a site path.
 */
export function resolveIconUri(manifest: VenueManifest, image: string): string {
  const cleaned = image.replace(/^\.?\//, "").replace(/^marker\//, "");
  const base = manifest.iconBase.endsWith("/") ? manifest.iconBase : `${manifest.iconBase}/`;
  return `${base}${cleaned}`;
}
