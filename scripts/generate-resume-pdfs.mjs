import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const outputDir = resolve("public");
mkdirSync(outputDir, { recursive: true });

const tempDir = mkdtempSync(join(tmpdir(), "resume-pdf-"));

const documents = [
  {
    name: "resume-en",
    htmlLang: "en",
    title: "Daniel Malmqvist",
    subtitle: "BIM Manager | Digital Twin Engineer | Agentic Programmer",
    meta: [
      "Tokyo, Japan",
      "daniel@malmqvist.dev",
      "https://malmqvist.dev",
      "English / Swedish (native), Japanese (JLPT N3, N2 in progress)",
    ],
    summary:
      "Architect-turned-BIM-manager with 7 years at Tengbom in Stockholm and current digital twin work in Tokyo. I bridge architectural intent, BIM workflows, geospatial data, and automation to build cleaner pipelines for AEC projects.",
    sections: [
      {
        title: "Experience",
        items: [
          {
            heading: "BIM Digital Twin Engineer — JRE Consultants, Tokyo",
            meta: "2023 - Present",
            bullets: [
              "Create detailed indoor BIM models and connected data pipelines for station and commercial interiors in Tokyo.",
              "Integrate indoor geometry with Japan's government-backed PLATEAU 3D city model for seamless indoor-outdoor digital twin workflows.",
              "Develop custom automation and conversion tools that connect Revit, CityGML, FBX, GeoPackage, and related spatial formats.",
            ],
          },
          {
            heading: "BIM Manager — Tengbom, Stockholm",
            meta: "2021 - 2023",
            bullets: [
              "Led BIM management for the 330 m Terminal 5 expansion at Stockholm Arlanda Airport.",
              "Managed weekly exports, quality control, and delivery standards across a large interdisciplinary team.",
              "Served as the day-to-day BIM resource for modeling workflows, troubleshooting, and submission readiness.",
            ],
          },
          {
            heading: "Architect / BIM Modeler — Tengbom, Stockholm",
            meta: "2016 - 2021",
            bullets: [
              "Rebuilt the Ersta Sjukhus hospital Revit model from an inherited IFC source and turned it into a production-ready architectural model.",
              "Modeled the hospital's defining anodized aluminum facade system and coordinated with structural, HVAC, and fabrication teams.",
              "Contributed to VR-based stakeholder review workflows used by doctors and nurses before construction.",
            ],
          },
        ],
      },
      {
        title: "Selected Projects",
        items: [
          {
            heading: "Shinjuku Indoor Navigation",
            bullets: [
              "Detailed Revit modeling for station interiors and underground connections, later converted for Unity-based navigation.",
            ],
          },
          {
            heading: "Revit to GeoPackage Plugin",
            bullets: [
              "Native Revit export workflow reducing legacy DWG and Shapefile conversion steps to direct GeoPackage delivery.",
            ],
          },
          {
            heading: "Ersta Sjukhus",
            bullets: [
              "Award-winning healthcare project demonstrating IFC-to-Revit reconstruction, facade modeling, and deep interdisciplinary coordination.",
            ],
          },
        ],
      },
      {
        title: "Core Skills",
        items: [
          {
            heading: "Architecture & BIM",
            bullets: [
              "Revit, ArchiCAD, BIM coordination, clash detection, healthcare and infrastructure projects",
            ],
          },
          {
            heading: "Geospatial & Data",
            bullets: [
              "CityGML, IFC, GeoPackage, IMDF, Shapefiles, SQLite, spatial data conversion",
            ],
          },
          {
            heading: "Programming & Visualization",
            bullets: [
              "Python, C#, TypeScript, Revit API, Blender, Bonsai, Unity, FBX",
            ],
          },
        ],
      },
    ],
  },
  {
    name: "resume-ja",
    htmlLang: "ja",
    title: "ダニエル マルムクビスト",
    subtitle: "BIMマネージャー | デジタルツイン・エンジニア | Agentic Programmer",
    meta: [
      "東京",
      "daniel@malmqvist.dev",
      "https://malmqvist.dev",
      "英語・スウェーデン語（母語） / 日本語（JLPT N3、N2取得に向け学習中）",
    ],
    summary:
      "スウェーデンで建築家・BIMマネージャーとして経験を積み、現在は東京で都市デジタルツインと屋内BIMデータをつなぐ仕事をしています。建築意図、BIMワークフロー、地理空間データ、そして自動化を横断してAEC向けの実用的なパイプラインを構築します。",
    sections: [
      {
        title: "職歴",
        items: [
          {
            heading: "BIMデジタルツイン・エンジニア — JRE Consultants（東京）",
            meta: "2023年 - 現在",
            bullets: [
              "駅構内や商業施設の詳細な屋内BIMモデルを作成し、関連するデータパイプラインを整備。",
              "国土交通省主導のPLATEAU 3D都市モデルと屋内ジオメトリを接続し、シームレスな屋内外デジタルツインを実現。",
              "Revit、CityGML、FBX、GeoPackageなどの空間フォーマットをつなぐための自動化ツールを開発。",
            ],
          },
          {
            heading: "BIMマネージャー — Tengbom（ストックホルム）",
            meta: "2021年 - 2023年",
            bullets: [
              "ストックホルム・アーランダ空港ターミナル5拡張プロジェクトでBIMマネジメントを担当。",
              "週次エクスポート、品質管理、提出物基準の整備を推進。",
              "チーム内のBIM運用、モデリング、トラブル対応を支える実務担当として機能。",
            ],
          },
          {
            heading: "建築設計 / BIMモデラー — Tengbom（ストックホルム）",
            meta: "2016年 - 2021年",
            bullets: [
              "Ersta SjukhusのIFCモデルを基に、施工対応可能なRevit建築モデルをゼロから再構築。",
              "病院の象徴的なアルミファサードの主担当モデラーとして、構造・設備・施工チームと連携。",
              "医師や看護師による事前検証に使われたVRレビューにも貢献。",
            ],
          },
        ],
      },
      {
        title: "主なプロジェクト",
        items: [
          {
            heading: "新宿駅 屋内ナビゲーション",
            bullets: [
              "駅構内と地下接続部をRevitで詳細にモデリングし、後工程でUnityベースのナビゲーションへ活用。",
            ],
          },
          {
            heading: "RevitからGeoPackageへのプラグイン",
            bullets: [
              "従来のDWG・Shapefile変換を減らし、Revitから直接GeoPackageへ出力するワークフローを構築。",
            ],
          },
          {
            heading: "Ersta Sjukhus",
            bullets: [
              "IFCからのRevit再構築、ファサードモデリング、複数分野との調整力を示す代表的プロジェクト。",
            ],
          },
        ],
      },
      {
        title: "スキル",
        items: [
          {
            heading: "建築・BIM",
            bullets: [
              "Revit、ArchiCAD、BIMコーディネーション、干渉チェック、病院・インフラ案件",
            ],
          },
          {
            heading: "地理空間・データ",
            bullets: [
              "CityGML、IFC、GeoPackage、IMDF、Shapefile、SQLite、空間データ変換",
            ],
          },
          {
            heading: "プログラミング・可視化",
            bullets: [
              "Python、C#、TypeScript、Revit API、Blender、Bonsai、Unity、FBX",
            ],
          },
        ],
      },
    ],
  },
];

function renderHtml(document) {
  const sectionHtml = document.sections
    .map(
      (section) => `
        <section class="section">
          <h2>${section.title}</h2>
          ${section.items
            .map(
              (item) => `
                <article class="item">
                  <div class="item-heading">
                    <h3>${item.heading}</h3>
                    ${item.meta ? `<p class="item-meta">${item.meta}</p>` : ""}
                  </div>
                  <ul>
                    ${item.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
                  </ul>
                </article>
              `,
            )
            .join("")}
        </section>
      `,
    )
    .join("");

  const fontStack =
    document.htmlLang === "ja"
      ? '"Noto Sans JP","Yu Gothic","Hiragino Sans","Meiryo",sans-serif'
      : '"Noto Sans","Helvetica Neue",Arial,sans-serif';

  return `<!doctype html>
<html lang="${document.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <title>${document.title}</title>
    <style>
      @page {
        size: A4;
        margin: 14mm 16mm;
      }

      body {
        color: #1c1c1e;
        font-family: ${fontStack};
        font-size: 10.5pt;
        line-height: 1.45;
        margin: 0;
      }

      h1, h2, h3, p, ul {
        margin: 0;
      }

      .page {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .header {
        border-bottom: 1px solid #d4d4cd;
        padding-bottom: 10px;
      }

      .header h1 {
        font-size: 24pt;
        line-height: 1.1;
        margin-bottom: 4px;
      }

      .subtitle {
        color: #2563a0;
        font-size: 11.5pt;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .meta {
        color: #555b63;
        display: flex;
        flex-wrap: wrap;
        gap: 4px 10px;
        font-size: 9.5pt;
      }

      .summary {
        background: #f5f5f0;
        border: 1px solid #d4d4cd;
        border-radius: 6px;
        padding: 10px 12px;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .section h2 {
        color: #111111;
        border-bottom: 1px solid #d4d4cd;
        font-size: 12.5pt;
        font-weight: 700;
        padding-bottom: 4px;
      }

      .item {
        break-inside: avoid;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .item-heading {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .item h3 {
        font-size: 11pt;
        font-weight: 700;
      }

      .item-meta {
        color: #555b63;
        font-size: 9pt;
      }

      ul {
        padding-left: 16px;
      }

      li {
        margin: 1px 0;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="header">
        <h1>${document.title}</h1>
        <p class="subtitle">${document.subtitle}</p>
        <div class="meta">
          ${document.meta.map((item) => `<span>${item}</span>`).join("")}
        </div>
      </header>

      <section class="summary">
        <p>${document.summary}</p>
      </section>

      ${sectionHtml}
    </main>
  </body>
</html>`;
}

const htmlPaths = documents.map((document) => {
  const htmlPath = join(tempDir, `${document.name}.html`);
  writeFileSync(htmlPath, renderHtml(document), "utf8");
  return htmlPath;
});

execFileSync(
  "soffice",
  [
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    outputDir,
    ...htmlPaths,
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      HOME: tempDir,
      TMPDIR: tempDir,
      XDG_CONFIG_HOME: tempDir,
      SAL_USE_VCLPLUGIN: "svp",
    },
  },
);

copyFileSync(join(outputDir, "resume-en.pdf"), join(outputDir, "resume.pdf"));
