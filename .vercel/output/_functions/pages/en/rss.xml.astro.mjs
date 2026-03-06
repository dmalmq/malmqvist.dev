import rss from '@astrojs/rss';
import { g as getCollection } from '../../chunks/_astro_content_D8shtTCv.mjs';
export { renderers } from '../../renderers.mjs';

async function GET(context) {
  const posts = await getCollection("blog", ({ id }) => {
    return id.startsWith("en/");
  });
  return rss({
    title: "Daniel Malmqvist | Blog",
    description: "Thoughts on architecture, agentic automation, and building better data pipelines for the AEC industry.",
    site: context.site || "https://malmqvist.dev",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      // Calculate the correct slug from id e.g. "en/some-post" -> "some-post"
      link: `/en/blog/${post.id.split("/").pop()?.replace(/\.mdx?$/, "")}/`
    })),
    customData: `<language>en-us</language>`
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
