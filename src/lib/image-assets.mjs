import imageManifest from "../generated/image-manifest.mjs";

export const DEFAULT_SHARE_IMAGE = "/images/projects/shinjuku-nav-1-optimized.jpg";

function normalizePath(src) {
  if (typeof src !== "string") {
    return null;
  }

  const trimmed = src.trim();
  return trimmed.startsWith("/images/") ? trimmed : null;
}

export function getImageAsset(src) {
  const normalized = normalizePath(src);
  if (!normalized) {
    return null;
  }

  return imageManifest[normalized] ?? null;
}

export function getImageDimensions(src) {
  const asset = getImageAsset(src);
  if (!asset) {
    return null;
  }

  return {
    width: asset.width,
    height: asset.height,
  };
}

export function getPictureSourceSet(variants = []) {
  return variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");
}

export function getLargestVariant(variants = []) {
  return variants.reduce((largest, current) => {
    if (!largest || current.width > largest.width) {
      return current;
    }

    return largest;
  }, null);
}

export function getFallbackImagePath(src) {
  const asset = getImageAsset(src);
  return asset?.fallbackSrc ?? normalizePath(src) ?? src ?? DEFAULT_SHARE_IMAGE;
}

export function getLightboxImagePath(src) {
  const asset = getImageAsset(src);
  if (!asset) {
    return normalizePath(src) ?? src ?? DEFAULT_SHARE_IMAGE;
  }

  return asset.lightboxSrc ?? getLargestVariant(asset.webp)?.src ?? getFallbackImagePath(src);
}

export function getShareImagePath(src, fallback = DEFAULT_SHARE_IMAGE) {
  const asset = getImageAsset(src);
  if (asset?.shareSrc) {
    return asset.shareSrc;
  }

  const normalized = normalizePath(src);
  if (!normalized) {
    return fallback;
  }

  const extension = normalized.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg" || extension === "png") {
    return normalized;
  }

  return fallback;
}
