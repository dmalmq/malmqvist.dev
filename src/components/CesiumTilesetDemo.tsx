import { useEffect, useRef, useState } from "react";
import type { CesiumApi, CesiumViewer } from "../lib/cesiumApi";
import {
  describeLocalFolder,
  getFilesFromDirectoryHandle,
  isFileSystemAccessSupported,
  prepareLocalVenue,
  type LocalVenueHandle,
} from "../lib/localTileset";
import { loadCesium, PUBLIC_SAMPLE_VENUE } from "../lib/loadCesium";
import {
  loadVenueFromUrl,
  pickText,
  type VenueLayer,
  type VenueLevel,
} from "../lib/venueBundle";
import { buildVenueScene, type VenueFeature, type VenueScene } from "../lib/venueScene";

type Lang = "en" | "ja";
type Dataset = "sample" | "local";
type Status = "idle" | "loading" | "ready" | "error";

const copy = {
  en: {
    label: "Live demo",
    title: "Read-only 3D Tiles viewer",
    blurb:
      "Cesium stays off until you ask for it. The default dataset is a tiny made-up indoor sample hosted on this site — not a JR station, not a workplace, not client data.",
    dataset: "Dataset",
    sample: "Public sample (default)",
    sampleHint: "Synthetic two-storey venue with levels, layers, and markers.",
    local: "Files already on this device",
    localHint:
      "Folder picker only. Tiles stay in this browser — no upload, no publish, no CDN.",
    chooseFolder: "Choose folder",
    changeFolder: "Change folder",
    noFolder: "No folder selected",
    load: "Load 3D viewer",
    loading: "Loading viewer…",
    readySample: "Synthetic indoor sample loaded. Pick a level or click a marker.",
    readyLocal: "Local venue loaded in this browser only.",
    attribution:
      "Dataset: synthetic indoor sample generated for this page. Invented geometry, invented markers, not a real building.",
    localAttribution:
      "Dataset: files from this device, rewritten to blob URLs in this browser. Nothing was uploaded, published, or stored on the site.",
    error: "Could not load the venue.",
    fsaFallback: "This browser will use the folder file picker.",
    localPrivacy:
      "Local tiles never leave the device. Use this to show a JR station bundle already on the laptop — do not put those models on the public internet.",
    levels: "Levels",
    allLevels: "All levels",
    layers: "Layers",
    noLayers: "This bundle has no layers.",
    selected: "Selected",
    selectHint: "Click a marker to read its label.",
    partial: "Some parts of this bundle could not be loaded.",
  },
  ja: {
    label: "ライブデモ",
    title: "読み取り専用 3D Tiles ビューア",
    blurb:
      "Cesiumは指示があるまで起動しません。初期データは本サイトでホストしている小さな架空の屋内サンプルです。JR駅・職場・クライアントデータではありません。",
    dataset: "データセット",
    sample: "公開サンプル（初期値）",
    sampleHint: "フロア・レイヤー・マーカー付きの、2階建て合成会場。",
    local: "この端末上のファイル",
    localHint:
      "フォルダ選択のみ。タイルはこのブラウザ内に留まり、アップロード・公開・CDN送信はしません。",
    chooseFolder: "フォルダを選ぶ",
    changeFolder: "フォルダを変更",
    noFolder: "フォルダ未選択",
    load: "3Dビューアを読み込む",
    loading: "ビューアを読み込み中…",
    readySample: "合成屋内サンプルを読み込みました。フロア切替やマーカーを試せます。",
    readyLocal: "ローカルの会場データを、このブラウザ内だけで読み込みました。",
    attribution:
      "データセット：このページ用に生成した合成屋内サンプル。実在の建物・地物ではありません。",
    localAttribution:
      "データセット：この端末のファイルを、ブラウザ内のblob URLとして読み込みました。アップロード・公開・サイトへの保存はしていません。",
    error: "会場データを読み込めませんでした。",
    fsaFallback: "このブラウザではフォルダのファイルピッカーを使います。",
    localPrivacy:
      "ローカルのタイルが端末の外に出ることはありません。ノートPC上のJR駅バンドルをその場で見せる用途です。公開インターネットには置かないでください。",
    levels: "フロア",
    allLevels: "全フロア",
    layers: "レイヤー",
    noLayers: "このバンドルにレイヤーはありません。",
    selected: "選択中",
    selectHint: "マーカーをクリックすると名称が表示されます。",
    partial: "一部のデータを読み込めませんでした。",
  },
};

function pickFolderWithInput(): Promise<File[]> {
  const { promise, resolve, reject } = Promise.withResolvers<File[]>();
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.setAttribute("webkitdirectory", "");
  input.setAttribute("directory", "");
  input.style.display = "none";
  input.addEventListener("change", () => {
    const files = Array.from(input.files ?? []);
    input.remove();
    if (!files.length) {
      reject(new DOMException("No files selected", "AbortError"));
      return;
    }
    resolve(files);
  });
  input.addEventListener("cancel", () => {
    input.remove();
    reject(new DOMException("The user aborted a request.", "AbortError"));
  });
  document.body.appendChild(input);
  input.click();
  return promise;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function pickLocalFolder(): Promise<File[]> {
  if (!isFileSystemAccessSupported()) {
    return pickFolderWithInput();
  }
  let handle: FileSystemDirectoryHandle;
  try {
    handle = await window.showDirectoryPicker!({ mode: "read" });
  } catch (error) {
    if (isAbortError(error)) throw error;
    return pickFolderWithInput();
  }
  const files = await getFilesFromDirectoryHandle(handle);
  if (!files.length) throw new Error("No files selected.");
  return files;
}

export default function CesiumTilesetDemo({ lang = "en" }: { lang?: Lang }) {
  const t = copy[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer | null>(null);
  const sceneRef = useRef<VenueScene | null>(null);
  const localHandleRef = useRef<LocalVenueHandle | null>(null);
  const localFilesRef = useRef<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadIdRef = useRef(0);
  const mountedRef = useRef(true);

  const [dataset, setDataset] = useState<Dataset>("sample");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [localLabel, setLocalLabel] = useState("");
  const [hasLocalFiles, setHasLocalFiles] = useState(false);
  const [hasScene, setHasScene] = useState(false);
  const [levels, setLevels] = useState<VenueLevel[]>([]);
  const [layers, setLayers] = useState<VenueLayer[]>([]);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<string[]>([]);
  const [countByLevel, setCountByLevel] = useState<Record<string, number>>({});
  const [countByLayer, setCountByLayer] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<VenueFeature | null>(null);
  const [partial, setPartial] = useState(false);

  const isCurrentLoad = (loadId: number) =>
    mountedRef.current && loadId === loadIdRef.current;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadIdRef.current += 1;
      const viewer = viewerRef.current;
      if (viewer && !viewer.isDestroyed?.()) {
        viewer.destroy();
      }
      viewerRef.current = null;
      sceneRef.current = null;
      localHandleRef.current?.cleanup();
      localHandleRef.current = null;
    };
  }, []);

  const rememberLocalFiles = (files: File[]) => {
    localFilesRef.current = files;
    setHasLocalFiles(true);
    setLocalLabel(describeLocalFolder(files));
  };

  const reportCaught = (caught: unknown) => {
    if (isAbortError(caught)) return;
    setError(caught instanceof Error ? caught.message : t.error);
    setStatus(sceneRef.current ? "ready" : "error");
  };

  const ensureViewer = async (Cesium: CesiumApi, loadId: number) => {
    if (!isCurrentLoad(loadId)) return null;
    const live = viewerRef.current;
    if (live && !live.isDestroyed?.()) return live;

    const container = containerRef.current;
    if (!container) throw new Error("Missing viewer container");

    Cesium.Ion.defaultAccessToken = "";
    const creditContainer = document.createElement("div");
    creditContainer.hidden = true;

    const viewer = new Cesium.Viewer(container, {
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: true,
      infoBox: false,
      selectionIndicator: false,
      vrButton: false,
      shouldAnimate: false,
      baseLayer: false,
      skyBox: false,
      skyAtmosphere: false,
      creditContainer,
      requestRenderMode: false,
    });

    if (!isCurrentLoad(loadId)) {
      if (!viewer.isDestroyed?.()) viewer.destroy();
      return null;
    }
    viewerRef.current = viewer;

    const scene = viewer.scene;
    scene.globe.show = false;
    scene.globe.depthTestAgainstTerrain = false;
    scene.backgroundColor = Cesium.Color.fromCssColorString("#171512");
    if (scene.sun) scene.sun.show = false;
    if (scene.moon) scene.moon.show = false;
    if (scene.fog) scene.fog.enabled = false;
    if (scene.skyAtmosphere) scene.skyAtmosphere.show = false;
    if (scene.skyBox) scene.skyBox.show = false;
    scene.screenSpaceCameraController.enableCollisionDetection = false;
    scene.screenSpaceCameraController.minimumZoomDistance = 1;
    if (viewer.creditDisplay?.container) {
      viewer.creditDisplay.container.style.display = "none";
    }
    scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(0.35, 0.25, -1),
      intensity: 2.2,
    });

    return viewer;
  };

  const adoptScene = (
    scene: VenueScene,
    nextLevels: VenueLevel[],
    nextLayers: VenueLayer[],
  ) => {
    sceneRef.current?.destroy();
    sceneRef.current = scene;
    setLevels(nextLevels);
    setLayers(nextLayers);
    setActiveLevel(null);
    setHiddenLayers(nextLayers.filter((l) => !l.defaultVisible).map((l) => l.id));
    setCountByLevel(scene.countByLevel);
    setCountByLayer(scene.countByLayer);
    setPartial(scene.warnings.length > 0);
    setSelected(null);
    setHasScene(true);
  };

  const loadDataset = async (next: Dataset, files?: File[]): Promise<boolean> => {
    const loadId = ++loadIdRef.current;
    setStatus("loading");
    setError("");

    const Cesium = await loadCesium();
    if (!isCurrentLoad(loadId)) return false;
    const viewer = await ensureViewer(Cesium, loadId);
    if (!isCurrentLoad(loadId) || !viewer) return false;

    const local = localHandleRef.current;

    if (next === "sample") {
      // A local folder's blob redirect suffix-matches same-origin paths such as
      // /demos/.../venue.json, so it must be off before the sample is fetched.
      local?.detach();
      let scene: VenueScene;
      try {
        const source = await loadVenueFromUrl(PUBLIC_SAMPLE_VENUE);
        scene = await buildVenueScene(Cesium, viewer, source, {
          lang,
          onSelect: (feature) => {
            if (mountedRef.current) setSelected(feature);
          },
          isStale: () => !isCurrentLoad(loadId),
        });
        if (!isCurrentLoad(loadId)) {
          scene.destroy();
          local?.attach();
          return false;
        }
        adoptScene(scene, source.manifest.levels, source.manifest.layers);
      } catch (caught) {
        local?.attach();
        throw caught;
      }
      if (localHandleRef.current === local) localHandleRef.current = null;
      local?.cleanup();
      await scene.frame();
      setStatus("ready");
      return true;
    }

    const selectedFiles = files ?? localFilesRef.current;
    if (!selectedFiles?.length) {
      throw new Error("No files selected.");
    }

    const handle = await prepareLocalVenue(selectedFiles);
    if (!isCurrentLoad(loadId)) {
      handle.cleanup();
      return false;
    }
    let scene: VenueScene;
    try {
      scene = await buildVenueScene(Cesium, viewer, handle.source, {
        lang,
        onSelect: (feature) => {
          if (mountedRef.current) setSelected(feature);
        },
        isStale: () => !isCurrentLoad(loadId),
      });
    } catch (caught) {
      handle.cleanup();
      throw caught;
    }
    if (!isCurrentLoad(loadId)) {
      scene.destroy();
      handle.cleanup();
      return false;
    }
    adoptScene(scene, handle.source.manifest.levels, handle.source.manifest.layers);
    const previous = localHandleRef.current;
    localHandleRef.current = handle;
    if (previous !== handle) previous?.cleanup();
    await scene.frame();
    setStatus("ready");
    return true;
  };

  const commitDataset = (next: Dataset) => setDataset(next);

  const chooseFolder = async () => {
    setError("");
    try {
      const files = await pickLocalFolder();
      if (!viewerRef.current) {
        rememberLocalFiles(files);
        commitDataset("local");
        return;
      }
      if (await loadDataset("local", files)) {
        rememberLocalFiles(files);
        commitDataset("local");
      }
    } catch (caught) {
      reportCaught(caught);
    }
  };

  const onFallbackFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    try {
      if (await loadDataset("local", files)) {
        rememberLocalFiles(files);
        commitDataset("local");
      }
    } catch (caught) {
      reportCaught(caught);
    }
  };

  const onLoadClick = async () => {
    try {
      if (dataset === "local" && !localFilesRef.current?.length) {
        const files = await pickLocalFolder();
        if (await loadDataset("local", files)) rememberLocalFiles(files);
        return;
      }
      await loadDataset(dataset);
    } catch (caught) {
      if (isAbortError(caught)) {
        setStatus("idle");
        return;
      }
      setError(caught instanceof Error ? caught.message : t.error);
      setStatus(hasScene ? "ready" : "error");
    }
  };

  const onDatasetChange = async (next: Dataset) => {
    if (next === dataset) return;
    if (next === "local" && !localFilesRef.current?.length) {
      await chooseFolder();
      return;
    }
    if (!viewerRef.current) {
      commitDataset(next);
      return;
    }
    try {
      if (await loadDataset(next)) commitDataset(next);
    } catch (caught) {
      reportCaught(caught);
    }
  };

  const onLevelChange = (levelKey: string | null) => {
    setActiveLevel(levelKey);
    setSelected(null);
    sceneRef.current?.setLevel(levelKey);
  };

  const onLayerToggle = (layerId: string) => {
    const nextHidden = hiddenLayers.includes(layerId)
      ? hiddenLayers.filter((id) => id !== layerId)
      : [...hiddenLayers, layerId];
    setHiddenLayers(nextHidden);
    sceneRef.current?.setLayerVisible(layerId, !nextHidden.includes(layerId));
  };

  const showIdleOverlay = !hasScene && status !== "loading";
  const statusText =
    status === "loading"
      ? t.loading
      : status === "ready"
        ? dataset === "sample"
          ? t.readySample
          : t.readyLocal
        : null;
  const jaFont = lang === "ja" ? { fontFamily: "'Noto Sans JP', sans-serif" } : undefined;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="border-b border-[var(--color-border)] px-5 py-5 md:px-6">
        <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-secondary)]">
          {t.label}
        </p>
        <p
          className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-text-heading)] md:text-2xl"
          style={jaFont}
        >
          {t.title}
        </p>
        <p
          className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)] md:text-base"
          style={jaFont}
        >
          {t.blurb}
        </p>

        <fieldset className="mt-5">
          <legend className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-secondary)]">
            {t.dataset}
          </legend>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <DatasetOption
              value="sample"
              checked={dataset === "sample"}
              title={t.sample}
              hint={t.sampleHint}
              onPick={() => void onDatasetChange("sample")}
            />
            <DatasetOption
              value="local"
              checked={dataset === "local"}
              title={t.local}
              hint={t.localHint}
              onPick={() => void onDatasetChange("local")}
            />
          </div>
        </fieldset>

        {dataset === "local" && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void chooseFolder()}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
            >
              {hasLocalFiles ? t.changeFolder : t.chooseFolder}
            </button>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {hasLocalFiles ? localLabel : t.noFolder}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(event) => void onFallbackFiles(event)}
              {...{ webkitdirectory: "", directory: "" }}
            />
            {!isFileSystemAccessSupported() && (
              <p className="w-full text-xs text-[var(--color-text-secondary)]">{t.fsaFallback}</p>
            )}
            <p className="w-full text-xs leading-5 text-[var(--color-text-secondary)]">
              {t.localPrivacy}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[16rem_1fr]">
        {hasScene && (
          <aside
            className="order-2 border-t border-[var(--color-border)] px-5 py-5 md:order-1 md:border-r md:border-t-0"
            style={jaFont}
          >
            {levels.length > 1 && (
              <section>
                <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-secondary)]">
                  {t.levels}
                </p>
                <div className="mt-3 flex flex-col-reverse gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  {levels.map((level) => (
                    <button
                      key={level.levelKey}
                      type="button"
                      onClick={() => onLevelChange(level.levelKey)}
                      aria-pressed={activeLevel === level.levelKey}
                      className={`flex items-baseline justify-between gap-3 px-3 py-2.5 text-left transition-colors ${
                        activeLevel === level.levelKey
                          ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                          : "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
                      }`}
                    >
                      <span className="font-mono text-sm font-semibold">{level.levelName}</span>
                      <span className="font-mono text-[0.6875rem] opacity-75">
                        {level.levelElevationMeters >= 0 ? "+" : ""}
                        {level.levelElevationMeters.toFixed(1)} m
                      </span>
                      <span className="ml-auto font-mono text-[0.6875rem] opacity-75">
                        {countByLevel[level.levelKey] ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onLevelChange(null)}
                  aria-pressed={activeLevel === null}
                  className={`mt-2 w-full rounded-[var(--radius-sm)] px-3 py-1.5 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] transition-colors ${
                    activeLevel === null
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {t.allLevels}
                </button>
              </section>
            )}

            <section className={levels.length > 1 ? "mt-6" : ""}>
              <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-secondary)]">
                {t.layers}
              </p>
              {layers.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t.noLayers}</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {layers.map((layer) => (
                    <li key={layer.id}>
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--color-text-primary)]">
                        <input
                          type="checkbox"
                          checked={!hiddenLayers.includes(layer.id)}
                          onChange={() => onLayerToggle(layer.id)}
                        />
                        <span
                          aria-hidden="true"
                          className="inline-block h-3 w-3 shrink-0 rounded-full border-2"
                          style={{ borderColor: layer.color ?? "var(--color-accent)" }}
                        />
                        <span className="flex-1">{pickText(layer.name, lang)}</span>
                        <span className="font-mono text-[0.6875rem] text-[var(--color-text-secondary)]">
                          {countByLayer[layer.id] ?? 0}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-6">
              <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-secondary)]">
                {t.selected}
              </p>
              {selected ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-[var(--color-text-heading)]">
                    {selected.name}
                  </p>
                  <p className="mt-1 font-mono text-[0.6875rem] text-[var(--color-text-secondary)]">
                    {[selected.levelKey, selected.symbolId].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t.selectHint}</p>
              )}
            </section>
          </aside>
        )}

        <div className="relative order-1 h-[32rem] bg-[#171512] md:order-2 md:h-[40rem]">
          <div
            ref={containerRef}
            className="cesium-tileset-demo-root absolute inset-0"
            data-cesium-root="true"
          />

          {showIdleOverlay && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-[color:color-mix(in_srgb,#171512_88%,transparent)] px-6 text-center">
              <SyntheticPoster />
              <button
                type="button"
                onClick={() => void onLoadClick()}
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold tracking-[0.02em] text-[var(--color-primary-foreground)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]"
              >
                {t.load}
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[color:color-mix(in_srgb,#171512_55%,transparent)]">
              <p className="text-sm font-medium text-[#f6f3ec]">{t.loading}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] px-5 py-4 md:px-6">
        {error && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {error}
          </p>
        )}
        {statusText && !error && (
          <p className="text-sm text-[var(--color-text-secondary)]">{statusText}</p>
        )}
        {partial && !error && (
          <p className="mt-1 text-sm text-[var(--color-warning)]">{t.partial}</p>
        )}
        <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
          {dataset === "local" && hasLocalFiles ? t.localAttribution : t.attribution}
        </p>
        {!hasScene && (
          <p className="sr-only">
            Cesium has not started. WebGL will not initialize until the load control is used.
          </p>
        )}
      </div>
    </div>
  );
}

function DatasetOption({
  value,
  checked,
  title,
  hint,
  onPick,
}: {
  value: Dataset;
  checked: boolean;
  title: string;
  hint: string;
  onPick: () => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 has-[:checked]:border-[var(--color-accent)]">
      <input
        type="radio"
        name="tileset-dataset"
        value={value}
        checked={checked}
        onClick={(event) => {
          event.preventDefault();
          if (!checked) onPick();
        }}
        onChange={(event) => event.preventDefault()}
        className="mt-1"
      />
      <span>
        <span className="block text-sm font-semibold text-[var(--color-text-heading)]">{title}</span>
        <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{hint}</span>
      </span>
    </label>
  );
}

function SyntheticPoster() {
  return (
    <svg viewBox="0 0 280 160" className="h-28 w-auto text-[#f6f3ec] opacity-80" aria-hidden="true">
      <rect x="18" y="18" width="110" height="124" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="152" y="18" width="110" height="124" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 80h110M152 80h110M73 18v124M207 18v124" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <rect x="34" y="34" width="22" height="28" fill="#c93a22" opacity="0.9" />
      <text x="73" y="148" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="ui-monospace, monospace">
        1F
      </text>
      <text x="207" y="148" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="ui-monospace, monospace">
        2F
      </text>
    </svg>
  );
}
