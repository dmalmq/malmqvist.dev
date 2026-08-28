/**
 * Cesium wiring for a `venue-web` bundle: per-level tilesets, point layers drawn
 * as billboards from the bundle's own icons, and level/layer filtering.
 * Mirrors the read-only rendering rules of dmalmq/3D-Tiles-Viewer.
 */
import type {
  CesiumApi,
  CesiumDataSource,
  CesiumEntity,
  CesiumTileset,
  CesiumViewer,
} from "./cesiumApi";
import {
  pickText,
  resolveIconUri,
  type VenueLayer,
  type VenueSource,
} from "./venueBundle";

const MARKER_PX = 26;
const LABEL_RANGE_METERS = 70;
/** Markers sit at eye height above their floor so they read as signage, not floor decals. */
const EYE_HEIGHT_METERS = 1.6;

export type VenueFeature = {
  layerId: string;
  levelKey: string | null;
  name: string;
  symbolId: string;
};

export type VenueScene = {
  countByLevel: Record<string, number>;
  countByLayer: Record<string, number>;
  warnings: string[];
  setLevel: (levelKey: string | null) => void;
  setLayerVisible: (layerId: string, visible: boolean) => void;
  frame: () => Promise<void>;
  destroy: () => void;
};

type LevelTileset = { levelKey: string | null; tileset: CesiumTileset };
type LayerEntities = { layer: VenueLayer; dataSource: CesiumDataSource; entities: CesiumEntity[] };

type StyleContext = {
  source: VenueSource;
  lang: "en" | "ja";
  groundHeight: number;
  elevationByLevel: Map<string, number>;
};

function entityLevelKey(entity: CesiumEntity): string | null {
  const raw = entity.properties?.levelKey?.getValue();
  return raw == null ? null : String(raw);
}

function entityText(entity: CesiumEntity, key: string, lang: "en" | "ja"): string {
  const raw = entity.properties?.[key]?.getValue();
  if (raw == null) return "";
  if (typeof raw === "object") {
    const localized = raw as { en?: string; ja?: string };
    return localized[lang] ?? localized.en ?? localized.ja ?? "";
  }
  return String(raw);
}

export async function buildVenueScene(
  Cesium: CesiumApi,
  viewer: CesiumViewer,
  source: VenueSource,
  options: {
    lang: "en" | "ja";
    onSelect: (feature: VenueFeature | null) => void;
    isStale: () => boolean;
  },
): Promise<VenueScene> {
  const { manifest } = source;
  const { lang, onSelect, isStale } = options;
  const warnings: string[] = [];
  const tilesets: LevelTileset[] = [];
  const layers: LayerEntities[] = [];

  for (const building of manifest.buildings) {
    for (const ref of building.tilesets) {
      if (isStale()) break;
      try {
        const tileset = await Cesium.Cesium3DTileset.fromUrl(source.resolve(ref.uri));
        viewer.scene.primitives.add(tileset);
        tilesets.push({ levelKey: ref.levelKey, tileset });
      } catch {
        warnings.push(`${building.name}: ${ref.levelKey ?? "tiles"} could not be loaded.`);
      }
    }
  }

  if (tilesets.length === 0) {
    throw new Error("No tileset in this bundle could be loaded.");
  }

  const firstSphere = tilesets[0].tileset.boundingSphere;
  const sphereCarto = Cesium.Cartographic.fromCartesian(firstSphere.center);
  const groundHeight = sphereCarto ? sphereCarto.height - firstSphere.radius : 0;

  const elevationByLevel = new Map(
    manifest.levels.map((level) => [level.levelKey, level.levelElevationMeters]),
  );
  const styleContext: StyleContext = { source, lang, groundHeight, elevationByLevel };

  for (const layer of manifest.layers) {
    if (isStale()) break;
    try {
      const response = await fetch(source.resolve(layer.uri));
      if (!response.ok) throw new Error(String(response.status));
      const geojson: unknown = await response.json();
      const dataSource = await Cesium.GeoJsonDataSource.load(geojson, {
        clampToGround: false,
        markerSize: MARKER_PX,
      });
      for (const entity of dataSource.entities.values) {
        styleEntity(Cesium, entity, layer, styleContext);
      }
      await viewer.dataSources.add(dataSource);
      layers.push({ layer, dataSource, entities: [...dataSource.entities.values] });
    } catch {
      warnings.push(`${pickText(layer.name, lang)}: layer could not be loaded.`);
    }
  }

  const countByLevel: Record<string, number> = {};
  const countByLayer: Record<string, number> = {};
  for (const level of manifest.levels) countByLevel[level.levelKey] = 0;
  for (const entry of layers) {
    countByLayer[entry.layer.id] = entry.entities.length;
    for (const entity of entry.entities) {
      const key = entityLevelKey(entity);
      if (key !== null && key in countByLevel) countByLevel[key] += 1;
    }
  }

  let activeLevel: string | null = null;
  const hiddenLayers = new Set(
    manifest.layers.filter((layer) => !layer.defaultVisible).map((layer) => layer.id),
  );

  const apply = () => {
    for (const { levelKey, tileset } of tilesets) {
      tileset.show = activeLevel === null || levelKey === null || levelKey === activeLevel;
    }
    for (const { layer, entities } of layers) {
      const layerVisible = !hiddenLayers.has(layer.id);
      for (const entity of entities) {
        const key = entityLevelKey(entity);
        entity.show =
          layerVisible && (activeLevel === null || key === null || key === activeLevel);
      }
    }
    viewer.scene.requestRender();
  };

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event) => {
    const entity = viewer.scene.pick(event.position)?.id;
    const owner = entity ? layers.find((entry) => entry.entities.includes(entity)) : undefined;
    if (!entity || !owner) {
      onSelect(null);
      return;
    }
    onSelect({
      layerId: owner.layer.id,
      levelKey: entityLevelKey(entity),
      name: entityText(entity, "name", lang) || pickText(owner.layer.name, lang),
      symbolId: entityText(entity, "symbol_id", lang),
    });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  apply();

  return {
    countByLevel,
    countByLayer,
    warnings,
    setLevel: (levelKey) => {
      activeLevel = levelKey;
      apply();
    },
    setLayerVisible: (layerId, visible) => {
      if (visible) hiddenLayers.delete(layerId);
      else hiddenLayers.add(layerId);
      apply();
    },
    frame: async () => {
      const camera = manifest.camera;
      const target = tilesets[0].tileset;
      if (camera?.rangeMeters) {
        await viewer.zoomTo(
          target,
          new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(camera.heading ?? 0),
            Cesium.Math.toRadians(camera.pitch ?? -30),
            camera.rangeMeters,
          ),
        );
      } else {
        await viewer.zoomTo(target);
      }
      viewer.scene.requestRender();
    },
    destroy: () => {
      handler.destroy();
      for (const { dataSource } of layers) {
        viewer.dataSources.remove(dataSource, true);
      }
      for (const { tileset } of tilesets) {
        viewer.scene.primitives.remove(tileset);
      }
    },
  };
}

function styleEntity(
  Cesium: CesiumApi,
  entity: CesiumEntity,
  layer: VenueLayer,
  ctx: StyleContext,
): void {
  const { source, lang, groundHeight, elevationByLevel } = ctx;
  const color = layer.color ? Cesium.Color.fromCssColorString(layer.color) : undefined;

  if (layer.geometry !== "point") {
    if (entity.polyline && color) entity.polyline.material = color;
    if (entity.polygon && color) entity.polygon.material = color.withAlpha(0.35);
    return;
  }

  const levelKey = entityLevelKey(entity);
  const position = entity.position?.getValue();
  if (position) {
    const carto = Cesium.Cartographic.fromCartesian(position);
    // A 2D coordinate arrives at height 0; lift it to eye height on its own floor.
    if (carto && Math.abs(carto.height) < 0.001) {
      const elevation = levelKey === null ? 0 : (elevationByLevel.get(levelKey) ?? 0);
      carto.height = groundHeight + elevation + EYE_HEIGHT_METERS;
      // Cesium coerces a Cartesian3 assignment into a ConstantPositionProperty.
      entity.position = Cesium.Cartographic.toCartesian(
        carto,
      ) as unknown as CesiumEntity["position"];
    }
  }

  const image = entity.properties?.image?.getValue();
  if (entity.billboard && typeof image === "string" && image !== "") {
    entity.billboard.image = source.resolve(resolveIconUri(source.manifest, image));
    entity.billboard.width = MARKER_PX;
    entity.billboard.height = MARKER_PX;
    entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
    entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
    entity.billboard.scaleByDistance = new Cesium.NearFarScalar(20, 1, 220, 0.45);
  } else if (entity.billboard) {
    entity.billboard = undefined;
    entity.point = {
      pixelSize: 9,
      color: color ?? Cesium.Color.fromCssColorString("#c93a22"),
      outlineColor: Cesium.Color.fromCssColorString("#fcfaf3"),
      outlineWidth: 1.5,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };
  }

  const label = entityText(entity, "name", lang);
  if (label !== "") {
    entity.label = {
      text: label,
      font: "500 12px ui-sans-serif, system-ui, sans-serif",
      fillColor: Cesium.Color.fromCssColorString("#211f1c"),
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString("#fcfaf3").withAlpha(0.88),
      backgroundPadding: new Cesium.Cartesian2(6, 3),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -MARKER_PX - 4),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, LABEL_RANGE_METERS),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };
  }
}
