---
title: "Shinjuku inomhusnavigering"
description: "Revit-modeller av byggnaderna runt Shinjuku Station, levererade som FBX till en app för inomhusnavigering och som CityGML / 3D Tiles till Japans PLATEAU 3D-stadsmodell."
publishDate: "2026-03-01"
lang: "sv"
tags: ["Revit", "PLATEAU", "Digital Twin", "CityGML"]
coverImage: "/images/projects/shinjuku-nav-2-optimized.jpg"
featured: true
featuredRank: 2
role: "Ansvarig för BIM-dataflöden"
problem: "Tokyos komplexa underjordiska stationsnät är nästan omöjliga att navigera med traditionella 2D-kartor. PLATEAU ger stadsövergripande 3D-data men stannar vid byggnadernas fasader."
solution: "Modellera byggnaderna runt Shinjuku Station — Lumine 1, Lumine EST, NEWoMan, Busta och Yodobashi öst och väst — plus stationens anslutningspunkter i Revit. Exportera FBX till den externa Unity-studion som bygger navigationsappen, och CityGML / 3D Tiles för offentlig release via PLATEAU."
techStack: ["Revit", "FBX", "CityGML", "3D Tiles", "Blender", "Bonsai"]
impact: "Inomhusgeometri knuten till stadsövergripande koordinater, vilket överbryggar gapet mellan PLATEAUs yttre 3D-karta och inomhusnavigeringen."
---

Min roll i projektet var **BIM-modellering och datapipeline** — inte slutkundens app. Vi fångade byggnaderna runt Shinjuku Station som nativa Revit-komponenter så att arkitektonisk intention och semantiskt objektdata överlevde resan till nedströmsplattformar.

Revit-leveransen gick åt två håll: FBX till den Unity-baserade navigationsappen (byggd av en extern studio), och CityGML / 3D Tiles för offentlig release under MLIT:s **PLATEAU** — Japans nationella 3D-stadsmodell.

### Att överbrygga skalorna

Det svåra var att förena strikt inomhusprecision på millimeternivå med de makroskaliga geokoordinater som PLATEAU kräver. Vi byggde egna Blender + Bonsai-extraktionsflöden som kopplade våra detaljerade inomhusmodeller direkt till stadens yttre 3D-karta, så att djupa underjordiska plattformar och det omgivande gatunätet sitter i samma koordinatsystem.

![Street Level View](/images/projects/shinjuku-nav-2-optimized.jpg)
