import { d as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, a as renderTemplate } from './astro/server_AumSkbV1.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro("https://malmqvist.dev");
const $$Timeline = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Timeline;
  const { lang } = Astro2.props;
  const timelineData = [
    {
      year: "2023 - Present",
      role: lang === "ja" ? "BIM\u30C7\u30B8\u30BF\u30EB\u30C4\u30A4\u30F3\u30FB\u30A8\u30F3\u30B8\u30CB\u30A2" : "BIM Digital Twin Engineer",
      company: lang === "ja" ? "JRE Consultants (\u6771\u4EAC)" : "JRE Consultants (Tokyo)",
      desc: lang === "ja" ? "\u65E5\u672C\u306E\u56FD\u571F\u4EA4\u901A\u7701\u4E3B\u5C0E\u306E3D\u90FD\u5E02\u30E2\u30C7\u30EB\u300CPLATEAU\u300D\u3068\u9023\u643A\u3057\u3001\u8A73\u7D30\u306A\u5C4B\u5185\u30E2\u30C7\u30EA\u30F3\u30B0\u3084\u90FD\u5E02\u30B9\u30B1\u30FC\u30EB\u306E\u30C7\u30B8\u30BF\u30EB\u30C4\u30A4\u30F3\u3092\u69CB\u7BC9\u3002\u30CD\u30A4\u30C6\u30A3\u30D6\u306ABIM\u30E2\u30C7\u30EB\u3092\u3001Unity\u7B49\u3067\u52D5\u4F5C\u3059\u308B\u30A4\u30F3\u30BF\u30E9\u30AF\u30C6\u30A3\u30D6\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0\u5411\u3051\u306B\u5909\u63DB\u3059\u308B\u5805\u7262\u306A\u30C7\u30FC\u30BF\u30D1\u30A4\u30D7\u30E9\u30A4\u30F3\u3092\u958B\u767A\u3002" : "Building deep indoor navigation workflows and digital twins by integrating native BIM geometry into the Japanese government-backed PLATEAU 3D city model. Developing custom agentic pipelines to convert and connect complex spatial data formats."
    },
    {
      year: "2021 - 2023",
      role: lang === "ja" ? "BIM\u30DE\u30CD\u30FC\u30B8\u30E3\u30FC" : "BIM Manager",
      company: lang === "ja" ? "Tengbom (\u30B9\u30C8\u30C3\u30AF\u30DB\u30EB\u30E0)" : "Tengbom (Stockholm)",
      desc: lang === "ja" ? "\u30B9\u30C8\u30C3\u30AF\u30DB\u30EB\u30E0\u30FB\u30A2\u30FC\u30E9\u30F3\u30C0\u7A7A\u6E2F\u7B2C5\u30BF\u30FC\u30DF\u30CA\u30EB\u62E1\u5F35\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\uFF08330m\u898F\u6A21\uFF09\u306B\u304A\u3044\u3066\u3001BIM\u30DE\u30CD\u30B8\u30E1\u30F3\u30C8\u3092\u727D\u5F15\u3002\u8907\u96D1\u306A\u30E2\u30C7\u30EB\u306E\u7D71\u5408\u3068\u54C1\u8CEA\u7BA1\u7406\u3092\u6307\u63EE\u3057\u307E\u3057\u305F\u3002" : "Led BIM management for the 330m Terminal 5 expansion at Stockholm Arlanda Airport. Managed weekly model exports, quality control, and served as the key technical resource for the project team."
    },
    {
      year: "2016 - 2021",
      role: lang === "ja" ? "\u5EFA\u7BC9\u8A2D\u8A08 / BIM\u30E2\u30C7\u30E9\u30FC" : "Architect / BIM Modeler",
      company: lang === "ja" ? "Tengbom (\u30B9\u30C8\u30C3\u30AF\u30DB\u30EB\u30E0)" : "Tengbom (Stockholm)",
      desc: lang === "ja" ? "\u53D7\u8CDE\u6B74\u306E\u3042\u308B\u300CErsta Sjukhus\uFF08\u75C5\u9662\uFF09\u300D\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306B\u304A\u3044\u3066\u3001\u4ED6\u793E\u306EIFC\u30C7\u30FC\u30BF\u304B\u3089Revit\u30E2\u30C7\u30EB\u3092\u30BC\u30ED\u304B\u3089\u518D\u69CB\u7BC9\u3002\u7279\u5FB4\u7684\u306A\u30D5\u30A1\u30B5\u30FC\u30C9\u30B7\u30B9\u30C6\u30E0\u306E\u30D7\u30E9\u30A4\u30DE\u30EA\u30E2\u30C7\u30E9\u30FC\u3092\u52D9\u3081\u3001\u8A2D\u5099\u30FB\u69CB\u9020\u3068\u306E\u5E72\u6E09\u30C1\u30A7\u30C3\u30AF\u3068\u65BD\u5DE5\u8ABF\u6574\u3092\u4E3B\u5C0E\u3057\u307E\u3057\u305F\u3002" : "Rebuilt the entire Revit model from scratch based on an IFC model for the award-winning Ersta Sjukhus hospital. Served as primary modeler for the complex facade system, leading interdisciplinary coordination and fabrication meetings."
    }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="relative border-l border-[var(--color-border)] ml-3 md:ml-6 mt-10"> ${timelineData.map((item) => renderTemplate`<div class="mb-10 ml-8 md:ml-12 relative"> <span class="absolute flex items-center justify-center w-4 h-4 rounded-full -left-[39px] md:-left-[55px] ring-4 ring-[var(--color-bg-primary)] bg-[var(--color-accent)]"></span> <div class="flex flex-col md:flex-row md:items-center justify-between mb-2 md:gap-4"> <h3 class="flex items-center text-lg md:text-xl font-bold text-[var(--color-text-heading)]"${addAttribute(
    lang === "ja" ? "font-family: 'Noto Sans JP', sans-serif;" : "",
    "style"
  )}> ${item.role} </h3> <time class="mt-1 md:mt-0 block text-sm font-medium leading-none text-[var(--color-text-secondary)] shrink-0"> ${item.year} </time> </div> <p class="mb-4 text-base font-semibold text-[var(--color-accent)]"${addAttribute(
    lang === "ja" ? "font-family: 'Noto Sans JP', sans-serif;" : "",
    "style"
  )}> ${item.company} </p> <p class="text-base font-normal text-[var(--color-text-secondary)] leading-relaxed"${addAttribute(
    lang === "ja" ? "font-family: 'Noto Sans JP', sans-serif;" : "",
    "style"
  )}> ${item.desc} </p> </div>`)} </div>`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/Timeline.astro", void 0);

export { $$Timeline as $ };
