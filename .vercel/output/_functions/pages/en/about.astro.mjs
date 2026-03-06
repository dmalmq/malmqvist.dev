import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from '../../chunks/astro/server_AumSkbV1.mjs';
import 'piccolore';
import { $ as $$BaseLayout, u as useTranslations } from '../../chunks/BaseLayout_CjHSrjbq.mjs';
import { $ as $$FadeIn } from '../../chunks/FadeIn_DHVrZLlp.mjs';
import { $ as $$Timeline } from '../../chunks/Timeline_DEUr879E.mjs';
import { $ as $$SkillsGrid } from '../../chunks/SkillsGrid_LRwpsqDd.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$About = createComponent(($$result, $$props, $$slots) => {
  const t = useTranslations("en");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Daniel Malmqvist",
    url: "https://malmqvist.dev",
    image: "https://malmqvist.dev/images/projects/shinjuku-nav-1.png",
    jobTitle: "BIM Manager & Developer",
    worksFor: [
      {
        "@type": "Organization",
        name: "JRE Consultants"
      },
      {
        "@type": "Organization",
        name: "Tengbom"
      }
    ],
    sameAs: ["https://github.com/dmalmq", "https://linkedin.com/in/dmalmq"]
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "About | Daniel Malmqvist", "lang": "en" }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(['  <script type="application/ld+json">', "<\/script> ", '<section class="py-16 md:py-24 max-w-4xl mx-auto px-4 md:px-0"> ', ' <div class="mt-12 space-y-8 text-lg text-[var(--color-text-secondary)] leading-relaxed"> ', " ", " </div> ", ' <div class="mt-20"> ', " </div> </section> "])), unescapeHTML(JSON.stringify(jsonLd)), maybeRenderHead(), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 0 }, { "default": ($$result3) => renderTemplate` <div class="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-[var(--color-border)] pb-10 mb-10"> <div class="shrink-0 flex items-center justify-center p-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm dark:shadow-[0_0_20px_var(--color-accent-glow)]"> <img src="/images/profile-img.JPG" alt="Daniel Malmqvist" class="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover"> </div> <div> <h1 class="text-4xl md:text-5xl font-black text-[var(--color-text-heading)] mb-4"> ${t("about.title")} </h1> <p class="text-xl md:text-2xl text-[var(--color-text-secondary)] font-medium leading-relaxed mb-4">
I bridge the gap between architectural fundamentals, complex BIM
            workflows, and emerging technology.
</p> <div class="flex flex-wrap gap-4 text-sm font-medium text-[var(--color-text-primary)]"> <span class="flex items-center gap-1.5 bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-md border border-[var(--color-border)]"> <svg class="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
Based in Tokyo with my family
</span> <span class="flex items-center gap-1.5 bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-md border border-[var(--color-border)]"> <svg class="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
JLPT N3 Certified (N2 in progress, July 2026)
</span> </div> </div> </div> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 100 }, { "default": ($$result3) => renderTemplate` <p>
My career spans the full arc of spatial creation. From traditional
          architecture and construction deliverables to cutting-edge city-scale
          digital twins in Tokyo.
</p> <p class="mt-6">
I started my career at <strong class="text-[var(--color-text-primary)]">Tengbom</strong>—one of the Nordic region's oldest and most respected architecture
          firms—spending 7 years working on major institutional projects like
          the award-winning Ersta Sjukhus hospital and the 330m Terminal 5
          expansion at Stockholm Arlanda Airport. I didn't just coordinate
          files; I built massive, complex geometry like façade systems from
          scratch, navigating interdisciplinary clash resolutions and tight
          fabrication deadlines.
</p> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 200 }, { "default": ($$result3) => renderTemplate` <p>
Over time, I found the traditional AEC tools lacking. I am an <strong class="text-[var(--color-text-primary)]">architect-turned-BIM-manager who learned to code</strong>, and that distinction matters. Today I live in Tokyo, developing
          custom tools and agentic pipelines that bypass native legacy data
          conversions, feeding direct building information directly into spatial
          twins like PLATEAU.
</p> <p class="mt-6">
I believe that the most powerful BIM solutions are built by people who
          genuinely understand both the strict <em>architectural design intent</em> and the <em>technical data pipeline</em> required to deploy it.
</p> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 300 }, { "default": ($$result3) => renderTemplate` <div class="mt-20"> ${renderComponent($$result3, "FadeIn", $$FadeIn, { "delay": 300 }, { "default": ($$result4) => renderTemplate` <h2 class="text-3xl font-bold text-[var(--color-text-heading)] mb-8">
Skills & Tools
</h2> ${renderComponent($$result4, "SkillsGrid", $$SkillsGrid, { "lang": "en" })} ` })} </div> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 400 }, { "default": ($$result3) => renderTemplate` <h2 class="text-3xl font-bold text-[var(--color-text-heading)] mb-8">
Experience
</h2> ${renderComponent($$result3, "Timeline", $$Timeline, { "lang": "en" })} ` })) })}`;
}, "C:/Repositories/malmqvist.dev/astro/src/pages/en/about.astro", void 0);

const $$file = "C:/Repositories/malmqvist.dev/astro/src/pages/en/about.astro";
const $$url = "/en/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
