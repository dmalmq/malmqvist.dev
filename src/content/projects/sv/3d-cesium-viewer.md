---
title: "3D Cesium-visare"
description: "En webbläsarbaserad publicerad-sessionsvisare för 3D Tiles — lokaler, byggnader och lager utan att installera stationär GIS-programvara."
publishDate: "2026-07-11"
lang: "sv"
tags: ["CesiumJS", "3D Tiles", "Digital Twin", "PLATEAU"]
coverImage: "/images/projects/shinjuku-nav-1-optimized.jpg"
galleryImages: []
featured: true
problem: "Att dela inomhus- och stadsskaliga 3D Tiles med intressenter brukar kräva stationära verktyg, tunga installationer eller engångsexporter som tar bort struktur."
solution: "En publicerad-sessionswebbvisare byggd på CesiumJS: ladda ett lokalmanifest, växla byggnader, filtrera lager och navigera 3D Tiles i webbläsaren."
techStack: ["CesiumJS", "3D Tiles", "Vite", "JavaScript"]
impact: "Kollegor öppnar en länk och granskar samma författade tileset-session — ingen Revit- eller GIS-installation krävs."
demo:
  type: cesium-viewer
  poster: "/images/projects/shinjuku-nav-1-optimized.jpg"
---

Det här projektet är **publicerad-sessionsvisaren** i min 3D Tiles-verktygslåda: läsvägen efter att lokaler och lager har författats. Portföljen bäddar in visaren bakom en klickgrind så att Cesium bara laddas när du ber om demot.

Tiles för livedemot publiceras separat; tills en manifest-URL är konfigurerad visar sidan ett vänteläge.
