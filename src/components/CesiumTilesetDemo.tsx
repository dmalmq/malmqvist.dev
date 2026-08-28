import { useEffect, useRef, useState } from "react";
import {
  describeLocalFolder,
  getFilesFromDirectoryHandle,
  isFileSystemAccessSupported,
  prepareLocalTileset,
  type LocalTilesetHandle,
} from "../lib/localTileset";
import { loadCesium, PUBLIC_SAMPLE_TILESET } from "../lib/loadCesium";

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
    sampleHint: "Synthetic two-storey indoor tileset, same-origin on this site.",
    local: "Files already on this device",
    localHint:
      "Folder picker only. Tiles stay in this browser — no upload, no publish, no CDN.",
    chooseFolder: "Choose folder",
    changeFolder: "Change folder",
    noFolder: "No folder selected",
    load: "Load 3D viewer",
    loading: "Loading viewer…",
    loadingTiles: "Loading tileset…",
    readySample: "Synthetic indoor sample loaded. Orbit to look through the rooms.",
    readyLocal: "Local tileset loaded in this browser only.",
    attribution:
      "Dataset: synthetic indoor sample generated for this page. Invented geometry, not a real building.",
    localAttribution:
      "Dataset: files from this device, rewritten to blob URLs in this browser. Nothing was uploaded, published, or stored on the site.",
    error: "Could not load the tileset.",
    fsaFallback: "This browser will use the folder file picker.",
    localPrivacy:
      "Local tiles never leave the device. Use this to show a JR station tileset already on the laptop — do not put those models on the public internet.",
  },
  ja: {
    label: "ライブデモ",
    title: "読み取り専用 3D Tiles ビューア",
    blurb:
      "Cesiumは指示があるまで起動しません。初期データは本サイトでホストしている小さな架空の屋内サンプルです。JR駅・職場・クライアントデータではありません。",
    dataset: "データセット",
    sample: "公開サンプル（初期値）",
    sampleHint: "同オリジンで配信する、2フロアの合成屋内タイルセット。",
    local: "この端末上のファイル",
    localHint:
      "フォルダ選択のみ。タイルはこのブラウザ内に留まり、アップロード・公開・CDN送信はしません。",
    chooseFolder: "フォルダを選ぶ",
    changeFolder: "フォルダを変更",
    noFolder: "フォルダ未選択",
    load: "3Dビューアを読み込む",
    loading: "ビューアを読み込み中…",
    loadingTiles: "タイルセットを読み込み中…",
    readySample: "合成屋内サンプルを読み込みました。オービット操作で部屋を見られます。",
    readyLocal: "ローカルのタイルセットを、このブラウザ内だけで読み込みました。",
    attribution:
      "データセット：このページ用に生成した合成屋内サンプル。実在の建物ではありません。",
    localAttribution:
      "データセット：この端末のファイルを、ブラウザ内のblob URLとして読み込みました。アップロード・公開・サイトへの保存はしていません。",
    error: "タイルセットを読み込めませんでした。",
    fsaFallback: "このブラウザではフォルダのファイルピッカーを使います。",
    localPrivacy:
      "ローカルのタイルが端末の外に出ることはありません。ノートPC上のJR駅タイルセットをその場で見せる用途です。公開インターネットには置かないでください。",
  },
};

function pickFolderWithInput(): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
    input.style.display = "none";
    const cleanup = () => input.remove();
    input.addEventListener("change", () => {
      const files = Array.from(input.files ?? []);
      cleanup();
      if (!files.length) {
        reject(new DOMException("No files selected", "AbortError"));
        return;
      }
      resolve(files);
    });
    input.addEventListener("cancel", () => {
      cleanup();
      reject(new DOMException("The user aborted a request.", "AbortError"));
    });
    document.body.appendChild(input);
    input.click();
  });
}

async function pickLocalFolder(): Promise<File[]> {
  if (isFileSystemAccessSupported()) {
    try {
      const handle = await window.showDirectoryPicker!({ mode: "read" });
      return await getFilesFromDirectoryHandle(handle);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
    }
  }
  return pickFolderWithInput();
}

export default function CesiumTilesetDemo({ lang = "en" }: { lang?: Lang }) {
  const t = copy[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const tilesetRef = useRef<any>(null);
  const localHandleRef = useRef<LocalTilesetHandle | null>(null);
  const localFilesRef = useRef<File[] | null>(null);
  const datasetRef = useRef<Dataset>("sample");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadIdRef = useRef(0);
  const mountedRef = useRef(true);

  const [dataset, setDataset] = useState<Dataset>("sample");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [localLabel, setLocalLabel] = useState("");
  const [hasLocalFiles, setHasLocalFiles] = useState(false);
  const [booted, setBooted] = useState(false);

  datasetRef.current = dataset;

  const isCurrentLoad = (loadId: number) =>
    mountedRef.current && loadId === loadIdRef.current;

  const discardTileset = (viewer: any, tileset: any) => {
    if (!tileset) return;
    try {
      if (viewer && !viewer.isDestroyed?.()) {
        viewer.scene.primitives.remove(tileset);
      }
    } catch {
      // Viewer may already be torn down.
    }
    try {
      tileset.destroy?.();
    } catch {
      // Ignore tilesets that have already been destroyed.
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadIdRef.current += 1;
      localHandleRef.current?.cleanup();
      localHandleRef.current = null;
      const viewer = viewerRef.current;
      if (viewer && !viewer.isDestroyed?.()) {
        viewer.destroy();
      }
      viewerRef.current = null;
      tilesetRef.current = null;
    };
  }, []);

  const rememberLocalFiles = (files: File[]) => {
    localFilesRef.current = files;
    setHasLocalFiles(true);
    setLocalLabel(describeLocalFolder(files));
  };

  const chooseFolder = async () => {
    setError("");
    try {
      if (isFileSystemAccessSupported()) {
        try {
          const handle = await window.showDirectoryPicker!({ mode: "read" });
          const files = await getFilesFromDirectoryHandle(handle);
          rememberLocalFiles(files);
          if (viewerRef.current) {
            await loadDataset("local", files);
          }
          return;
        } catch (caught) {
          if (caught instanceof DOMException && caught.name === "AbortError") return;
        }
      }
      fileInputRef.current?.click();
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : t.error);
      setStatus((prev) => (viewerRef.current ? "ready" : "error"));
    }
  };

  const onFallbackFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    rememberLocalFiles(files);
    if (viewerRef.current) {
      try {
        await loadDataset("local", files);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t.error);
        setStatus("error");
      }
    }
  };

  const ensureViewer = async (Cesium: any, loadId: number) => {
    if (!isCurrentLoad(loadId)) return null;
    if (viewerRef.current && !viewerRef.current.isDestroyed?.()) {
      return viewerRef.current;
    }
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
    setBooted(true);

    try {
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
      try {
        scene.light = new Cesium.DirectionalLight({
          direction: new Cesium.Cartesian3(0.35, 0.25, -1),
          intensity: 2.2,
        });
      } catch {
        // Default lighting is fine if DirectionalLight is unavailable.
      }
    } catch {
      if (!isCurrentLoad(loadId)) return null;
      throw new Error("Failed to configure Cesium viewer");
    }

    if (!isCurrentLoad(loadId) || viewer.isDestroyed?.()) {
      if (viewerRef.current === viewer) viewerRef.current = null;
      if (!viewer.isDestroyed?.()) viewer.destroy();
      return null;
    }

    return viewer;
  };

  const replaceTileset = async (Cesium: any, url: string, loadId: number) => {
    const viewer = await ensureViewer(Cesium, loadId);
    if (!viewer || !isCurrentLoad(loadId)) return null;

    const tileset = await Cesium.Cesium3DTileset.fromUrl(url);
    if (!isCurrentLoad(loadId) || viewer.isDestroyed?.()) {
      discardTileset(viewer, tileset);
      return null;
    }

    if (tileset.tileFailed) {
      tileset.tileFailed.addEventListener((failed: { url?: string; message?: string }) => {
        console.warn("3D Tiles content failed", failed?.url, failed?.message);
      });
    }

    if (tilesetRef.current) {
      viewer.scene.primitives.remove(tilesetRef.current);
      try {
        tilesetRef.current.destroy?.();
      } catch {
        // Previous tileset may already be gone.
      }
      tilesetRef.current = null;
    }

    viewer.scene.primitives.add(tileset);
    tilesetRef.current = tileset;

    if (!isCurrentLoad(loadId) || viewer.isDestroyed?.()) {
      discardTileset(viewer, tileset);
      if (tilesetRef.current === tileset) tilesetRef.current = null;
      return null;
    }

    await viewer.zoomTo(tileset);
    if (!isCurrentLoad(loadId) || viewer.isDestroyed?.()) {
      discardTileset(viewer, tileset);
      if (tilesetRef.current === tileset) tilesetRef.current = null;
      return null;
    }
    viewer.scene.requestRender();
    return tileset;
  };

  const loadDataset = async (next: Dataset, files?: File[]) => {
    const loadId = ++loadIdRef.current;
    setStatus("loading");
    setError("");
    try {
      const Cesium = await loadCesium();
      if (!isCurrentLoad(loadId)) return;

      const viewer = await ensureViewer(Cesium, loadId);
      if (!isCurrentLoad(loadId) || !viewer) return;

      if (next === "sample") {
        localHandleRef.current?.cleanup();
        localHandleRef.current = null;
        const tileset = await replaceTileset(Cesium, PUBLIC_SAMPLE_TILESET, loadId);
        if (!isCurrentLoad(loadId) || !tileset) return;
        setStatus("ready");
        return;
      }

      const selected = files ?? localFilesRef.current;
      if (!selected?.length) {
        if (!isCurrentLoad(loadId)) return;
        setStatus(viewerRef.current ? "ready" : "idle");
        return;
      }

      const handle = await prepareLocalTileset(selected);
      if (!isCurrentLoad(loadId)) {
        handle.cleanup();
        return;
      }
      localHandleRef.current?.cleanup();
      localHandleRef.current = handle;
      const tileset = await replaceTileset(Cesium, handle.url, loadId);
      if (!isCurrentLoad(loadId) || !tileset) return;
      setStatus("ready");
    } catch (caught) {
      if (!isCurrentLoad(loadId)) return;
      throw caught;
    }
  };

  const onLoadClick = async () => {
    try {
      if (dataset === "local" && !localFilesRef.current?.length) {
        const files = await pickLocalFolder();
        rememberLocalFiles(files);
        await loadDataset("local", files);
        return;
      }
      await loadDataset(dataset);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError(caught instanceof Error ? caught.message : t.error);
      setStatus("error");
    }
  };

  const onDatasetChange = async (next: Dataset) => {
    setDataset(next);
    datasetRef.current = next;
    if (!viewerRef.current) return;
    try {
      if (next === "local" && !localFilesRef.current?.length) {
        await chooseFolder();
        return;
      }
      await loadDataset(next);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : t.error);
      setStatus("error");
    }
  };

  const showIdleOverlay = !booted && status !== "loading";
  const statusText =
    status === "loading"
      ? viewerRef.current
        ? t.loadingTiles
        : t.loading
      : status === "ready"
        ? dataset === "sample"
          ? t.readySample
          : t.readyLocal
        : null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="border-b border-[var(--color-border)] px-5 py-5 md:px-6">
        <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-secondary)]">
          {t.label}
        </p>
        <p
          className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-text-heading)] md:text-2xl"
          style={lang === "ja" ? { fontFamily: "'Noto Sans JP', sans-serif" } : undefined}
        >
          {t.title}
        </p>
        <p
          className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)] md:text-base"
          style={lang === "ja" ? { fontFamily: "'Noto Sans JP', sans-serif" } : undefined}
        >
          {t.blurb}
        </p>

        <fieldset className="mt-5">
          <legend className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-secondary)]">
            {t.dataset}
          </legend>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 has-[:checked]:border-[var(--color-accent)]">
              <input
                type="radio"
                name="tileset-dataset"
                value="sample"
                checked={dataset === "sample"}
                onChange={() => void onDatasetChange("sample")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-[var(--color-text-heading)]">{t.sample}</span>
                <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{t.sampleHint}</span>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 has-[:checked]:border-[var(--color-accent)]">
              <input
                type="radio"
                name="tileset-dataset"
                value="local"
                checked={dataset === "local"}
                onChange={() => void onDatasetChange("local")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-[var(--color-text-heading)]">{t.local}</span>
                <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{t.localHint}</span>
              </span>
            </label>
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
            <p className="w-full text-xs leading-5 text-[var(--color-text-secondary)]">{t.localPrivacy}</p>
          </div>
        )}
      </div>

      <div className="relative h-[32rem] bg-[#171512] md:h-[40rem]">
        <div ref={containerRef} className="cesium-tileset-demo-root absolute inset-0" data-cesium-root="true" />

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

      <div className="border-t border-[var(--color-border)] px-5 py-4 md:px-6">
        {error && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {error}
          </p>
        )}
        {statusText && !error && (
          <p className="text-sm text-[var(--color-text-secondary)]">{statusText}</p>
        )}
        <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
          {dataset === "local" && hasLocalFiles ? t.localAttribution : t.attribution}
        </p>
        {!booted && (
          <p className="sr-only">
            Cesium has not started. WebGL will not initialize until the load control is used.
          </p>
        )}
      </div>
    </div>
  );
}

function SyntheticPoster() {
  return (
    <svg
      viewBox="0 0 280 160"
      className="h-28 w-auto text-[#f6f3ec] opacity-80"
      aria-hidden="true"
    >
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
