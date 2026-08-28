/**
 * Minimal structural types for the slice of CesiumJS this demo touches.
 * Cesium arrives as a CDN global with no shipped types, so the whole surface is
 * declared once here and every call site stays typed.
 */

export interface CesiumColor {
  withAlpha(alpha: number): CesiumColor;
}

export interface CesiumCartesian2 {
  x: number;
  y: number;
}

export interface CesiumCartesian3 {
  x: number;
  y: number;
  z: number;
}

export interface CesiumCartographic {
  longitude: number;
  latitude: number;
  height: number;
}

export interface CesiumBoundingSphere {
  center: CesiumCartesian3;
  radius: number;
}

export interface CesiumEvent<T> {
  addEventListener(listener: (value: T) => void): () => void;
}

export interface CesiumTileset {
  show: boolean;
  boundingSphere: CesiumBoundingSphere;
  tileFailed?: CesiumEvent<{ url?: string; message?: string }>;
  destroy?(): void;
  isDestroyed?(): boolean;
}

export interface CesiumProperty<T = unknown> {
  getValue(time?: unknown): T;
}

export interface CesiumBillboardGraphics {
  image?: string;
  width?: number;
  height?: number;
  verticalOrigin?: unknown;
  disableDepthTestDistance?: number;
  scaleByDistance?: unknown;
  color?: unknown;
}

export interface CesiumEntity {
  id: string;
  show: boolean;
  properties?: Record<string, CesiumProperty | undefined>;
  position?: CesiumProperty<CesiumCartesian3 | undefined>;
  billboard?: CesiumBillboardGraphics;
  point?: Record<string, unknown>;
  label?: Record<string, unknown>;
  polyline?: { material?: unknown };
  polygon?: { material?: unknown };
}

export interface CesiumDataSource {
  entities: { values: CesiumEntity[] };
}

export interface CesiumScreenSpaceCameraController {
  enableCollisionDetection: boolean;
  minimumZoomDistance: number;
}

export interface CesiumScene {
  globe: { show: boolean; depthTestAgainstTerrain: boolean };
  backgroundColor: CesiumColor;
  sun?: { show: boolean };
  moon?: { show: boolean };
  fog?: { enabled: boolean };
  skyAtmosphere?: { show: boolean };
  skyBox?: { show: boolean };
  light?: unknown;
  canvas: HTMLCanvasElement;
  primitives: {
    add(primitive: CesiumTileset): CesiumTileset;
    remove(primitive: CesiumTileset): boolean;
  };
  screenSpaceCameraController: CesiumScreenSpaceCameraController;
  pick(position: CesiumCartesian2): { id?: CesiumEntity } | undefined;
  requestRender(): void;
}

export interface CesiumViewer {
  scene: CesiumScene;
  dataSources: {
    add(dataSource: CesiumDataSource): Promise<CesiumDataSource>;
    remove(dataSource: CesiumDataSource, destroy?: boolean): boolean;
  };
  creditDisplay?: { container?: HTMLElement };
  zoomTo(target: CesiumTileset, offset?: unknown): Promise<boolean>;
  isDestroyed?(): boolean;
  destroy(): void;
}

export interface CesiumViewerOptions {
  animation: boolean;
  timeline: boolean;
  geocoder: boolean;
  homeButton: boolean;
  sceneModePicker: boolean;
  baseLayerPicker: boolean;
  navigationHelpButton: boolean;
  fullscreenButton: boolean;
  infoBox: boolean;
  selectionIndicator: boolean;
  vrButton: boolean;
  shouldAnimate: boolean;
  baseLayer: boolean;
  skyBox: boolean;
  skyAtmosphere: boolean;
  creditContainer: HTMLElement;
  requestRenderMode: boolean;
}

export interface CesiumScreenSpaceEventHandler {
  setInputAction(action: (event: { position: CesiumCartesian2 }) => void, type: number): void;
  destroy(): void;
}

export interface CesiumApi {
  Ion: { defaultAccessToken: string };
  Viewer: new (container: HTMLElement, options: CesiumViewerOptions) => CesiumViewer;
  Color: { fromCssColorString(css: string): CesiumColor };
  Cartesian2: new (x: number, y: number) => CesiumCartesian2;
  Cartesian3: new (x: number, y: number, z: number) => CesiumCartesian3;
  Cartographic: {
    fromCartesian(position: CesiumCartesian3): CesiumCartographic | undefined;
    toCartesian(cartographic: CesiumCartographic): CesiumCartesian3;
  };
  Cesium3DTileset: { fromUrl(url: string): Promise<CesiumTileset> };
  GeoJsonDataSource: {
    load(data: unknown, options?: Record<string, unknown>): Promise<CesiumDataSource>;
  };
  ScreenSpaceEventHandler: new (canvas: HTMLCanvasElement) => CesiumScreenSpaceEventHandler;
  ScreenSpaceEventType: { LEFT_CLICK: number };
  VerticalOrigin: { BOTTOM: unknown };
  NearFarScalar: new (near: number, nearValue: number, far: number, farValue: number) => unknown;
  DistanceDisplayCondition: new (near: number, far: number) => unknown;
  HeadingPitchRange: new (heading: number, pitch: number, range: number) => unknown;
  JulianDate: { now(): unknown };
  DirectionalLight: new (options: { direction: CesiumCartesian3; intensity: number }) => unknown;
  Math: { toRadians(degrees: number): number };
}
