---
title: "Shinjuku Indoor Navigation"
description: "Revit models of the buildings around Shinjuku Station, delivered as FBX for an indoor navigation app and as CityGML / 3D Tiles for Japan's PLATEAU 3D city model."
publishDate: "2026-03-01"
lang: "en"
tags: ["Revit", "PLATEAU", "Digital Twin", "CityGML"]
coverImage: "/images/projects/shinjuku-nav-1-optimized.jpg"
featured: true
problem: "Tokyo's complex underground station networks are nearly impossible to navigate with traditional 2D maps. PLATEAU provides city-scale 3D data but stops at building exteriors."
solution: "Model the buildings surrounding Shinjuku Station — Lumine 1, Lumine EST, NEWoMan, Busta, and Yodobashi East and West — plus the station's connection points in Revit. Export FBX for the third-party Unity studio building the navigation app, and CityGML / 3D Tiles for public release through PLATEAU."
techStack: ["Revit", "FBX", "CityGML", "3D Tiles", "Blender", "Bonsai"]
impact: "Indoor geometry tied accurately to city-scale coordinates, bridging the gap between PLATEAU's exterior 3D map and the indoor navigation experience."
---

My role on this project was the **BIM modeling and data pipeline** — not the end-user app. We captured the buildings around Shinjuku Station as native Revit components so that architectural intent and semantic object data survived the trip into downstream platforms.

The Revit output went two places: FBX for the Unity-based navigation app (built by a third-party studio), and CityGML / 3D Tiles for public release under MLIT's **PLATEAU** national 3D city model.

### Bridging the Extents

The hard part was reconciling strict indoor millimetre precision with the macro-scale geo-coordinates that PLATEAU expects. We built custom Blender + Bonsai extraction workflows that connected our detailed indoor models directly to the city's exterior 3D map, so deep underground platforms and the surrounding street network sit in the same coordinate system.

![Street Level View](/images/projects/shinjuku-nav-2-optimized.jpg)
