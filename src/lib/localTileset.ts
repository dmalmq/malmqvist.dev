/**
 * Browser-only 3D Tiles loading from a local folder.
 * Adapted from dmalmq/3D-Tiles-Viewer `tilesetLoader.js` + `fileSystemAccess.js`.
 * Files are read in-memory and rewritten to blob URLs. Nothing is uploaded.
 */
import {
  parseVenueManifest,
  type VenueManifest,
  type VenueSource,
} from "./venueBundle";

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export async function getFilesFromDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  path = "",
): Promise<File[]> {
  const files: File[] = [];
  for await (const [name, entry] of dirHandle.entries()) {
    const entryPath = path ? `${path}/${name}` : name;
    if (entry.kind === "file") {
      const file = await (entry as FileSystemFileHandle).getFile();
      Object.defineProperty(file, "relativePath", {
        value: entryPath,
        configurable: true,
      });
      files.push(file);
    } else if (entry.kind === "directory") {
      const nested = await getFilesFromDirectoryHandle(
        entry as FileSystemDirectoryHandle,
        entryPath,
      );
      files.push(...nested);
    }
  }
  return files;
}

function fileRelPath(file: File): string {
  const tagged = file as File & { relativePath?: string };
  return (tagged.relativePath || file.webkitRelativePath || file.name).replace(
    /\\/g,
    "/",
  );
}

function stripQueryAndHash(uri: string): string {
  return uri.split("#")[0].split("?")[0];
}

function decodePath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function normalizeUri(uri: string): string {
  return decodePath(
    stripQueryAndHash(uri).replace(/\\/g, "/").replace(/^\.\//, ""),
  );
}

function isAbsoluteContentUri(uri: string): boolean {
  return /^(https?:|blob:|data:)/i.test(uri);
}

function isUriTemplate(uri: string): boolean {
  return /\{(?:level|x|y|z)\}/i.test(stripQueryAndHash(uri));
}

function joinPath(dir: string, rel: string): string {
  const cleaned = normalizeUri(rel);
  if (!cleaned || isAbsoluteContentUri(cleaned)) return cleaned;
  const parts: string[] = [];
  const prefix = dir ? `${dir}/${cleaned}` : cleaned;
  for (const part of prefix.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

function dirOf(filePath: string): string {
  const idx = filePath.lastIndexOf("/");
  return idx === -1 ? "" : filePath.slice(0, idx);
}

function extensionOf(path: string): string {
  const name = normalizeUri(path).split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function relToBase(filePath: string, baseDir: string): string {
  if (!baseDir) return filePath;
  const prefix = `${baseDir}/`;
  return filePath.startsWith(prefix) ? filePath.slice(prefix.length) : filePath;
}

function lookupFile(
  original: string,
  baseDir: string,
  filesByPath: Map<string, File>,
): File | undefined {
  const resolved = joinPath(baseDir, original);
  return (
    filesByPath.get(resolved) ??
    filesByPath.get(normalizeUri(original)) ??
    filesByPath.get(normalizeUri(resolved))
  );
}

function templateToRegex(pattern: string): RegExp {
  const escaped = normalizeUri(pattern).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withSlots = escaped
    .replace(/\\\{level\\\}/gi, "[^/]+")
    .replace(/\\\{x\\\}/gi, "[^/]+")
    .replace(/\\\{y\\\}/gi, "[^/]+")
    .replace(/\\\{z\\\}/gi, "[^/]+");
  return new RegExp(`^${withSlots}$`, "i");
}

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function pad4(n: number): number {
  return (n + 3) & ~3;
}

type BlobCleanup = {
  blobUrls: Set<string>;
  pathBlobs: Map<string, string>;
  uninstall: () => void;
};

type RewriteCtx = {
  filesByPath: Map<string, File>;
  rewritten: Map<string, string>;
  pending: Set<string>;
  cycleWaiters: Map<string, Set<string>>;
  cleanup: BlobCleanup;
};

const activePathBlobs: BlobCleanup["pathBlobs"][] = [];
const activeBlobUrls: BlobCleanup["blobUrls"][] = [];
let redirectDepth = 0;
let restoreRedirect: (() => void) | null = null;

function urlMatchesRelative(url: string, rel: string): boolean {
  if (!rel) return false;
  const stripped = stripQueryAndHash(url);
  if (stripped === rel || stripped.endsWith(`/${rel}`)) return true;
  try {
    const decoded = decodePath(stripped);
    if (decoded === rel || decoded.endsWith(`/${rel}`)) return true;
  } catch {
    // Keep the raw comparison.
  }
  const encoded = encodeURI(rel);
  return stripped.endsWith(rel) || stripped.endsWith(encoded);
}

function blobForRequestUrl(url: string): string | undefined {
  if (url.startsWith("blob:")) {
    // Cesium appends ?v=<asset.tilesetVersion> to content requests, and a blob
    // URL only resolves without a query or hash.
    const bare = stripQueryAndHash(url);
    if (bare === url) return undefined;
    return activeBlobUrls.some((minted) => minted.has(bare)) ? bare : undefined;
  }
  for (const map of activePathBlobs) {
    const exact = map.get(stripQueryAndHash(url)) ?? map.get(normalizeUri(url));
    if (exact) return exact;
    for (const [rel, blob] of map) {
      if (urlMatchesRelative(url, rel)) return blob;
    }
  }
  return undefined;
}

function installBlobRedirects(): () => void {
  redirectDepth += 1;
  if (restoreRedirect) {
    return () => {
      redirectDepth = Math.max(0, redirectDepth - 1);
      if (redirectDepth === 0) {
        restoreRedirect?.();
        restoreRedirect = null;
      }
    };
  }

  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const href =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const mapped = blobForRequestUrl(href);
    if (!mapped) return originalFetch(input, init);
    if (typeof Request !== "undefined" && input instanceof Request) {
      return originalFetch(new Request(mapped, input), init);
    }
    return originalFetch(mapped, init);
  };

  const XHR = globalThis.XMLHttpRequest;
  const originalOpen = XHR?.prototype.open;
  if (XHR && originalOpen) {
    XHR.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      const href = typeof url === "string" ? url : String(url);
      const mapped = blobForRequestUrl(href);
      return originalOpen.call(
        this,
        method,
        mapped ?? url,
        async ?? true,
        username,
        password,
      );
    };
  }

  restoreRedirect = () => {
    globalThis.fetch = originalFetch;
    if (XHR && originalOpen) XHR.prototype.open = originalOpen;
  };

  return () => {
    redirectDepth = Math.max(0, redirectDepth - 1);
    if (redirectDepth === 0) {
      restoreRedirect?.();
      restoreRedirect = null;
    }
  };
}

function rememberBlob(ctx: RewriteCtx, url: string): string {
  ctx.cleanup.blobUrls.add(url);
  return url;
}

function rememberPathBlob(ctx: RewriteCtx, relPath: string, url: string): void {
  const key = normalizeUri(relPath);
  if (!key) return;
  ctx.cleanup.pathBlobs.set(key, url);
  ctx.cleanup.pathBlobs.set(relPath, url);
}

function pickRootTileset(files: File[]): File {
  const jsonFiles = files.filter((file) => {
    const name = fileRelPath(file).split("/").pop()?.toLowerCase();
    return name === "tileset.json";
  });
  const pool = jsonFiles.length > 0 ? jsonFiles : files.filter((file) =>
    fileRelPath(file).toLowerCase().endsWith("tileset.json"),
  );
  if (pool.length === 0) {
    throw new Error("No tileset.json found in the selected folder.");
  }
  return [...pool].sort(
    (a, b) => fileRelPath(a).length - fileRelPath(b).length,
  )[0];
}

function parseGlb(bytes: Uint8Array): { json: Record<string, unknown>; bin: Uint8Array | null } {
  if (bytes.byteLength < 12) {
    throw new Error("GLB is too small to parse.");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    throw new Error("File is not a GLB.");
  }
  let offset = 12;
  let json: Record<string, unknown> | undefined;
  let bin: Uint8Array | null = null;
  while (offset + 8 <= bytes.byteLength) {
    const chunkLen = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const end = start + chunkLen;
    if (end > bytes.byteLength) {
      throw new Error("GLB chunk overruns the file.");
    }
    const chunk = bytes.subarray(start, end);
    if (chunkType === JSON_CHUNK) {
      const text = new TextDecoder().decode(chunk).replace(/\0+$/g, "").trimEnd();
      json = JSON.parse(text) as Record<string, unknown>;
    } else if (chunkType === BIN_CHUNK) {
      bin = chunk;
    }
    offset = end;
  }
  if (!json) {
    throw new Error("GLB has no JSON chunk.");
  }
  return { json, bin };
}

function rebuildGlb(jsonText: string, bin: Uint8Array | null): Uint8Array<ArrayBuffer> {
  const jsonBytes = new TextEncoder().encode(jsonText);
  const jsonPadded = pad4(jsonBytes.length);
  const binPadded = bin ? pad4(bin.byteLength) : 0;
  const total = 12 + 8 + jsonPadded + (bin ? 8 + binPadded : 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonPadded, true);
  view.setUint32(16, JSON_CHUNK, true);
  out.set(jsonBytes, 20);
  out.fill(0x20, 20 + jsonBytes.length, 20 + jsonPadded);
  if (bin) {
    const binAt = 20 + jsonPadded;
    view.setUint32(binAt, binPadded, true);
    view.setUint32(binAt + 4, BIN_CHUNK, true);
    out.set(bin, binAt + 8);
  }
  return out;
}

async function rewriteUriFields(
  value: unknown,
  baseDir: string,
  ctx: RewriteCtx,
  depth = 0,
): Promise<boolean> {
  if (depth > 24 || value == null || typeof value !== "object") return false;
  let changed = false;
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (await rewriteUriFields(entry, baseDir, ctx, depth + 1)) changed = true;
    }
    return changed;
  }
  const rec = value as Record<string, unknown>;
  if (typeof rec.schemaUri === "string") {
    const next = await resolveUri(rec.schemaUri, baseDir, ctx);
    if (next !== rec.schemaUri) {
      rec.schemaUri = next;
      changed = true;
    }
  }
  for (const [key, nested] of Object.entries(rec)) {
    if ((key === "uri" || key === "url") && typeof nested === "string") {
      const next = await resolveUri(nested, baseDir, ctx);
      if (next !== nested) {
        rec[key] = next;
        changed = true;
      }
    } else if (await rewriteUriFields(nested, baseDir, ctx, depth + 1)) {
      changed = true;
    }
  }
  return changed;
}

async function registerTemplateMatches(
  original: string,
  baseDir: string,
  ctx: RewriteCtx,
): Promise<void> {
  const pattern = joinPath(baseDir, original);
  const regex = templateToRegex(pattern);
  let matched = 0;
  for (const [filePath, file] of ctx.filesByPath) {
    if (!regex.test(filePath) && !regex.test(normalizeUri(filePath))) continue;
    const url = await rewriteFileToBlob(file, ctx);
    rememberPathBlob(ctx, relToBase(filePath, baseDir), url);
    matched += 1;
  }
  if (matched === 0) {
    throw new Error(
      `Tileset content is not in the selected folder: ${original}`,
    );
  }
}

function noteCycleWaiter(
  ctx: RewriteCtx,
  filePath: string,
  original: string,
  baseDir: string,
): void {
  let waiters = ctx.cycleWaiters.get(filePath);
  if (!waiters) {
    waiters = new Set();
    ctx.cycleWaiters.set(filePath, waiters);
  }
  waiters.add(original);
  const resolved = joinPath(baseDir, original);
  if (resolved) waiters.add(resolved);
  waiters.add(filePath);
  const relative = relToBase(filePath, baseDir);
  if (relative) waiters.add(relative);
}

async function resolveUri(
  original: string,
  baseDir: string,
  ctx: RewriteCtx,
): Promise<string> {
  if (isAbsoluteContentUri(original)) return original;
  if (isUriTemplate(original)) {
    await registerTemplateMatches(original, baseDir, ctx);
    return original;
  }
  const file = lookupFile(original, baseDir, ctx.filesByPath);
  if (!file) {
    throw new Error(
      `Tileset content is not in the selected folder: ${original}`,
    );
  }
  const filePath = fileRelPath(file);
  const cached = ctx.rewritten.get(filePath);
  if (cached) return cached;
  if (ctx.pending.has(filePath)) {
    noteCycleWaiter(ctx, filePath, original, baseDir);
    return original;
  }
  return rewriteFileToBlob(file, ctx);
}

async function rewriteJsonDocument(file: File, ctx: RewriteCtx): Promise<string> {
  const filePath = fileRelPath(file);
  const json = JSON.parse(await file.text()) as unknown;
  await rewriteUriFields(json, dirOf(filePath), ctx);
  const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
  return rememberBlob(ctx, URL.createObjectURL(blob));
}

async function rewriteGltfDocument(file: File, ctx: RewriteCtx): Promise<string> {
  const filePath = fileRelPath(file);
  const json = JSON.parse(await file.text()) as unknown;
  await rewriteUriFields(json, dirOf(filePath), ctx);
  const blob = new Blob([JSON.stringify(json)], { type: "model/gltf+json" });
  return rememberBlob(ctx, URL.createObjectURL(blob));
}

async function rewriteGlbDocument(file: File, ctx: RewriteCtx): Promise<string> {
  const filePath = fileRelPath(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  let parsed: { json: Record<string, unknown>; bin: Uint8Array | null };
  try {
    parsed = parseGlb(bytes);
  } catch {
    return rememberBlob(ctx, URL.createObjectURL(file));
  }
  const changed = await rewriteUriFields(parsed.json, dirOf(filePath), ctx);
  if (!changed) {
    return rememberBlob(ctx, URL.createObjectURL(file));
  }
  const rebuilt = rebuildGlb(JSON.stringify(parsed.json), parsed.bin);
  const blob = new Blob([rebuilt], { type: "model/gltf-binary" });
  return rememberBlob(ctx, URL.createObjectURL(blob));
}

async function rewriteFileToBlob(file: File, ctx: RewriteCtx): Promise<string> {
  const filePath = fileRelPath(file);
  const cached = ctx.rewritten.get(filePath);
  if (cached) return cached;
  if (ctx.pending.has(filePath)) {
    throw new Error(`Tileset rewrite re-entered ${filePath} before its blob URL existed`);
  }

  ctx.pending.add(filePath);
  try {
    const ext = extensionOf(filePath);
    let url: string;
    if (ext === ".gltf") {
      url = await rewriteGltfDocument(file, ctx);
    } else if (ext === ".glb") {
      url = await rewriteGlbDocument(file, ctx);
    } else if (ext === ".json") {
      url = await rewriteJsonDocument(file, ctx);
    } else {
      url = rememberBlob(ctx, URL.createObjectURL(file));
    }
    ctx.rewritten.set(filePath, url);
    const waiters = ctx.cycleWaiters.get(filePath);
    if (waiters) {
      for (const rel of waiters) rememberPathBlob(ctx, rel, url);
      ctx.cycleWaiters.delete(filePath);
    }
    return url;
  } finally {
    ctx.pending.delete(filePath);
  }
}

export type LocalTilesetHandle = {
  url: string;
  label: string;
  fileCount: number;
  attach: () => void;
  detach: () => void;
  cleanup: () => void;
};

type BlobLifecycle = {
  cleanup: BlobCleanup;
  ctx: RewriteCtx;
  attach: () => void;
  detach: () => void;
  revokeAll: () => void;
};

function createBlobLifecycle(filesByPath: Map<string, File>): BlobLifecycle {
  const pathBlobs = new Map<string, string>();
  const blobUrls = new Set<string>();
  const cleanup: BlobCleanup = { blobUrls, pathBlobs, uninstall: () => {} };
  let attached = false;
  let revoked = false;

  const attach = () => {
    if (attached || revoked) return;
    if (pathBlobs.size === 0 && blobUrls.size === 0) return;
    activePathBlobs.push(pathBlobs);
    activeBlobUrls.push(blobUrls);
    cleanup.uninstall = installBlobRedirects();
    attached = true;
  };

  const detach = () => {
    if (!attached) return;
    attached = false;
    const uninstall = cleanup.uninstall;
    cleanup.uninstall = () => {};
    uninstall();
    const pathIdx = activePathBlobs.indexOf(pathBlobs);
    if (pathIdx >= 0) activePathBlobs.splice(pathIdx, 1);
    const blobIdx = activeBlobUrls.indexOf(blobUrls);
    if (blobIdx >= 0) activeBlobUrls.splice(blobIdx, 1);
  };

  const revokeAll = () => {
    detach();
    revoked = true;
    for (const blobUrl of blobUrls) URL.revokeObjectURL(blobUrl);
    blobUrls.clear();
    pathBlobs.clear();
  };

  return {
    cleanup,
    ctx: {
      filesByPath,
      rewritten: new Map<string, string>(),
      pending: new Set<string>(),
      cycleWaiters: new Map<string, Set<string>>(),
      cleanup,
    },
    attach,
    detach,
    revokeAll,
  };
}

function indexFiles(files: File[]): Map<string, File> {
  const filesByPath = new Map<string, File>();
  for (const file of files) {
    filesByPath.set(fileRelPath(file), file);
  }
  return filesByPath;
}

export async function prepareLocalTileset(
  files: File[],
): Promise<LocalTilesetHandle> {
  if (!files.length) {
    throw new Error("No files selected.");
  }

  const filesByPath = indexFiles(files);
  const root = pickRootTileset(files);
  const life = createBlobLifecycle(filesByPath);

  let url: string | undefined;
  try {
    url = await rewriteFileToBlob(root, life.ctx);
    if (url) life.attach();
  } finally {
    if (!url) life.revokeAll();
  }
  if (!url) {
    throw new Error("Failed to rewrite tileset.json");
  }

  return {
    url,
    label: fileRelPath(root),
    fileCount: files.length,
    attach: life.attach,
    detach: life.detach,
    cleanup: life.revokeAll,
  };
}

export type LocalVenueHandle = {
  source: VenueSource;
  label: string;
  fileCount: number;
  attach: () => void;
  detach: () => void;
  cleanup: () => void;
};

function pickVenueManifestFile(files: File[]): File | undefined {
  const candidates = files.filter(
    (file) => fileRelPath(file).split("/").pop()?.toLowerCase() === "venue.json",
  );
  if (candidates.length === 0) return undefined;
  return [...candidates].sort(
    (a, b) => fileRelPath(a).length - fileRelPath(b).length,
  )[0];
}

/**
 * Opens a picked folder as a venue. A folder holding a `venue-web` bundle keeps
 * its levels, layers, and icons; any other folder falls back to the single
 * tileset it contains so the plain case still works.
 */
export async function prepareLocalVenue(files: File[]): Promise<LocalVenueHandle> {
  if (!files.length) {
    throw new Error("No files selected.");
  }

  const filesByPath = indexFiles(files);
  const manifestFile = pickVenueManifestFile(files);

  if (!manifestFile) {
    const handle = await prepareLocalTileset(files);
    const root = pickRootTileset(files);
    const manifest: VenueManifest = {
      id: "local-tileset",
      name: fileRelPath(root),
      generator: null,
      generatedAt: null,
      synthetic: false,
      levels: [],
      buildings: [
        {
          id: "local",
          name: fileRelPath(root),
          tilesets: [{ levelKey: null, uri: handle.url }],
        },
      ],
      layers: [],
      iconBase: "icons/marker/",
      camera: null,
    };
    return {
      source: { manifest, resolve: (uri) => uri, cleanup: handle.cleanup },
      label: handle.label,
      fileCount: handle.fileCount,
      attach: handle.attach,
      detach: handle.detach,
      cleanup: handle.cleanup,
    };
  }

  const manifestPath = fileRelPath(manifestFile);
  const baseDir = dirOf(manifestPath);
  const manifest = parseVenueManifest(await manifestFile.text());
  const life = createBlobLifecycle(filesByPath);
  const resolved = new Map<string, string>();

  const resolve = (uri: string): string => {
    if (isAbsoluteContentUri(uri)) return uri;
    const key = joinPath(baseDir, uri);
    const cached = resolved.get(key);
    if (cached) return cached;
    const file = filesByPath.get(key) ?? filesByPath.get(normalizeUri(uri));
    if (!file) return uri;
    const url = rememberBlob(life.ctx, URL.createObjectURL(file));
    resolved.set(key, url);
    return url;
  };

  let ready = false;
  try {
    for (const building of manifest.buildings) {
      for (const ref of building.tilesets) {
        const key = joinPath(baseDir, ref.uri);
        const file = filesByPath.get(key);
        if (!file) {
          throw new Error(`Bundle is missing ${ref.uri}`);
        }
        resolved.set(key, await rewriteFileToBlob(file, life.ctx));
      }
    }
    ready = true;
    life.attach();
  } finally {
    if (!ready) life.revokeAll();
  }

  return {
    source: { manifest, resolve, cleanup: life.revokeAll },
    label: manifestPath,
    fileCount: files.length,
    attach: life.attach,
    detach: life.detach,
    cleanup: life.revokeAll,
  };
}

export function describeLocalFolder(files: File[]): string {
  try {
    const root = pickRootTileset(files);
    return `${fileRelPath(root)} · ${files.length} files`;
  } catch {
    return `${files.length} files`;
  }
}
