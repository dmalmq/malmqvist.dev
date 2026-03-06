---
title: "Shinjuku Indoor Navigation"
description: "Creating detailed Revit models of Tokyo's underground stations to integrate with the PLATEAU digital twin."
publishDate: "2026-03-01"
lang: "en"
tags: ["Revit", "Unity", "Digital Twin", "PLATEAU"]
coverImage: "/images/projects/shinjuku-nav-1.png"
featured: true
problem: "Tokyo's complex underground station networks are nearly impossible to navigate with traditional 2D maps. PLATEAU provides city-scale 3D data but stops at building exteriors."
solution: "Create detailed Revit models of station interiors, underground walkways, and surrounding shopping malls. Convert to FBX for use as 3D assets in a Unity-based indoor navigation application. Integrate with PLATEAU's CityGML digital twin for seamless indoor-outdoor continuity."
techStack: ["Revit", "FBX", "Unity", "CityGML", "Blender", "Bonsai"]
impact: "Seamless indoor-outdoor transitions mapped at absolute city-scale accuracy, bridging the gap between urban modeling and micro-indoor navigation."
---

My role within this flagship project focused precisely on the **BIM modeling and data pipeline** required to feed the application, rather than the end-user Unity development. By capturing the sprawling labyrinth of Shinjuku Station as native Revit components, we preserved architectural intent and semantic object data.

### Bridging the Extents

The core challenge was aligning strict indoor millimeter precision with macro-scale geo-coordinates inherent to Japan's MLIT **PLATEAU** data set. We developed custom Blender + Bonsai extraction workflows that connected our detailed indoor models directly to the city's exterior 3D map, establishing an unbroken link between deep underground platforms and adjacent street networks. 

![Street Level View](/images/projects/shinjuku-nav-2.png)
