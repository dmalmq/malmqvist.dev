/**
 * Browser-only 3D Tiles loading from a local folder.
 * Adapted from dmalmq/3D-Tiles-Viewer `tilesetLoader.js` + `fileSystemAccess.js`.
 * Files are read in-memory and rewritten to blob URLs. Nothing is uploaded.
 */

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

function normalizeUri(uri: string): string {
  return uri.replace(/\\/g, "/").replace(/^\.\//, "");
}

function joinPath(dir: string, rel: string): string {
  const cleaned = normalizeUri(rel);
  if (!cleaned || /^(https?:|blob:|data:)/i.test(cleaned)) return cleaned;
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

function isJsonTilesetUri(uri: string): boolean {
  const path = normalizeUri(uri).split("?")[0].toLowerCase();
  return path.endsWith(".json");
}

type BlobCleanup = {
  blobUrls: string[];
};

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

async function rewriteTilesetFile(
  file: File,
  filesByPath: Map<string, File>,
  rewrittenJson: Map<string, string>,
  cleanup: BlobCleanup,
): Promise<string> {
  const filePath = fileRelPath(file);
  const cached = rewrittenJson.get(filePath);
  if (cached) return cached;

  const json = JSON.parse(await file.text()) as { root?: unknown };
  const baseDir = dirOf(filePath);
  await rewriteNode(json.root, baseDir, filesByPath, rewrittenJson, cleanup);

  const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  cleanup.blobUrls.push(url);
  rewrittenJson.set(filePath, url);
  return url;
}

async function rewriteContentUri(
  original: string | undefined,
  baseDir: string,
  filesByPath: Map<string, File>,
  rewrittenJson: Map<string, string>,
  cleanup: BlobCleanup,
): Promise<string | undefined> {
  if (!original || /^(https?:|blob:|data:)/i.test(original)) return original;
  const resolved = joinPath(baseDir, original);
  const file = filesByPath.get(resolved) ?? filesByPath.get(normalizeUri(original));
  if (!file) return original;
  if (isJsonTilesetUri(original)) {
    return rewriteTilesetFile(file, filesByPath, rewrittenJson, cleanup);
  }
  const url = URL.createObjectURL(file);
  cleanup.blobUrls.push(url);
  return url;
}

async function rewriteNode(
  tile: unknown,
  baseDir: string,
  filesByPath: Map<string, File>,
  rewrittenJson: Map<string, string>,
  cleanup: BlobCleanup,
): Promise<void> {
  if (!tile || typeof tile !== "object") return;
  const node = tile as {
    content?: { uri?: string; url?: string };
    contents?: Array<{ uri?: string; url?: string }>;
    children?: unknown[];
  };

  if (node.content) {
    const key = node.content.uri != null ? "uri" : "url";
    const next = await rewriteContentUri(
      node.content[key],
      baseDir,
      filesByPath,
      rewrittenJson,
      cleanup,
    );
    if (next) node.content[key] = next;
  }

  if (Array.isArray(node.contents)) {
    for (const content of node.contents) {
      const key = content.uri != null ? "uri" : "url";
      const next = await rewriteContentUri(
        content[key],
        baseDir,
        filesByPath,
        rewrittenJson,
        cleanup,
      );
      if (next) content[key] = next;
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await rewriteNode(child, baseDir, filesByPath, rewrittenJson, cleanup);
    }
  }
}

export type LocalTilesetHandle = {
  url: string;
  label: string;
  fileCount: number;
  cleanup: () => void;
};

export async function prepareLocalTileset(
  files: File[],
): Promise<LocalTilesetHandle> {
  if (!files.length) {
    throw new Error("No files selected.");
  }

  const filesByPath = new Map<string, File>();
  for (const file of files) {
    filesByPath.set(fileRelPath(file), file);
  }

  const root = pickRootTileset(files);
  const cleanup: BlobCleanup = { blobUrls: [] };
  const rewrittenJson = new Map<string, string>();
  const url = await rewriteTilesetFile(
    root,
    filesByPath,
    rewrittenJson,
    cleanup,
  );

  return {
    url,
    label: fileRelPath(root),
    fileCount: files.length,
    cleanup: () => {
      for (const blobUrl of cleanup.blobUrls) URL.revokeObjectURL(blobUrl);
      cleanup.blobUrls.length = 0;
    },
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
