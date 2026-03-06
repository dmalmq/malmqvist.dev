---
title: "Why BIM Managers Should Learn to Code"
description: "Automating workflows, bridging the gap between architectural intent and data reality, and why Python is your best friend when facing tedious tasks."
publishDate: "2026-03-05"
lang: "en"
tags: ["BIM", "Automation", "Python", "Career"]
readingTime: "5 min read"
---

![Code Meets Architecture](/images/projects/ersta/01-revit-model-front.jpg)

When I first transitioned from pure architectural design into a dedicated BIM Manager role at Tengbom, I quickly realized that the primary bottleneck in large-scale projects wasn't a lack of design capability—it was data friction.

Architects want to design. Engineers want to engineer. But when a project hits 30,000 square meters, like the [Ersta Sjukhus](/en/projects/ersta-sjukhus) hospital, the sheer volume of parameters, room codes, door schedules, and model alignments becomes overwhelming. The standard BIM software packages—while powerful—often force you into repetitive, manual click-paths to solve relatively simple data mismatches.

This is where the paradigm shifts from *using* the software to *controlling* the software.

### The Problem with the "Standard" Way

Most BIM professionals rely on plugins or built-in schedules. When a client requests a format change across 4,000 door objects spanning six linked models, the manual approach means spending two days just clicking and checking boxes. It’s tedious, it breaks flow, and worst of all, it introduces human error.

Alternatively, you can write a script.

### The Automation Epiphany

My breakthrough moment came when I started exploring the API of our primary authoring tool. I wrote a small script to batch-process coordinate data across multiple linked models. What used to take half a day of meticulous double-checking suddenly took four seconds.

Once you realize you can script away the tedium, you start seeing the entire BIM process differently. You stop thinking about models as static 3D geometry and start seeing them as what they truly are: massive relational databases wrapped in a visual interface.

### Moving Beyond Dynamo and Grasshopper

Visual programming languages like Dynamo and Grasshopper are fantastic, but they have ceilings. To truly unlock the data pipelines required for deep integration—especially as the industry moves towards Digital Twins and interconnected city models like PLATEAU—you need to step out of the node-based environment.

Learning Python or C# gives you the ability to:
- Directly hit APIs to fetch or push data without opening the software.
- Build headless converters (like moving Revit datasets into GeoPackage databases).
- Integrate large language models to agentically sort and structure unclassified data.

### Conclusion

You don't need to quit architecture to be a developer. Instead, think of programming as a tool—just like a laser measure or a CAD program. It’s a lever that amplifies your impact. As BIM becomes increasingly synonymous with data engineering, the professionals who can write the pipelines will be the ones shaping the future of the built environment.
