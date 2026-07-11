import { useEffect, useRef, useState } from "react";
import { buildViewerIframeSrc } from "@/lib/cesium-demo";

type Props = {
  lang: "en" | "ja" | "sv";
  posterSrc: string;
  posterAlt: string;
  manifestUrl: string | null;
  /** Server/build-time: viewer.html present under public/demos/cesium-viewer/. */
  viewerAvailable: boolean;
};

const copy = {
  en: {
    eyebrow: "Interactive demo",
    title: "Published-session 3D Tiles viewer",
    pending:
      "Demo tiles are not published on this site yet. When a manifest URL is configured, you can load the viewer here.",
    missingAssets:
      "The interactive viewer build is not available on this deployment. Run the demo viewer build and redeploy, or open the project without the live demo.",
    load: "Load interactive demo",
    close: "Close demo",
    openTab: "Open in new tab",
    loading: "Loading viewer…",
  },
  ja: {
    eyebrow: "インタラクティブデモ",
    title: "公開セッション用 3D Tiles ビューア",
    pending:
      "デモ用タイルはこのサイトにはまだ公開されていません。マニフェストURLが設定されると、ここでビューアを読み込めます。",
    missingAssets:
      "このデプロイにはインタラクティブビューアのビルドがありません。デモ用ビューアをビルドして再デプロイしてください。",
    load: "インタラクティブデモを読み込む",
    close: "デモを閉じる",
    openTab: "新しいタブで開く",
    loading: "ビューアを読み込み中…",
  },
  sv: {
    eyebrow: "Interaktiv demo",
    title: "Publicerad 3D Tiles-visare",
    pending:
      "Demodata är inte publicerad på den här sajten ännu. När en manifest-URL är konfigurerad kan du ladda visaren här.",
    missingAssets:
      "Den interaktiva visaren saknas i den här distributionen. Bygg demo-visaren och publicera igen.",
    load: "Ladda interaktiv demo",
    close: "Stäng demo",
    openTab: "Öppna i ny flik",
    loading: "Laddar visare…",
  },
} as const;

export default function CesiumViewerGate({
  lang,
  posterSrc,
  posterAlt,
  manifestUrl,
  viewerAvailable,
}: Props) {
  const t = copy[lang];
  const [open, setOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    return () => {
      // Drop iframe on unmount (navigation) so WebGL dies with the document.
      iframeRef.current = null;
    };
  }, []);

  const canLoad = Boolean(manifestUrl) && viewerAvailable;
  const iframeSrc = canLoad && manifestUrl ? buildViewerIframeSrc(manifestUrl) : null;

  let statusMessage: string | null = null;
  if (!viewerAvailable) {
    statusMessage = t.missingAssets;
  } else if (!manifestUrl) {
    statusMessage = t.pending;
  }

  return (
    <div className="border-t border-[var(--line)] pt-8">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 className="mt-3 text-[var(--font-h3)]">{t.title}</h2>

      {!open && (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-feature)] border border-[var(--line)] bg-[var(--surface)]">
          <img
            src={posterSrc}
            alt={posterAlt}
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
          <div className="space-y-4 p-5 md:p-6">
            {statusMessage && (
              <p className="text-sm leading-7 text-[var(--text-muted)]">
                {statusMessage}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canLoad}
                onClick={() => setOpen(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.load}
              </button>
            </div>
          </div>
        </div>
      )}

      {open && iframeSrc && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] border border-[var(--line)] px-6 py-3 text-sm font-bold text-[var(--text)]"
            >
              {t.close}
            </button>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] border border-[var(--line)] px-6 py-3 text-sm font-bold text-[var(--text)]"
            >
              {t.openTab}
            </a>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-feature)] border border-[var(--line)] bg-[var(--surface-soft)]">
            <iframe
              ref={iframeRef}
              title={t.title}
              src={iframeSrc}
              className="aspect-video w-full min-h-[28rem] border-0"
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}
