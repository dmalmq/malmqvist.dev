import { DEFAULT_SHARE_IMAGE, getShareImagePath } from "./image-assets.mjs";

export const SITE_URL = "https://malmqvist.dev";
export const PERSON_NAME = "Daniel Malmqvist";

export function buildAbsoluteUrl(pathOrUrl, site = SITE_URL) {
  return new URL(pathOrUrl, site).toString();
}

export function buildArticleJsonLd({
  type,
  title,
  description,
  path,
  image,
  publishedTime,
  lang,
  keywords = [],
  site = SITE_URL,
}) {
  const canonicalUrl = buildAbsoluteUrl(path, site);
  const shareImage = buildAbsoluteUrl(
    getShareImagePath(image, DEFAULT_SHARE_IMAGE),
    site,
  );

  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    description,
    inLanguage: lang,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    datePublished: publishedTime,
    image: shareImage,
    keywords,
    author: {
      "@type": "Person",
      name: PERSON_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: PERSON_NAME,
      url: SITE_URL,
      image: shareImage,
    },
  };
}
