---
title: "3D Cesium Viewer"
description: "A browser-based published-session viewer for 3D Tiles — venues, buildings, and layers without installing desktop GIS software."
publishDate: "2026-07-11"
lang: "en"
tags: ["CesiumJS", "3D Tiles", "Digital Twin", "PLATEAU"]
coverImage: "/images/projects/shinjuku-nav-1-optimized.jpg"
galleryImages: []
featured: true
role: "Sole developer — CesiumJS 3D Tiles web viewer"
problem: "Sharing indoor and city-scale 3D Tiles with stakeholders usually means desktop tools, heavy installs, or one-off exports that strip structure."
solution: "A published-session web viewer built on CesiumJS: load a venue manifest, switch buildings, filter layers, and navigate 3D Tiles in the browser."
techStack: ["CesiumJS", "3D Tiles", "Vite", "JavaScript"]
impact: "Colleagues open a link and review the same authored tileset session — no Revit or GIS install required."
demo:
  type: cesium-viewer
  poster: "/images/projects/shinjuku-nav-1-optimized.jpg"
---

This project is the **published-session viewer** side of my 3D Tiles tooling: the read path used after authoring venues and layers. The portfolio embeds that viewer behind a click gate so Cesium only loads when you ask for the demo.

Tiles for the live demo are published separately; until a manifest URL is configured, the page shows a pending state.
