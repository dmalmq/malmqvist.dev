---
title: "新宿駅 屋内ナビゲーション"
description: "東京の地下鉄駅構内の詳細なRevitモデルを作成し、PLATEAUデジタルツインと統合するプロジェクト。"
publishDate: "2026-03-01"
lang: "ja"
tags: ["Revit", "Unity", "Digital Twin", "PLATEAU"]
coverImage: "/images/projects/shinjuku-nav-1.png"
featured: true
problem: "従来の2Dマップではナビゲーションが困難な東京の複雑な地下駅ネットワーク。PLATEAUは都市規模の3Dデータを提供しますが、建物の外部で途切れてしまいます。"
solution: "駅構内、地下通路、周辺のショッピングモールの詳細なRevitモデルを作成。Unityベースの屋内ナビゲーションアプリで3Dアセットとして使用するためにFBXに変換。PLATEAUのCityGMLデジタルツインと統合し、屋内外のシームレスな連続性を実現。"
techStack: ["Revit", "FBX", "Unity", "CityGML", "Blender", "Bonsai"]
impact: "絶対的な都市スケールの空間座標と連動するシームレスな屋内外トランジションにより、都市モデリングと微小な屋内ナビゲーションのギャップを埋めることに成功。"
---

この旗艦プロジェクトにおける私の役割は、ユーザー向けのUnity開発ではなく、アプリケーションにデータを供給するために必要な**BIMモデリングとデータパイプライン構築**に特化したものでした。広大な新宿駅の迷宮をネイティブなRevitコンポーネントとして捉えることで、建築的意図とセマンティックなオブジェクトデータを維持しました。

### データスケールの橋渡し

中核となる課題は、厳密な屋内のミリ単位の精度を国土交通省主導の**PLATEAU**データセットの広域地理座標系と一致させることでした。Blender + Bonsaiの抽出ワークフローを開発し、作成した詳細な屋内モデルを都市スケールの3D外部マップへと直接接続。深い地下ホームと地上の道路ネットワークをシームレスにリンクさせました。

![Street Level View](/images/projects/shinjuku-nav-2.png)
