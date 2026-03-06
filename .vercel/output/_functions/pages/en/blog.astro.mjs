import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_AumSkbV1.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CjHSrjbq.mjs';
import { $ as $$BlogPostCard } from '../../chunks/BlogPostCard_DuUj2TN5.mjs';
import { $ as $$FadeIn } from '../../chunks/FadeIn_DHVrZLlp.mjs';
import { g as getCollection } from '../../chunks/_astro_content_D8shtTCv.mjs';
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getCollection("blog", ({ id }) => {
    return id.startsWith("en/");
  });
  allPosts.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Blog | Daniel Malmqvist", "lang": "en" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-16 md:py-24 max-w-4xl mx-auto px-4 md:px-0"> ${renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 0 }, { "default": async ($$result3) => renderTemplate` <h1 class="text-4xl md:text-5xl font-black text-[var(--color-text-heading)] mb-4">
Writing
</h1> <p class="text-xl text-[var(--color-text-secondary)] font-medium mb-16 max-w-2xl">
Thoughts on architecture, agentic automation, and building
                better data pipelines for the AEC industry.
</p> ` })} <div class="space-y-4"> ${allPosts.map((post, i) => renderTemplate`${renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": i * 100 }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "BlogPostCard", $$BlogPostCard, { "post": post, "lang": "en" })} ` })}`)} </div> </section> ` })}`;
}, "C:/Repositories/malmqvist.dev/astro/src/pages/en/blog/index.astro", void 0);

const $$file = "C:/Repositories/malmqvist.dev/astro/src/pages/en/blog/index.astro";
const $$url = "/en/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
