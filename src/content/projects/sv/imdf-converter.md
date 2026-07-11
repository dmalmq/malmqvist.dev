---
title: "Shapefile till IMDF-konverterare"
description: "En fullstack-webbapplikation med guidad wizard och interaktiv kartgranskning för att konvertera shapefiler till Apples Indoor Mapping Data Format."
publishDate: "2026-02-19"
lang: "sv"
tags: ["Python", "FastAPI", "React", "TypeScript", "MapLibre", "Geospatial", "IMDF"]
coverImage: "/images/projects/imdf-placeholder.svg"
galleryImages:
  - "/images/projects/imdf-placeholder.svg"
featured: true
role: "Verktygsdesign & utveckling — Shapefile → IMDF"
problem: "Team som arbetade med våningsvisa shapefiler exporterade från CAD- och GIS-verktyg hade ingen praktisk väg att producera giltiga IMDF-arkiv utan djup Python- och geospatial kompetens."
solution: "En wizard-driven webbapp som autodetekterar våningslager, låter användare konfigurera mappningar via ett interaktivt gränssnitt och validerar resultatet före export."
techStack: ["Python", "FastAPI", "GeoPandas", "Shapely", "React", "TypeScript", "MapLibre GL JS", "Vite"]
impact: "Kollegor kan nu producera validerade IMDF-arkiv direkt i webbläsaren — utan GIS-programvara eller Python-miljö."
---

Det som började som en ren CLI-pipeline i Python visade sig snabbt för stelbent för teambruk. Kollegor behövde konvertera shapefiler utan att installera Python eller förstå geospatiala bibliotek, så jag byggde om verktyget som en fullstack-webbapplikation med FastAPI-backend och React + TypeScript-frontend.

Appen guidar användaren steg för steg: ladda upp våningsvisa shapefiler, låt backend autodetektera lager och geometrityper, konfigurera attributmappningar och granska resultatet på en interaktiv MapLibre-karta innan ett validerat IMDF-arkiv laddas ner. Varje steg ger omedelbar visuell feedback och fångar felkonfigurationer tidigt i stället för som kryptiska valideringsfel i slutet.
