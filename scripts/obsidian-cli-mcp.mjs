#!/usr/bin/env node

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { basename, relative, resolve, sep } from "node:path";
import { access, mkdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import process from "node:process";

const execFileAsync = promisify(execFile);

const DEFAULT_PROTOCOL_VERSION = "2025-06-18";
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_OBSIDIAN_CONFIG_PATH =
  process.env.OBSIDIAN_CONFIG_PATH ||
  `${process.env.HOME || ""}/.config/obsidian/obsidian.json`;

function parseArgs(argv) {
  const options = {
    obsidianBin: process.env.OBSIDIAN_BIN || "obsidian",
    vaultRoot: process.env.OBSIDIAN_VAULT_ROOT || null,
    vaultName: process.env.OBSIDIAN_VAULT_NAME || null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--obsidian-bin") {
      options.obsidianBin = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--vault-root") {
      options.vaultRoot = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--vault-name") {
      options.vaultName = argv[index + 1];
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.vaultRoot) {
    throw new Error(
      "Missing vault root. Set OBSIDIAN_VAULT_ROOT or pass --vault-root.",
    );
  }

  options.vaultRoot = resolve(options.vaultRoot);

  return options;
}

function jsonRpcError(code, message, data) {
  return {
    code,
    message,
    ...(data === undefined ? {} : { data }),
  };
}

function writeMessage(message) {
  const body = JSON.stringify(message);
  process.stdout.write(
    `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`,
  );
}

function okText(payload) {
  const text =
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

  return {
    content: [{ type: "text", text }],
    ...(typeof payload === "string" ? {} : { structuredContent: payload }),
  };
}

function errorText(message, data) {
  return {
    content: [
      {
        type: "text",
        text:
          data === undefined
            ? String(message)
            : `${String(message)}\n\n${JSON.stringify(data, null, 2)}`,
      },
    ],
    isError: true,
  };
}

function normalizeOutput(output) {
  return output
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => {
      if (!line.trim()) {
        return false;
      }

      if (/^\d{4}-\d{2}-\d{2}\s/.test(line)) {
        return false;
      }

      if (line.startsWith("Received command line")) {
        return false;
      }

      return true;
    })
    .join("\n")
    .trim();
}

function encodeValue(value) {
  return String(value).replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}

async function ensureReadable(path) {
  await access(path, constants.R_OK);
}

async function loadKnownVaults(configPath) {
  try {
    const raw = await readFile(configPath, "utf8");
    const parsed = JSON.parse(raw);
    const vaults = parsed?.vaults ?? {};

    return Object.values(vaults)
      .filter((vault) => vault && typeof vault.path === "string")
      .map((vault) => resolve(vault.path));
  } catch {
    return [];
  }
}

function isKnownVaultPath(vaultRoot, knownVaults) {
  return knownVaults.some((vaultPath) => vaultPath === vaultRoot);
}

function toProjectPath(vaultRoot, absolutePath) {
  const projectPath = relative(vaultRoot, absolutePath);
  return projectPath === "" ? "." : projectPath.split(sep).join("/");
}

function parseJsonArrayOutput(output) {
  const trimmed = output.trim();
  if (!trimmed) {
    return [];
  }
  return JSON.parse(trimmed);
}

class ObsidianCliBridge {
  constructor(options) {
    this.obsidianBin = options.obsidianBin;
    this.vaultRoot = options.vaultRoot;
    this.vaultName = options.vaultName || basename(options.vaultRoot);
    this.configPath = DEFAULT_OBSIDIAN_CONFIG_PATH;
    this.ready = false;
  }

  async initialize() {
    await mkdir(this.vaultRoot, { recursive: true });
    await ensureReadable(this.vaultRoot);

    const knownVaults = await loadKnownVaults(this.configPath);
    if (!isKnownVaultPath(this.vaultRoot, knownVaults)) {
      throw new Error(
        [
          `Obsidian does not know this vault yet: ${this.vaultRoot}`,
          "Open this folder once in the Obsidian desktop app so it appears in the vault list.",
          "Then enable Settings > General > Advanced > Command line interface.",
        ].join(" "),
      );
    }

    this.ready = true;
  }

  async run(command, entries = [], options = {}) {
    if (!this.ready) {
      throw new Error("Obsidian MCP bridge has not been initialized.");
    }

    const args = [];

    if (!options.skipVaultSelector) {
      args.push(`vault=${this.vaultName}`);
    }

    args.push(command);

    for (const entry of entries) {
      if (!entry) {
        continue;
      }

      args.push(entry);
    }

    try {
      const { stdout, stderr } = await execFileAsync(this.obsidianBin, args, {
        cwd: this.vaultRoot,
        timeout: DEFAULT_TIMEOUT_MS,
        maxBuffer: 5 * 1024 * 1024,
      });
      const combined = normalizeOutput([stdout, stderr].filter(Boolean).join("\n"));

      if (
        combined.includes("Command line interface is not enabled") ||
        combined.includes("Vault not found.")
      ) {
        throw new Error(combined);
      }

      return combined;
    } catch (error) {
      const stdout = normalizeOutput(error.stdout || "");
      const stderr = normalizeOutput(error.stderr || "");
      const details = [stdout, stderr].filter(Boolean).join("\n").trim();

      if (details) {
        if (details.includes("sandbox_host_linux.cc")) {
          throw new Error(
            "Obsidian CLI could not reach the desktop app from this sandboxed host. Run Codex with local desktop access, then try again.",
          );
        }

        throw new Error(details);
      }

      throw error;
    }
  }

  async listVaults({ verbose = false } = {}) {
    const args = [];
    if (verbose) {
      args.push("verbose");
    }
    const output = await this.run("vaults", args);
    const lines = output ? output.split("\n").filter(Boolean) : [];
    return {
      vaults: lines.map((line) => {
        if (!verbose) {
          return { name: line };
        }
        const [name, path] = line.split("\t");
        return { name, path };
      }),
    };
  }

  async searchFiles({ query, limit = 20 }) {
    const entries = [`query=${encodeValue(query)}`, `limit=${limit}`];
    const output = await this.run("__files", entries);
    const files = parseJsonArrayOutput(output).map((file) => ({
      path: file,
    }));
    return { files };
  }

  async listFiles({ folder, ext, total = false } = {}) {
    const entries = [];
    if (folder) {
      entries.push(`folder=${folder}`);
    }
    if (ext) {
      entries.push(`ext=${ext}`);
    }
    if (total) {
      entries.push("total");
    }

    const output = await this.run("files", entries);

    if (total) {
      return { total: Number(output || 0) };
    }

    return {
      files: output
        ? output.split("\n").filter(Boolean).map((path) => ({ path }))
        : [],
    };
  }

  async readNote({ file, path }) {
    const entries = [];
    if (file) {
      entries.push(`file=${file}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }
    const content = await this.run("read", entries);
    return { file: file || null, path: path || null, content };
  }

  async listBacklinks({ file, path, counts = false, total = false, format = "json" }) {
    const entries = [];
    if (file) {
      entries.push(`file=${file}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }
    if (counts) {
      entries.push("counts");
    }
    if (total) {
      entries.push("total");
    }
    if (!total) {
      entries.push(`format=${format}`);
    }

    const output = await this.run("backlinks", entries);
    if (total) {
      return { total: Number(output || 0) };
    }

    if (format === "json") {
      return { backlinks: JSON.parse(output) };
    }

    return { output };
  }

  async createNote({ name, path, content, overwrite = false, open = false, newtab = false }) {
    const entries = [];
    if (name) {
      entries.push(`name=${name}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }
    if (content !== undefined) {
      entries.push(`content=${encodeValue(content)}`);
    }
    if (overwrite) {
      entries.push("overwrite");
    }
    if (open) {
      entries.push("open");
    }
    if (newtab) {
      entries.push("newtab");
    }

    const output = await this.run("create", entries);
    return { message: output };
  }

  async appendNote({ file, path, content, inline = false }) {
    const entries = [];
    if (file) {
      entries.push(`file=${file}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }
    entries.push(`content=${encodeValue(content)}`);
    if (inline) {
      entries.push("inline");
    }

    const output = await this.run("append", entries);
    return { message: output };
  }

  async prependNote({ file, path, content, inline = false }) {
    const entries = [];
    if (file) {
      entries.push(`file=${file}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }
    entries.push(`content=${encodeValue(content)}`);
    if (inline) {
      entries.push("inline");
    }

    const output = await this.run("prepend", entries);
    return { message: output };
  }

  async readProperty({ name, file, path }) {
    const entries = [`name=${name}`];
    if (file) {
      entries.push(`file=${file}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }

    const value = await this.run("property:read", entries);
    return { name, value };
  }

  async setProperty({ name, value, type, file, path }) {
    const entries = [`name=${name}`];
    if (file) {
      entries.push(`file=${file}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }
    if (type) {
      entries.push(`type=${type}`);
    }

    let encodedValue = value;
    if (Array.isArray(value)) {
      encodedValue = JSON.stringify(value);
    } else if (typeof value === "object" && value !== null) {
      encodedValue = JSON.stringify(value);
    } else if (typeof value === "boolean") {
      encodedValue = value ? "true" : "false";
    }

    entries.push(`value=${encodeValue(encodedValue)}`);

    const output = await this.run("property:set", entries);
    return { message: output };
  }

  async openNote({ file, path, newtab = false }) {
    const entries = [];
    if (file) {
      entries.push(`file=${file}`);
    }
    if (path) {
      entries.push(`path=${path}`);
    }
    if (newtab) {
      entries.push("newtab");
    }

    const output = await this.run("open", entries);
    return { message: output };
  }
}

const tools = [
  {
    name: "obsidian_list_vaults",
    description: "List known Obsidian vaults from the desktop app.",
    inputSchema: {
      type: "object",
      properties: {
        verbose: { type: "boolean", default: false },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    handler: (bridge, args) => bridge.listVaults(args || {}),
  },
  {
    name: "obsidian_search_files",
    description:
      "Fuzzy-search note paths using the official Obsidian CLI's internal file search.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 200, default: 20 },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    handler: (bridge, args) => bridge.searchFiles(args),
  },
  {
    name: "obsidian_list_files",
    description: "List note files in the current Obsidian vault.",
    inputSchema: {
      type: "object",
      properties: {
        folder: { type: "string" },
        ext: { type: "string" },
        total: { type: "boolean", default: false },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    handler: (bridge, args) => bridge.listFiles(args || {}),
  },
  {
    name: "obsidian_read_note",
    description: "Read the full contents of a note by file name or exact vault path.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string" },
        path: { type: "string" },
      },
      additionalProperties: false,
      anyOf: [{ required: ["file"] }, { required: ["path"] }],
    },
    annotations: { readOnlyHint: true },
    handler: (bridge, args) => bridge.readNote(args),
  },
  {
    name: "obsidian_backlinks",
    description: "List backlinks to a note in the current Obsidian vault.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string" },
        path: { type: "string" },
        counts: { type: "boolean", default: false },
        total: { type: "boolean", default: false },
        format: {
          type: "string",
          enum: ["json", "tsv", "csv"],
          default: "json",
        },
      },
      additionalProperties: false,
      anyOf: [{ required: ["file"] }, { required: ["path"] }],
    },
    annotations: { readOnlyHint: true },
    handler: (bridge, args) => bridge.listBacklinks(args),
  },
  {
    name: "obsidian_create_note",
    description: "Create a new note through the official Obsidian CLI.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        path: { type: "string" },
        content: { type: "string" },
        overwrite: { type: "boolean", default: false },
        open: { type: "boolean", default: false },
        newtab: { type: "boolean", default: false },
      },
      additionalProperties: false,
      anyOf: [{ required: ["name"] }, { required: ["path"] }],
    },
    handler: (bridge, args) => bridge.createNote(args),
  },
  {
    name: "obsidian_append_note",
    description: "Append content to an existing note through the official Obsidian CLI.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string" },
        path: { type: "string" },
        content: { type: "string" },
        inline: { type: "boolean", default: false },
      },
      required: ["content"],
      additionalProperties: false,
      anyOf: [{ required: ["file"] }, { required: ["path"] }],
    },
    handler: (bridge, args) => bridge.appendNote(args),
  },
  {
    name: "obsidian_prepend_note",
    description: "Prepend content to an existing note through the official Obsidian CLI.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string" },
        path: { type: "string" },
        content: { type: "string" },
        inline: { type: "boolean", default: false },
      },
      required: ["content"],
      additionalProperties: false,
      anyOf: [{ required: ["file"] }, { required: ["path"] }],
    },
    handler: (bridge, args) => bridge.prependNote(args),
  },
  {
    name: "obsidian_read_property",
    description: "Read a frontmatter property from a note.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        file: { type: "string" },
        path: { type: "string" },
      },
      required: ["name"],
      additionalProperties: false,
      anyOf: [{ required: ["file"] }, { required: ["path"] }],
    },
    annotations: { readOnlyHint: true },
    handler: (bridge, args) => bridge.readProperty(args),
  },
  {
    name: "obsidian_set_property",
    description: "Set a frontmatter property on a note.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        value: {
          anyOf: [
            { type: "string" },
            { type: "number" },
            { type: "boolean" },
            { type: "array", items: { type: "string" } },
          ],
        },
        type: {
          type: "string",
          enum: ["text", "list", "number", "checkbox", "date", "datetime"],
        },
        file: { type: "string" },
        path: { type: "string" },
      },
      required: ["name", "value"],
      additionalProperties: false,
      anyOf: [{ required: ["file"] }, { required: ["path"] }],
    },
    handler: (bridge, args) => bridge.setProperty(args),
  },
  {
    name: "obsidian_open_note",
    description: "Open a note in the Obsidian desktop app.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string" },
        path: { type: "string" },
        newtab: { type: "boolean", default: false },
      },
      additionalProperties: false,
      anyOf: [{ required: ["file"] }, { required: ["path"] }],
    },
    handler: (bridge, args) => bridge.openNote(args),
  },
];

function toolByName(name) {
  return tools.find((tool) => tool.name === name);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const bridge = new ObsidianCliBridge(options);
  await bridge.initialize();

  let buffer = Buffer.alloc(0);

  async function handleMessage(message) {
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.method === "notifications/initialized") {
      return;
    }

    if (message.id === undefined) {
      return;
    }

    try {
      if (message.method === "initialize") {
        writeMessage({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion:
              message.params?.protocolVersion || DEFAULT_PROTOCOL_VERSION,
            serverInfo: {
              name: "obsidian-cli-mcp",
              version: "0.1.0",
            },
            capabilities: {
              tools: {
                listChanged: false,
              },
            },
          },
        });
        return;
      }

      if (message.method === "ping") {
        writeMessage({
          jsonrpc: "2.0",
          id: message.id,
          result: {},
        });
        return;
      }

      if (message.method === "tools/list") {
        writeMessage({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            tools: tools.map(({ handler, ...tool }) => tool),
          },
        });
        return;
      }

      if (message.method === "tools/call") {
        const tool = toolByName(message.params?.name);
        if (!tool) {
          throw jsonRpcError(-32601, `Unknown tool: ${message.params?.name}`);
        }

        try {
          const result = await tool.handler(bridge, message.params?.arguments || {});
          writeMessage({
            jsonrpc: "2.0",
            id: message.id,
            result: okText(result),
          });
        } catch (error) {
          writeMessage({
            jsonrpc: "2.0",
            id: message.id,
            result: errorText(error.message || String(error)),
          });
        }
        return;
      }

      throw jsonRpcError(-32601, `Method not found: ${message.method}`);
    } catch (error) {
      const normalized =
        error && typeof error.code === "number"
          ? error
          : jsonRpcError(-32603, error.message || String(error));

      writeMessage({
        jsonrpc: "2.0",
        id: message.id,
        error: normalized,
      });
    }
  }

  function processBuffer() {
    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        return;
      }

      const headers = buffer.slice(0, headerEnd).toString("utf8");
      const match = headers.match(/Content-Length:\s*(\d+)/i);

      if (!match) {
        buffer = buffer.slice(headerEnd + 4);
        continue;
      }

      const contentLength = Number(match[1]);
      const messageEnd = headerEnd + 4 + contentLength;
      if (buffer.length < messageEnd) {
        return;
      }

      const payload = buffer
        .slice(headerEnd + 4, messageEnd)
        .toString("utf8");
      buffer = buffer.slice(messageEnd);

      let parsed;
      try {
        parsed = JSON.parse(payload);
      } catch (error) {
        writeMessage({
          jsonrpc: "2.0",
          id: null,
          error: jsonRpcError(-32700, `Parse error: ${error.message}`),
        });
        continue;
      }

      void handleMessage(parsed);
    }
  }

  process.stdin.on("readable", () => {
    let chunk;

    while ((chunk = process.stdin.read()) !== null) {
      buffer = Buffer.concat([
        buffer,
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
      ]);
      processBuffer();
    }
  });

  process.stdin.resume();

  const keepAlive = setInterval(() => {}, 60_000);

  const shutdown = () => {
    clearInterval(keepAlive);
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((error) => {
  writeMessage({
    jsonrpc: "2.0",
    id: null,
    error: jsonRpcError(
      -32000,
      error.message || "Failed to start Obsidian CLI MCP bridge.",
    ),
  });
  process.exitCode = 1;
});
