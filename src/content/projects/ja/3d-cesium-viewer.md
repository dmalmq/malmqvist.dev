---
title: "3D Cesiumビューア"
description: "ブラウザベースの公開セッションビューア。デスクトップGISをインストールせずに、会場・建物・レイヤーの3D Tilesを閲覧できる。"
publishDate: "2026-07-11"
lang: "ja"
tags: ["CesiumJS", "3D Tiles", "Digital Twin", "PLATEAU"]
coverImage: "/images/projects/shinjuku-nav-1-optimized.jpg"
galleryImages: []
featured: true
problem: "屋内や都市スケールの3D Tilesを関係者と共有するには、通常デスクトップツール、重いインストール、あるいは構造を失う単発エクスポートが必要になる。"
solution: "CesiumJS上に構築した公開セッションWebビューア。会場マニフェストを読み込み、建物の切り替え、レイヤーのフィルタ、ブラウザ上での3D Tilesナビゲーションを提供する。"
techStack: ["CesiumJS", "3D Tiles", "Vite", "JavaScript"]
impact: "同僚はリンクを開くだけで、同じオーサリング済みタイルセットセッションを確認できる — RevitやGISのインストールは不要。"
demo:
  type: cesium-viewer
  poster: "/images/projects/shinjuku-nav-1-optimized.jpg"
---

このプロジェクトは、私の3D Tilesツール群のうち**公開セッションビューア**側——会場とレイヤーをオーサリングしたあとの読み取り経路です。ポートフォリオではクリックゲートの背後にビューアを埋め込み、デモを求めたときだけCesiumが読み込まれるようにしています。

ライブデモ用のタイルは別途公開します。マニフェストURLが設定されるまでは、ページは待機状態を表示します。
