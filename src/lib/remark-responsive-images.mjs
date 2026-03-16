import imageManifest from "../generated/image-manifest.mjs";

const DEFAULT_SIZES = "(min-width: 90rem) 72rem, 100vw";

function visit(node, callback) {
  callback(node);

  if (!node || !Array.isArray(node.children)) {
    return;
  }

  for (const child of node.children) {
    visit(child, callback);
  }
}

function buildSourceSet(variants = []) {
  return variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");
}

function escapeAttribute(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildPictureHtml(src, alt) {
  const asset = imageManifest[src];
  if (!asset) {
    return null;
  }

  const escapedAlt = escapeAttribute(alt ?? "");
  const avif = asset.avif?.length
    ? `<source type="image/avif" srcset="${buildSourceSet(asset.avif)}" sizes="${DEFAULT_SIZES}">`
    : "";
  const webp = asset.webp?.length
    ? `<source type="image/webp" srcset="${buildSourceSet(asset.webp)}" sizes="${DEFAULT_SIZES}">`
    : "";

  return `<picture class="block h-full w-full" data-responsive-image>${avif}${webp}<img src="${asset.fallbackSrc}" alt="${escapedAlt}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async"></picture>`;
}

export default function remarkResponsiveImages() {
  return (tree) => {
    visit(tree, (node) => {
      if (!node || !Array.isArray(node.children)) {
        return;
      }

      node.children = node.children.map((child) => {
        if (child?.type !== "image" || typeof child.url !== "string") {
          return child;
        }

        const html = buildPictureHtml(child.url, child.alt);
        if (!html) {
          return child;
        }

        return {
          type: "html",
          value: html,
        };
      });
    });
  };
}
