#!/usr/bin/env bash
set -euo pipefail

CODEX_BIN="${CODEX_BIN:-codex}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

PAPER_MCP_URL="${PAPER_MCP_URL:-http://127.0.0.1:29979/mcp}"
FIGMA_MCP_URL="${FIGMA_MCP_URL:-https://mcp.figma.com/mcp}"
OBSIDIAN_VAULT_ROOT="${OBSIDIAN_VAULT_ROOT:-${REPO_ROOT}/collab/obsidian-vault}"
OBSIDIAN_VAULT_NAME="${OBSIDIAN_VAULT_NAME:-}"
OBSIDIAN_BIN="${OBSIDIAN_BIN:-obsidian}"

server_info() {
  local name="$1"

  "${CODEX_BIN}" mcp get "${name}" 2>/dev/null || true
}

ensure_url_server() {
  local name="$1"
  local url="$2"
  local info

  info="$(server_info "${name}")"
  if [[ "${info}" == *"transport: streamable_http"* ]] && [[ "${info}" == *"url: ${url}"* ]]; then
    echo "Keeping existing ${name} MCP registration at ${url}"
    return
  fi

  if [[ -n "${info}" ]]; then
    "${CODEX_BIN}" mcp remove "${name}" >/dev/null 2>&1 || true
  fi

  "${CODEX_BIN}" mcp add "${name}" --url "${url}"
}

ensure_stdio_server() {
  local name="$1"
  shift
  local command="$1"
  shift
  local args=("$@")
  local info expected_args

  expected_args="${args[*]}"
  info="$(server_info "${name}")"
  if [[ "${info}" == *"transport: stdio"* ]] && [[ "${info}" == *"command: ${command}"* ]] && [[ "${info}" == *"args: ${expected_args}"* ]]; then
    echo "Keeping existing ${name} MCP registration"
    return
  fi

  if [[ -n "${info}" ]]; then
    "${CODEX_BIN}" mcp remove "${name}" >/dev/null 2>&1 || true
  fi

  "${CODEX_BIN}" mcp add "${name}" -- "${command}" "${args[@]}"
}

if ! command -v "${CODEX_BIN}" >/dev/null 2>&1; then
  echo "Could not find Codex CLI binary: ${CODEX_BIN}" >&2
  exit 1
fi

if ! command -v "${OBSIDIAN_BIN}" >/dev/null 2>&1; then
  echo "Could not find Obsidian binary: ${OBSIDIAN_BIN}" >&2
  exit 1
fi

echo "Registering Paper MCP at ${PAPER_MCP_URL}"
ensure_url_server paper "${PAPER_MCP_URL}"

echo "Registering Figma MCP at ${FIGMA_MCP_URL}"
ensure_url_server figma "${FIGMA_MCP_URL}"

echo "Registering Obsidian MCP wrapper for ${OBSIDIAN_VAULT_ROOT}"
OBSIDIAN_ARGS=(
  node
  "${REPO_ROOT}/scripts/obsidian-cli-mcp.mjs"
  --vault-root
  "${OBSIDIAN_VAULT_ROOT}"
  --obsidian-bin
  "${OBSIDIAN_BIN}"
)

if [[ -n "${OBSIDIAN_VAULT_NAME}" ]]; then
  OBSIDIAN_ARGS+=(--vault-name "${OBSIDIAN_VAULT_NAME}")
fi

ensure_stdio_server obsidian "${OBSIDIAN_ARGS[@]}"

echo
echo "Registered MCP servers:"
"${CODEX_BIN}" mcp list
echo
echo "Prerequisites:"
echo "  1. Paper desktop app must be running with MCP enabled."
echo "  2. Figma uses the official remote MCP endpoint by default. On first setup, Codex will open an OAuth flow."
echo "  3. Open ${OBSIDIAN_VAULT_ROOT} once in Obsidian and enable Settings > General > Advanced > Command line interface."
