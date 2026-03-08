---
id: DM-001
title: Paper, Figma, Codex, and Obsidian MCP collaboration setup
status: in_progress
paper_url:
figma_url:
repo_path: /home/apollo/malmqvist.dev
branch:
owner: Daniel
updated_at: 2026-03-08
---

# Objective

Create a repeatable collaboration setup where Codex can use Paper, Figma, and Obsidian together for design-to-implementation work on this site.

# Acceptance Criteria

- Codex can connect to Paper, Figma, and Obsidian in one session.
- Obsidian notes act as the tracked work-item source inside this repo.
- The setup is documented and reproducible from the repo.

# Design Context

- Paper: add the relevant frame URL here
- Figma: add the relevant file/frame URL here

# Implementation Notes

- The Obsidian integration uses the official desktop CLI behind a local MCP wrapper.
- The vault must be opened once in Obsidian Desktop before the wrapper can target it reliably.

# Open Questions

- Do you want to keep using this project-scoped vault, or point the wrapper at a larger shared vault later?

# Next Actions

- Open this vault in Obsidian Desktop.
- Enable the Obsidian CLI setting.
- Run `./scripts/setup-codex-mcp.sh`.
