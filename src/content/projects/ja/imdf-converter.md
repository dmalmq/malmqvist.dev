---
title: "ShapefileからIMDFへのコンバーター"
description: "Appleの屋内マッピングデータフォーマットに対する空間変換プロセスの自動化。"
publishDate: "2025-08-15"
lang: "ja"
tags: ["Python", "Geospatial", "IMDF"]
coverImage: ""
featured: false
problem: "AppleのIndoor Mapping Data Formatへの空間データの変換は、重い手動タスクであり、エラーが発生しやすい作業でした。"
solution: "レイヤー化されたShapefileのポリゴンと属性データを直接検証済みのIMDF GeoJSON標準へとマッピングするPythonベースのパイプラインを構築。"
techStack: ["Python", "Pandas", "GeoPandas", "Shapely"]
impact: "施設毎に数日かかっていたファイルコンパイル時間を数分レベルにまで短縮し、検証エラーを排除しました。"
---

QGISやArcGISといった手作業のソフトウェアによる変換に依存しがちなニッチなGIS作業ですが、処理が必要な施設の膨大な量のために、自動化可能で再現性のあるアプローチが求められていました。

`GeoPandas`とApple公式の検証CLIツールを用いたパラメータ化Pythonラッパーを自作し、建築ポリゴンやスペースの属性がパッケージ化される前に自動的にIMDF検証標準を満たすよう調整・フォーマットされるクリーンな処理手順を確立しました。
