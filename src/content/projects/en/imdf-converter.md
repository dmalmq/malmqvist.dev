---
title: "Shapefile to IMDF Converter"
description: "A full-stack web application with a guided wizard and interactive map review for converting shapefiles to Apple's Indoor Mapping Data Format."
publishDate: "2026-02-19"
lang: "en"
tags: ["Python", "FastAPI", "React", "TypeScript", "MapLibre", "Geospatial", "IMDF"]
coverImage: "/images/projects/imdf-placeholder.svg"
galleryImages:
  - "/images/projects/imdf-placeholder.svg"
featured: false
problem: "Teams working with per-floor shapefiles exported from CAD and GIS tools had no practical way to produce valid IMDF archives without deep Python and geospatial knowledge."
solution: "A wizard-driven web app that auto-detects floor layers, lets users configure mappings through an interactive UI, and validates the output before export."
techStack: ["Python", "FastAPI", "GeoPandas", "Shapely", "React", "TypeScript", "MapLibre GL JS", "Vite"]
impact: "Colleagues can now produce validated IMDF archives directly in the browser — no GIS software or Python environment required."
---

What started as a CLI-only Python pipeline quickly proved too rigid for team use. Colleagues needed to convert shapefiles without installing Python or understanding geospatial libraries, so I rebuilt the tool as a full-stack web application with a FastAPI backend and a React + TypeScript frontend.

The app guides users through a step-by-step wizard: upload per-floor shapefiles, let the backend auto-detect layers and geometry types, configure attribute mappings, then review the result on an interactive MapLibre map before downloading a validated IMDF archive. Each step provides immediate visual feedback, catching misconfigurations early instead of surfacing them as cryptic validation errors at the end.
