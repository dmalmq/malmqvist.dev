import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const PUBLIC_DIR = path.join(ROOT, "public");
const GENERATED_DIR = path.join(PUBLIC_DIR, "images", "_generated");
const MANIFEST_PATH = path.join(ROOT, "src", "generated", "image-manifest.mjs");

const SOURCE_WIDTHS = [800, 1400, 2000];
const SOURCE_FILE_EXTENSIONS = new Set([
  ".astro",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".md",
  ".mdx",
  ".json",
]);
const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const SCREENSHOT_HINTS = [
  "screenshot",
  "screen",
  "ui",
  "revit",
  "nav",
  "converter",
  "tengbom",
  "digital-twin",
];

function toPublicPath(filePath) {
  return filePath.replaceAll(path.sep, "/");
}

function sanitizeName(src) {
  return src
    .replace(/^\/images\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replaceAll("/", "__");
}

function getQualityProfile(src) {
  const lowered = src.toLowerCase();
  const isScreenshot = SCREENSHOT_HINTS.some((hint) => lowered.includes(hint));

  if (isScreenshot) {
    return {
      avif: { quality: 58, effort: 7 },
      webp: { quality: 82 },
      jpeg: { quality: 84 },
    };
  }

  return {
    avif: { quality: 46, effort: 6 },
    webp: { quality: 74 },
    jpeg: { quality: 80 },
  };
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath));
      continue;
    }

    if (SOURCE_FILE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function collectReferencedImages() {
  const files = await walk(SRC_DIR);
  const matches = new Set();
  const pattern = /\/images\/[A-Za-z0-9_./-]+\.(?:avif|AVIF|gif|GIF|jpe?g|JPE?G|png|PNG|svg|SVG|webp|WEBP)/g;

  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf8");
    for (const match of content.matchAll(pattern)) {
      const imagePath = match[0];
      if (imagePath.includes("/_generated/")) {
        continue;
      }

      const extension = path.extname(imagePath).toLowerCase();
      if (RASTER_EXTENSIONS.has(extension)) {
        matches.add(imagePath);
      }
    }
  }

  return Array.from(matches).sort();
}

function getResizedDimensions(width, height, targetWidth) {
  if (width <= targetWidth) {
    return {
      width,
      height,
    };
  }

  return {
    width: targetWidth,
    height: Math.round((height / width) * targetWidth),
  };
}

async function ensureDir(directory) {
  await fs.mkdir(directory, { recursive: true });
}

async function writeManifest(manifest) {
  const moduleSource = `const imageManifest = ${JSON.stringify(manifest, null, 2)};\n\nexport default imageManifest;\n`;
  await ensureDir(path.dirname(MANIFEST_PATH));
  await fs.writeFile(MANIFEST_PATH, moduleSource);
}

async function generateVariants(src) {
  const filePath = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
  const extension = path.extname(src).toLowerCase();
  const quality = getQualityProfile(src);
  const metadata = await sharp(filePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Missing dimensions for ${src}`);
  }

  const assetName = sanitizeName(src);
  const widths = SOURCE_WIDTHS
    .map((targetWidth) => getResizedDimensions(metadata.width, metadata.height, targetWidth))
    .filter((value, index, values) => values.findIndex((entry) => entry.width === value.width) === index);

  const variants = {
    avif: [],
    webp: [],
  };

  for (const entry of widths) {
    const resizeOptions = {
      width: entry.width,
      withoutEnlargement: true,
    };

    const avifName = `${assetName}-${entry.width}w.avif`;
    const webpName = `${assetName}-${entry.width}w.webp`;
    const avifOutput = path.join(GENERATED_DIR, avifName);
    const webpOutput = path.join(GENERATED_DIR, webpName);

    await sharp(filePath)
      .rotate()
      .resize(resizeOptions)
      .avif(quality.avif)
      .toFile(avifOutput);
    await sharp(filePath)
      .rotate()
      .resize(resizeOptions)
      .webp(quality.webp)
      .toFile(webpOutput);

    variants.avif.push({
      src: toPublicPath(path.posix.join("/images/_generated", avifName)),
      width: entry.width,
      height: entry.height,
    });
    variants.webp.push({
      src: toPublicPath(path.posix.join("/images/_generated", webpName)),
      width: entry.width,
      height: entry.height,
    });
  }

  let shareSrc = src;
  let fallbackSrc = src;

  if (extension === ".webp" || extension === ".avif") {
    const shareWidth = Math.min(metadata.width, 1600);
    const shareHeight = Math.round((metadata.height / metadata.width) * shareWidth);
    const shareName = `${assetName}-share.jpg`;
    const shareOutput = path.join(GENERATED_DIR, shareName);

    await sharp(filePath)
      .rotate()
      .resize({
        width: shareWidth,
        withoutEnlargement: true,
      })
      .jpeg({
        quality: quality.jpeg.quality,
        progressive: true,
        mozjpeg: true,
      })
      .toFile(shareOutput);

    shareSrc = toPublicPath(path.posix.join("/images/_generated", shareName));
    fallbackSrc = shareSrc;

    return {
      width: metadata.width,
      height: metadata.height,
      avif: variants.avif,
      webp: variants.webp,
      fallbackSrc,
      shareSrc,
      lightboxSrc: variants.webp[variants.webp.length - 1]?.src ?? shareSrc,
    };
  }

  return {
    width: metadata.width,
    height: metadata.height,
    avif: variants.avif,
    webp: variants.webp,
    fallbackSrc,
    shareSrc,
    lightboxSrc: variants.webp[variants.webp.length - 1]?.src ?? fallbackSrc,
  };
}

async function clearGeneratedDirectory() {
  await fs.rm(GENERATED_DIR, { recursive: true, force: true });
  await ensureDir(GENERATED_DIR);
}

async function main() {
  await clearGeneratedDirectory();
  const referencedImages = await collectReferencedImages();
  const manifest = {};

  for (const src of referencedImages) {
    manifest[src] = await generateVariants(src);
  }

  await writeManifest(manifest);

  console.log(`Generated responsive assets for ${referencedImages.length} images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
