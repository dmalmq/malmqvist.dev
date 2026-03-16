---
title: "ShapefileからIMDFへのコンバーター"
description: "ガイド付きウィザードとインタラクティブな地図レビュー機能を備えた、ShapefileをAppleのIndoor Mapping Data Formatに変換するフルスタックWebアプリケーション。"
publishDate: "2026-02-19"
lang: "ja"
tags: ["Python", "FastAPI", "React", "TypeScript", "MapLibre", "Geospatial", "IMDF"]
coverImage: "/images/projects/imdf-placeholder.svg"
galleryImages:
  - "/images/projects/imdf-placeholder.svg"
featured: false
problem: "CADやGISツールから出力されたフロアごとのShapefileを扱うチームにとって、PythonやGISの専門知識なしに有効なIMDFアーカイブを作成する手段がありませんでした。"
solution: "フロアレイヤーを自動検出し、インタラクティブなUIでマッピングを設定し、エクスポート前にバリデーションを行うウィザード型Webアプリケーション。"
techStack: ["Python", "FastAPI", "GeoPandas", "Shapely", "React", "TypeScript", "MapLibre GL JS", "Vite"]
impact: "同僚がブラウザ上で直接、検証済みのIMDFアーカイブを作成できるようになり、GISソフトウェアやPython環境が不要になりました。"
---

当初はCLIベースのPythonパイプラインとして開発しましたが、チームでの運用にはすぐに限界が見えてきました。Pythonのインストールや空間データライブラリの知識がない同僚でも使えるよう、FastAPIバックエンドとReact + TypeScriptフロントエンドによるフルスタックWebアプリケーションとして再構築しました。

アプリはステップバイステップのウィザード形式で操作を案内します。フロアごとのShapefileをアップロードすると、バックエンドがレイヤーとジオメトリタイプを自動検出し、属性マッピングを設定した後、MapLibreのインタラクティブな地図上で結果を確認してから検証済みIMDFアーカイブをダウンロードできます。各ステップで即座にビジュアルフィードバックが提供されるため、最終段階で不明瞭なバリデーションエラーに悩まされることなく、早期に設定ミスを発見できます。
