---
title: "What Is a Digital Twin? It Depends Who You Ask"
description: "Everyone in AEC claims to have a digital twin. But NVIDIA and Japan's PLATEAU mean very different things by it. Here's what the term actually means in practice."
publishDate: "2026-03-09"
lang: "en"
tags: ["Digital Twin", "PLATEAU", "BIM", "AI"]
readingTime: "8 min read"
---

# What Is a Digital Twin? It Depends Who You Ask

If you've been anywhere near the AEC industry in the last few years, you've heard the term "digital twin" thrown around constantly. In pitches, in conference talks, in project proposals. Everyone has one. Everyone is building one. But ask five people what it actually means and you'll get five different answers.

I was listening to a recent episode of the [AEC AI & Tech Strategy Podcast](https://open.spotify.com/show/aec-ai-tech-strategy) where Sean Young from NVIDIA laid out their definition, and it made me realize just how wide the gap is between what different organizations mean when they say "digital twin." It also made me think about where my own work — building indoor navigation models integrated with Japan's PLATEAU 3D city model — actually sits on that spectrum.

So let's unpack it.

![Aerial view of Tokyo Station with digital twin infrastructure overlay](/images/blog/digital-twin-tokyo-station.jpg)

## The "Just Show Me the Building" End of the Spectrum

At its simplest, a lot of people use "digital twin" to mean "a 3D model of something that exists in the real world." A Revit model of a completed building. A point cloud scan. A real-time rendering you can fly through in a browser.

This is the definition you'll hear most often on project sites. Someone exports their BIM model, loads it into a viewer, and calls it a digital twin. And honestly, there's nothing wrong with that — it's useful, it communicates spatial information, and it helps people understand the building.

But it's basically a visualization. The model doesn't *know* anything about how the building behaves. It doesn't simulate airflow, structural loads, or how light moves through a space. It's a snapshot, not a living system.

## NVIDIA: "Without Physics, You Don't Have Reality"

NVIDIA takes a fundamentally different position. Sean put it pretty bluntly on the podcast: a real-time fly-through of a building isn't a digital twin. It's a visualization. For NVIDIA, a digital twin has to be a complete simulation of reality — and that means physics first.

Their definition comes from their work in autonomous driving. When you're training an AI to drive a car, you need the virtual world to behave exactly like the real one. If the car brakes on a wet road, it needs to skid correctly. If sunlight hits a windshield at a certain angle, the camera sensors need to see the same glare they'd encounter in reality. The physics have to be right — both the Newtonian mechanics (how objects move and interact) and the photonics (how light behaves).

That's an incredibly high bar. And it makes sense for their use case. If you're training autonomous vehicles on synthetic data and the physics are wrong, the AI will fail in the real world. People could get hurt. So NVIDIA builds full-stack simulation environments where every material, every light source, every force is physically accurate.

They apply the same thinking to construction and infrastructure. Imagine a digital twin of a construction site where you can simulate crane operations, test how structural loads distribute under different conditions, or train safety AI on synthetic scenarios that would be too dangerous to recreate physically. That's the NVIDIA vision.

## PLATEAU: The City as a Semantic Database

Japan's PLATEAU project takes a completely different approach — and it's equally valid for its goals.

PLATEAU, led by the Ministry of Land, Infrastructure, Transport and Tourism (MLIT), is building 3D city models for urban planning, disaster preparedness, and public infrastructure management. The project already covers hundreds of cities across Japan, with a target of 500 by 2027. The data is open and free.

But PLATEAU's digital twin isn't about physics simulation. It's about *semantic richness*. Every building in a PLATEAU model isn't just geometry — it's a data object. A building knows its construction year, structural type, number of floors, floor area, zoning classification, and even its flood risk. These attributes come from standardized codelists published by MLIT, structured in CityGML format with well-defined schemas.

When I work with PLATEAU data in Tokyo, I'm not simulating how a building responds to an earthquake in real time. I'm querying a massive, structured, city-scale dataset that tells me *what* everything is, *where* it is, and *what it's classified as* according to national standards. The "twin" part is the semantic accuracy — the digital model reflects the real city's administrative, structural, and spatial reality.

This is incredibly powerful for things like urban planning, disaster response modeling, and — in my case — indoor navigation. When I integrate my Revit station models with PLATEAU, I'm connecting detailed indoor BIM geometry with a city-scale semantic dataset. The result is a navigable environment where you can move seamlessly from an underground platform up through a station concourse and out into the surrounding city, because both layers know where they are in real-world coordinates and what they represent.

## So Which One Is the "Real" Digital Twin?

Honestly? Both. And neither. The term is a spectrum, not a binary.

If I had to draw it out, it looks something like this:

**3D Visualization** → **Semantic City Model** → **Physics Simulation**

A Revit model in a web viewer sits on the left. PLATEAU lives in the middle — rich data, accurate geometry, semantically classified, but no real-time physics. NVIDIA's vision lives on the right — full physical simulation where virtual sensors produce data indistinguishable from real ones.

Most of us working in AEC are somewhere between the left and the middle. We're building models that are increasingly data-rich and spatially accurate, connected to real-world coordinate systems and classification standards. The physics-first approach is coming, but for the majority of building and infrastructure projects, the semantic approach delivers enormous value right now.

## Where My Work Fits

What I build daily at JRE Consultants in Tokyo lives in the middle of that spectrum, leaning toward the semantic side. I create detailed Revit BIM models of station interiors — platforms, concourses, underground walkways, connected shopping malls — and integrate them with PLATEAU's city-scale 3D model. The result gets converted to formats like FBX for Unity (for the navigation app) and 3D Tiles for CesiumJS (for web visualization).

It's not physics simulation. The model doesn't calculate how crowds flow through Shinjuku Station at rush hour or simulate what happens if an escalator fails. But it does know exactly what every space is (a walkway, an elevator, a restroom, a ticket gate), where it is in real-world coordinates (EPSG:6677, accurate to the centimeter), and how it connects to the surrounding city.

For indoor navigation, that semantic accuracy is what matters. You don't need to simulate gravity to tell someone which exit is closest. You need to know the spatial relationships, the classifications, and the connectivity — and that's exactly what a well-structured BIM model integrated with PLATEAU provides.

## The Gap in Between

What's interesting is the gap between where most AEC work is today and where NVIDIA says it needs to go. That gap is where the next decade of innovation lives.

NVIDIA's Sean mentioned something that stuck with me: the idea of agents that generate geometry through application APIs and run physics checks during creation. Imagine a workflow where you're modeling a facade in Revit and an agent is simultaneously checking wind loads, thermal performance, and solar gain against the physical properties of the materials you're specifying — not as a post-design analysis step, but in real time as you model.

We're not there yet. But the building blocks are falling into place. BIM gives us the parametric geometry. CityGML and PLATEAU give us the semantic and spatial context. Physics engines are getting cheaper and more accessible. And agentic AI is starting to bridge the gaps between these systems.

The professionals who understand both the semantic/BIM side and the physics/simulation side are going to be the ones building the bridges. That's a space I find genuinely exciting.

## Takeaway

Next time someone says "digital twin" in a meeting, it's worth asking: which kind? A visualization? A semantic city model? A physics simulation? The answer changes everything about what's possible, what's required, and what value it actually delivers.

For most of us in AEC right now, the immediate value is in the semantic middle — making our models data-rich, spatially accurate, and connected to real-world classification systems. The physics-first future is coming, and it's going to be transformative. But the work we do today building that semantic foundation is what makes the physics layer possible tomorrow.

---

*Much of NVIDIA's perspective in this post comes from [Episode 103: AI and Digital Twins in AEC Infrastructure](https://open.spotify.com/show/aec-ai-tech-strategy) of the **AEC AI and Tech Strategy Podcast**. If you want to hear more about NVIDIA's vision for digital twins in the built environment, it's well worth a listen.*

*I work on indoor navigation digital twins in Tokyo, integrating BIM models with Japan's PLATEAU 3D city model. If you're interested in how BIM and geospatial data connect in practice, check out my [Shinjuku Navigation project](/en/projects/shinjuku-nav) or [get in touch](/en/contact).*
