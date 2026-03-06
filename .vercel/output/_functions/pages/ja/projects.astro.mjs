import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_AumSkbV1.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CjHSrjbq.mjs';
import { $ as $$ProjectCard } from '../../chunks/ProjectCard_DqVntrIw.mjs';
import { $ as $$FadeIn } from '../../chunks/FadeIn_DHVrZLlp.mjs';
import { g as getCollection } from '../../chunks/_astro_content_D8shtTCv.mjs';
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allProjects = await getCollection("projects", ({ id }) => {
    return id.startsWith("ja/");
  });
  allProjects.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8 | Daniel Malmqvist", "lang": "ja" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> ${renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 0 }, { "default": async ($$result3) => renderTemplate` <h1 class="text-4xl md:text-5xl font-black text-[var(--color-text-heading)] mb-4" style="font-family: 'Noto Sans JP', sans-serif;">
プロジェクト
</h1> <p class="text-xl text-[var(--color-text-secondary)] font-medium mb-12" style="font-family: 'Noto Sans JP', sans-serif;">
最新のデジタルツイン、データパイプライン、BIM自動化などを掲載しています。
</p> ` })} <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> ${allProjects.map((project, i) => renderTemplate`${renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": i * 100 }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "ProjectCard", $$ProjectCard, { "project": project, "lang": "ja" })} ` })}`)} </div> </section> ` })}`;
}, "C:/Repositories/malmqvist.dev/astro/src/pages/ja/projects/index.astro", void 0);

const $$file = "C:/Repositories/malmqvist.dev/astro/src/pages/ja/projects/index.astro";
const $$url = "/ja/projects";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
