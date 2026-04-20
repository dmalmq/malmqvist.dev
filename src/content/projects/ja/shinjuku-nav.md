---
title: "新宿駅 屋内ナビゲーション"
description: "新宿駅周辺の建物をRevitでモデル化し、屋内ナビアプリ用のFBXと、日本のPLATEAU 3D都市モデル向けのCityGML / 3D Tilesとして納品。"
publishDate: "2026-03-01"
lang: "ja"
tags: ["Revit", "PLATEAU", "Digital Twin", "CityGML"]
coverImage: "/images/projects/shinjuku-nav-1-optimized.jpg"
featured: true
problem: "従来の2Dマップではナビゲーションが困難な東京の複雑な地下駅ネットワーク。PLATEAUは都市規模の3Dデータを提供しますが、建物の外部で途切れてしまいます。"
solution: "新宿駅周辺の建物（ルミネ1、ルミネエスト、ニュウマン、バスタ、ヨドバシ東館・西館）と駅の接続部をRevitでモデル化。Unityベースのナビアプリを開発する外部スタジオ向けにFBXを書き出し、同時にPLATEAUとして一般公開するためのCityGML / 3D Tilesも生成しました。"
techStack: ["Revit", "FBX", "CityGML", "3D Tiles", "Blender", "Bonsai"]
impact: "屋内ジオメトリを都市スケールの座標系に正確に紐づけ、PLATEAUの建物外部の3Dマップと屋内ナビゲーション体験のあいだのギャップを埋めました。"
---

このプロジェクトでの私の役割は、ユーザー向けアプリの開発ではなく、**BIMモデリングとデータパイプラインの構築**でした。新宿駅周辺の建物をネイティブなRevitコンポーネントとして捉えることで、建築的意図とセマンティックなオブジェクトデータを後段のプラットフォームまで保ったまま届けています。

Revitからのアウトプットは2方向に流しています。Unityベースのナビアプリ用のFBX（実装は外部スタジオが担当）と、国土交通省のPLATEAU（日本の3D都市モデル）として一般公開するためのCityGML / 3D Tilesです。

### データスケールの橋渡し

中核となる課題は、屋内のミリ単位の精度を、PLATEAUが扱う広域の地理座標系と一致させることでした。Blender + Bonsaiの抽出ワークフローを開発し、詳細な屋内モデルを都市スケールの3D外部マップへ直接接続。深い地下ホームと周辺の道路ネットワークが同じ座標系上に揃うようにしました。

![Street Level View](/images/projects/shinjuku-nav-2-optimized.jpg)
