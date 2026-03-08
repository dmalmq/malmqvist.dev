#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

read -r -d '' PROMPT <<'EOF' || true
Use the configured Paper MCP server in write mode.

In the active document "malmqvist.dev" on the current page, create a lightweight redesign system anchored to the visual language of "Refined 1A - Editorial Project Card". Add 4 new artboards placed below the existing row so they do not overlap.

Name them exactly:
- System 01 - Foundations
- System 02 - Core UI
- System 03 - Section Patterns
- System 04 - Page Rhythm

Use an editorial architecture tone:
- warm off-white background
- dark ink text
- cool blue accent
- thin borders
- generous whitespace
- rounded cards
- precise labels

Each artboard should be clean and presentation-ready, not a low-fidelity wireframe.

Foundations must include:
- color swatches
- typography scale
- spacing and radius tokens
- desktop and mobile grid notes

Core UI must include:
- primary and secondary buttons
- tags
- nav item
- card shell
- form field
- social button examples

Section Patterns must include:
- section heading
- editorial intro split
- 3-up expertise cards
- featured project module
- article row
- CTA strip

Page Rhythm must include:
- a homepage section stack showing how the redesigned homepage should sequence and size these patterns

Reuse the same font family and palette already used in the existing hero concepts.

When done, return only a short summary with the created artboard names.
EOF

codex exec --full-auto --skip-git-repo-check -C "$ROOT_DIR" \
  -c mcp_servers.figma.enabled=false \
  -c mcp_servers.obsidian.enabled=false \
  "$PROMPT"
