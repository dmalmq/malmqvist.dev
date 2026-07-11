---
title: "Revit till GeoPackage-plugin"
description: "En direkt pipeline som kollapsar komplexa trestegs-BIM-konverteringar till en enda nativ Revit-export."
publishDate: "2024-11-20"
lang: "sv"
tags: ["C#", "Revit API", "Geospatial", "GeoPackage"]
coverImage: "/images/projects/revitgeoconverter/revitaddin-1.webp"
galleryImages:
  - "/images/projects/revitgeoconverter/revitaddin-1.webp"
  - "/images/projects/revitgeoconverter/revitaddin-2.webp"
featured: true
featuredRank: 3
role: "Pluginutvecklare — C# / Revit API → GeoPackage"
problem: "Det äldre flödet krävde att Revit konverterades via DWG och vidare till Shapefile. Det var en trestegsprocess där metadata tappades i varje steg."
solution: "Utvecklade en nativ Revit-plugin i C# med Revit API för direktexport mot den moderna GeoPackage-standarden."
techStack: ["Revit API", "C#", "SQLite", "Ogr2Ogr"]
impact: "Eliminerade två manuella konverteringssteg och bevarade all BIM-metadata genom direkt SQLite/GeoPackage-export."
---

När geometri och BIM-metaegenskaper ska skalas över geospatiala system innebär äldre formatbryggor som DWG eller strikta Shapefile-begränsningar ofta att värdefulla parametrar strippas bort.

Genom att koppla rent mot **Revit API via C#** byggde jag ett lättvikts-add-in som traverserar element logiskt, strippar nativa koordinater, mappar gränsegenskaper och syntetiserar SQLite-kompatibla databaser inlindade i öppen **GeoPackage**-arkitektur. Det undviker röriga trefas-pipelines helt och kortar leveranstiden för stora infrastrukturupplägg.
