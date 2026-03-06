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
  const t = useTranslations("ja");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "\u30C0\u30CB\u30A8\u30EB \u30DE\u30EB\u30E0\u30AF\u30D3\u30B9\u30C8 (Daniel Malmqvist)",
    url: "https://malmqvist.dev/ja",
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u6982\u8981 | Daniel Malmqvist", "lang": "ja" }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(['  <script type="application/ld+json">', "<\/script> ", '<section class="py-16 md:py-24 max-w-4xl mx-auto px-4 md:px-0"> ', ` <div class="mt-12 space-y-8 text-lg text-[var(--color-text-secondary)] leading-relaxed" style="font-family: 'Noto Sans JP', sans-serif;"> `, " ", " </div> ", ' <div class="mt-20"> ', " </div> </section> "])), unescapeHTML(JSON.stringify(jsonLd)), maybeRenderHead(), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 0 }, { "default": ($$result3) => renderTemplate` <div class="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-[var(--color-border)] pb-10 mb-10"> <div class="shrink-0 flex items-center justify-center p-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm dark:shadow-[0_0_20px_var(--color-accent-glow)]"> <img src="/images/profile-img.JPG" alt="ダニエル マルムクビスト" class="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover"> </div> <div> <h1 class="text-4xl md:text-5xl font-black text-[var(--color-text-heading)] mb-4" style="font-family: 'Noto Sans JP', sans-serif;"> ${t("about.title")} </h1> <p class="text-xl md:text-2xl text-[var(--color-text-secondary)] font-bold leading-relaxed mb-4" style="font-family: 'Noto Sans JP', sans-serif;">
建築の基礎知識、複雑なBIMワークフロー、そして新たなテクノロジーの架け橋に。
</p> <div class="flex flex-wrap gap-4 text-sm font-medium text-[var(--color-text-primary)]" style="font-family: 'Noto Sans JP', sans-serif;"> <span class="flex items-center gap-1.5 bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-md border border-[var(--color-border)]"> <svg class="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
家族と共に東京在住
</span> <span class="flex items-center gap-1.5 bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-md border border-[var(--color-border)]"> <svg class="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
日本語能力試験 N3合格 (N2取得に向け学習中)
</span> </div> </div> </div> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 100 }, { "default": ($$result3) => renderTemplate` <p>
スウェーデンでの伝統的な建築および建設プロセスから、現在の東京における最先端の都市デジタルツイン開発まで、一貫して空間デザイン・データ構築の最前線でキャリアを積んできました。
</p> <p class="mt-6">
北欧で最も伝統と由緒ある建築事務所の一つである<strong class="text-[var(--color-text-primary)] font-bold">Tengbom</strong>で7年間勤務し、受賞歴のある病院建築（Ersta
          Sjukhus）やストックホルム・アーランダ空港ターミナル5拡張など、大規模かつ複雑なプロジェクトに参画。単なるデータ管理にとどまらず、複雑なファサードシステムのモデリングから、各専門分野が交錯する設備調整、そして厳しい施工期限に向けたマネジメントまでを牽引しました。
</p> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 200 }, { "default": ($$result3) => renderTemplate` <p>
その経験の中で、既存のAEC（建築・エンジニアリング・建設）ツールだけでは対応できない限界を感じました。私は「BIMを学んだソフトウェア開発者」ではなく、<strong class="text-[var(--color-text-primary)] font-bold">プログラミング技術を習得したBIMマネージャー・建築家</strong>です。現在私は東京に拠点を移し、建築のネイティブデータをレガシーなファイル変換プロセスから解放し、PLATEAUのような最先端のデジタルツイン空間に直接・自動的にデータを流し込むための「Agentic
          Programming（自律的AIを活用したプログラム開発）」のパイプライン化に取り組んでいます。
</p> <p class="mt-6">
建築家の意図する「緻密なデザイン」と、それを実装するための「技術的データパイプライン」。その両方を深く理解する者こそが、最も強力なBIMソリューションを生み出せると信じています。
</p> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 300 }, { "default": ($$result3) => renderTemplate` <div class="mt-20"> ${renderComponent($$result3, "FadeIn", $$FadeIn, { "delay": 300 }, { "default": ($$result4) => renderTemplate` <h2 class="text-3xl font-bold text-[var(--color-text-heading)] mb-8" style="font-family: 'Noto Sans JP', sans-serif;">
スキル・ツール
</h2> ${renderComponent($$result4, "SkillsGrid", $$SkillsGrid, { "lang": "ja" })} ` })} </div> ` }), renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 400 }, { "default": ($$result3) => renderTemplate` <h2 class="text-3xl font-bold text-[var(--color-text-heading)] mb-8" style="font-family: 'Noto Sans JP', sans-serif;">
職歴
</h2> ${renderComponent($$result3, "Timeline", $$Timeline, { "lang": "ja" })} ` })) })}`;
}, "C:/Repositories/malmqvist.dev/astro/src/pages/ja/about.astro", void 0);

const $$file = "C:/Repositories/malmqvist.dev/astro/src/pages/ja/about.astro";
const $$url = "/ja/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
