const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const EOCD_SIGNATURE = 0x06054b50;
const EOCD_BYTES = 22;
const MAX_COMMENT_BYTES = 0xffff;
const MAX_ENTRIES = 0xffff;

function uint16(view: DataView, offset: number): number {
  return view.getUint16(offset, true);
}

function uint32(view: DataView, offset: number): number {
  return view.getUint32(offset, true);
}

async function bytes(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await blob.arrayBuffer());
}

function safeEntryPath(raw: string): string | null {
  const path = raw.replace(/\\/g, "/").replace(/^\.\//, "");
  if (path === "" || path.endsWith("/")) return null;
  if (path.startsWith("/") || /^[a-zA-Z]:/.test(path)) {
    throw new Error(`Zip entry uses an absolute path: ${raw}`);
  }
  const parts = path.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`Zip entry escapes its bundle folder: ${raw}`);
  }
  return parts.join("/");
}

function contentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const byExtension: Record<string, string> = {
    json: "application/json",
    geojson: "application/geo+json",
    glb: "model/gltf-binary",
    gltf: "model/gltf+json",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    bin: "application/octet-stream",
    b3dm: "application/octet-stream",
    subtree: "application/octet-stream",
  };
  return ext ? (byExtension[ext] ?? "application/octet-stream") : "application/octet-stream";
}

function findEndRecord(tail: Uint8Array): number {
  const view = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
  for (let offset = tail.byteLength - EOCD_BYTES; offset >= 0; offset -= 1) {
    if (uint32(view, offset) === EOCD_SIGNATURE) return offset;
  }
  throw new Error("This file is not a readable zip archive.");
}

async function inflateEntry(data: Blob, expectedSize: number): Promise<Blob> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error(
      "This zip uses compression that this browser cannot open. Use the zip exported by 3D Tiles Viewer.",
    );
  }
  let stream: ReadableStream<Uint8Array>;
  try {
    stream = data.stream().pipeThrough(new DecompressionStream("deflate-raw"));
  } catch {
    throw new Error(
      "This zip uses unsupported compression. Use the zip exported by 3D Tiles Viewer.",
    );
  }
  const decompressed = await new Response(stream).blob();
  if (decompressed.size !== expectedSize) {
    throw new Error("A compressed zip entry did not expand to its recorded size.");
  }
  return decompressed;
}

/**
 * Opens the central directory without reading the whole archive. Store-only
 * entries from the authoring app stay as Blob slices backed by the original
 * File; deflated entries are expanded one at a time.
 */
export async function filesFromVenueZip(archive: File): Promise<File[]> {
  if (archive.size < EOCD_BYTES) {
    throw new Error("This file is too small to be a zip archive.");
  }

  const tailStart = Math.max(0, archive.size - EOCD_BYTES - MAX_COMMENT_BYTES);
  const tail = await bytes(archive.slice(tailStart));
  const endOffset = findEndRecord(tail);
  const endView = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
  const diskNumber = uint16(endView, endOffset + 4);
  const centralDisk = uint16(endView, endOffset + 6);
  const entriesOnDisk = uint16(endView, endOffset + 8);
  const entryCount = uint16(endView, endOffset + 10);
  const centralSize = uint32(endView, endOffset + 12);
  const centralOffset = uint32(endView, endOffset + 16);

  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== entryCount) {
    throw new Error("Multi-volume zip archives are not supported.");
  }
  if (entryCount === MAX_ENTRIES || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
    throw new Error("ZIP64 archives are not supported. Export fewer buildings at once.");
  }
  if (centralOffset + centralSize > archive.size) {
    throw new Error("The zip central directory points outside the file.");
  }

  const central = await bytes(archive.slice(centralOffset, centralOffset + centralSize));
  const centralView = new DataView(central.buffer, central.byteOffset, central.byteLength);
  const utf8 = new TextDecoder("utf-8", { fatal: false });
  const output: File[] = [];
  let cursor = 0;

  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > central.length || uint32(centralView, cursor) !== CENTRAL_SIGNATURE) {
      throw new Error("The zip central directory is incomplete.");
    }
    const flags = uint16(centralView, cursor + 8);
    const method = uint16(centralView, cursor + 10);
    const compressedSize = uint32(centralView, cursor + 20);
    const uncompressedSize = uint32(centralView, cursor + 24);
    const nameLength = uint16(centralView, cursor + 28);
    const extraLength = uint16(centralView, cursor + 30);
    const commentLength = uint16(centralView, cursor + 32);
    const localOffset = uint32(centralView, cursor + 42);
    const recordLength = 46 + nameLength + extraLength + commentLength;

    if (cursor + recordLength > central.length) {
      throw new Error("A zip directory entry extends beyond the central directory.");
    }
    if (flags & 0x0001) {
      throw new Error("Encrypted zip entries are not supported.");
    }
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
      throw new Error("ZIP64 entries are not supported.");
    }

    const rawName = utf8.decode(central.subarray(cursor + 46, cursor + 46 + nameLength));
    const path = safeEntryPath(rawName);
    cursor += recordLength;
    if (path === null) continue;

    const localHeader = await bytes(archive.slice(localOffset, localOffset + 30));
    if (localHeader.length !== 30) throw new Error(`Zip entry is missing its local header: ${path}`);
    const localView = new DataView(
      localHeader.buffer,
      localHeader.byteOffset,
      localHeader.byteLength,
    );
    if (uint32(localView, 0) !== LOCAL_SIGNATURE) {
      throw new Error(`Zip entry has an invalid local header: ${path}`);
    }
    const localNameLength = uint16(localView, 26);
    const localExtraLength = uint16(localView, 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    if (dataStart + compressedSize > archive.size) {
      throw new Error(`Zip entry data extends beyond the archive: ${path}`);
    }

    const compressed = archive.slice(dataStart, dataStart + compressedSize);
    let data: Blob;
    if (method === 0) {
      if (compressedSize !== uncompressedSize) {
        throw new Error(`Stored zip entry has inconsistent sizes: ${path}`);
      }
      data = compressed;
    } else if (method === 8) {
      data = await inflateEntry(compressed, uncompressedSize);
    } else {
      throw new Error(`Unsupported zip compression method ${method}: ${path}`);
    }

    const file = new File([data], path.split("/").pop() ?? path, {
      type: contentType(path),
      lastModified: archive.lastModified,
    });
    Object.defineProperty(file, "relativePath", {
      value: path,
      configurable: true,
    });
    output.push(file);
  }

  if (output.length === 0) {
    throw new Error("The zip contains no files.");
  }
  return output;
}
