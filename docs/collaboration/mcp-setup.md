# Codex MCP Collaboration Setup

This repo now includes a project-scoped collaboration setup for:

- Paper Desktop MCP
- Figma MCP via the official remote server
- Codex as the MCP host
- Obsidian via the official Obsidian CLI, wrapped as a local MCP server

## What lives in this repo

- `scripts/setup-codex-mcp.sh`
  - Registers `paper`, `figma`, and `obsidian` with the Codex CLI without needlessly replacing already-correct entries.
- `scripts/install-paper-linux.sh`
  - Downloads and installs the official Paper Linux AppImage, icon, and desktop launcher.
- `scripts/obsidian-cli-mcp.mjs`
  - Exposes a small MCP tool surface backed by the official `obsidian` CLI.
- `collab/obsidian-vault/`
  - A tracked, project-scoped Obsidian vault for specs, work items, and design handoff notes.

## Prerequisites

1. Codex CLI is installed and available as `codex`.
2. Paper Desktop is installed, open, and has MCP enabled.
   - On Linux, you can install it with `./scripts/install-paper-linux.sh`.
   - The local MCP server is exposed by the running app at `http://127.0.0.1:29979/mcp`.
3. Figma uses the official remote MCP endpoint at `https://mcp.figma.com/mcp` by default.
   - On first registration, Codex starts the OAuth flow in your browser.
   - If you are on a supported desktop setup and want the local server instead, override `FIGMA_MCP_URL=http://127.0.0.1:3845/mcp`.
4. Obsidian Desktop is installed.
5. In Obsidian:
   - Open `collab/obsidian-vault` once as a vault.
   - Enable `Settings > General > Advanced > Command line interface`.

The Obsidian MCP wrapper uses the official CLI commands exposed by the desktop app. If the vault has not been opened once, or if the CLI setting is still disabled, the wrapper will return a clear startup error.

This setup is meant for a local Codex host with access to desktop apps. In heavily sandboxed environments, direct calls into the Obsidian desktop app can fail with Linux/Electron sandbox errors.

## Setup

Run:

```bash
./scripts/setup-codex-mcp.sh
```

Optional overrides:

```bash
PAPER_MCP_URL=http://127.0.0.1:29979/mcp \
FIGMA_MCP_URL=https://mcp.figma.com/mcp \
OBSIDIAN_VAULT_ROOT=/absolute/path/to/vault \
OBSIDIAN_VAULT_NAME="My Vault Name" \
./scripts/setup-codex-mcp.sh
```

After setup, verify:

```bash
codex mcp list
```

## Obsidian tools exposed to Codex

The local MCP wrapper exposes the official CLI operations we need for collaboration:

- `obsidian_list_vaults`
- `obsidian_search_files`
- `obsidian_list_files`
- `obsidian_read_note`
- `obsidian_backlinks`
- `obsidian_create_note`
- `obsidian_append_note`
- `obsidian_prepend_note`
- `obsidian_read_property`
- `obsidian_set_property`
- `obsidian_open_note`

Under the hood, these delegate to the built-in Obsidian CLI commands such as `files`, `read`, `backlinks`, `create`, `append`, `prepend`, `property:read`, `property:set`, and `open`.

## Recommended workflow

- Keep the authoritative work item in `collab/obsidian-vault/Work Items/`.
- Link the Paper frame URL and Figma file/frame URL in note frontmatter.
- Use Codex to:
  - read the work item note
  - inspect the linked Paper/Figma context through MCP
  - implement the code change
  - propose note updates back into Obsidian

Recommended note fields:

- `id`
- `title`
- `status`
- `paper_url`
- `figma_url`
- `repo_path`
- `branch`
- `owner`
- `updated_at`

## Example prompts

- `Read the work item note for DM-001, inspect the selected Figma frame, and summarize what needs to change in the Astro site.`
- `Use the linked Obsidian work item and the selected Paper frame to rewrite the hero copy so they match.`
- `After finishing this implementation, update the work item status and next actions in Obsidian.`
