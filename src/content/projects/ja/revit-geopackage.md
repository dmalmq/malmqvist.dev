---
title: "RevitからGeoPackageへのプラグイン"
description: "複雑な3ステップのBIM変換を、ネイティブなRevitエクスポート処理1つに統合するダイレクト・パイプライン。"
publishDate: "2024-11-20"
lang: "ja"
tags: ["C#", "Revit API", "Geospatial", "GeoPackage"]
coverImage: "/images/projects/revitgeoconverter/revitaddin-1.webp"
galleryImages:
  - "/images/projects/revitgeoconverter/revitaddin-1.webp"
  - "/images/projects/revitgeoconverter/revitaddin-2.webp"
featured: false
problem: "従来のワークフローでは、RevitからDWG、さらにShapefileへと変換する必要があり、各段階でメタデータが欠落する3段階のプロセスでした。"
solution: "近代的標準のGeoPackageへの直接出力をターゲットとして、C#とRevit APIを利用したネイティブのRevitプラグインを開発。"
techStack: ["Revit API", "C#", "SQLite", "Ogr2Ogr"]
impact: "2つの手動変換ステップを排除し、直接SQLite/GeoPackageへのエクスポートを行うことで、すべてのBIMメタデータを完全に保持することに成功。"
---

幾何学的要素とBIMメタプロパティを地理空間システム全般にスケーリングする際、DWGなどの古いフォーマット・ブリッジや厳密なShapefileの制限に依存することは、貴重なパラメータを剥ぎ取ることを意味します。

**C#ベースのRevit API**へとシステムフックすることで、要素をロジカルに辿り、ネイティブな座標設定を整理し、バウンディングプロパティをマッピングし、現代的でオープンな**GeoPackage**アーキテクチャで安全にラップされたSQLite互換のデータベースを直接生成する軽量なアドインツールを構築しました。これにより、扱いにくい従来の3フェーズのデータ・パイプラインを完全に回避し、大規模なインフラストラクチャにおけるモデル・デリバリー時間の劇的な合理化を実現しています。
