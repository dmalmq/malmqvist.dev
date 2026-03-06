import { d as createAstro, c as createComponent, m as maybeRenderHead, r as renderComponent, a as renderTemplate } from './astro/server_AumSkbV1.mjs';
import 'piccolore';
import { $ as $$Tag } from './Tag_BeeNrAu4.mjs';

const $$Astro = createAstro("https://malmqvist.dev");
const $$SkillsGrid = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SkillsGrid;
  const { lang } = Astro2.props;
  const skillCategories = [
    {
      name: lang === "ja" ? "\u5EFA\u7BC9\u30FBBIM" : "Architecture & BIM",
      skills: ["Revit", "ArchiCAD", "BIM Coordination", "Clash Detection"]
    },
    {
      name: lang === "ja" ? "\u5730\u7406\u7A7A\u9593\u30FB\u30C7\u30FC\u30BF" : "Geospatial & Spatial Data",
      skills: ["CityGML", "IFC", "GeoPackage", "IMDF", "Shapefiles"]
    },
    {
      name: lang === "ja" ? "\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0" : "Programming",
      skills: ["Python", "TypeScript", "C#"]
    },
    {
      name: lang === "ja" ? "\u30AA\u30FC\u30D7\u30F3\u30BD\u30FC\u30B9\u30FBCG" : "Open Source & Viz",
      skills: ["Blender", "Bonsai", "Unity", "FBX"]
    },
    {
      name: lang === "ja" ? "\u8A00\u8A9E" : "Languages",
      skills: lang === "ja" ? ["\u82F1\u8A9E (\u6BCD\u8A9E)", "\u30B9\u30A6\u30A7\u30FC\u30C7\u30F3\u8A9E (\u6BCD\u8A9E)", "\u65E5\u672C\u8A9E (JLPT N3 / N2\u52C9\u5F37\u4E2D)"] : ["English (Native)", "Swedish (Native)", "Japanese (JLPT N3, studying for N2)"]
    }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${skillCategories.map((category) => renderTemplate`<div class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[8px] dark:rounded-[12px] p-5 hover:border-[var(--color-border-hover)] transition-colors duration-200"> <h4 class="text-xs font-bold text-[var(--color-text-heading)] mb-4 uppercase tracking-wider">${category.name}</h4> <div class="flex flex-wrap gap-2"> ${category.skills.map((skill) => renderTemplate`${renderComponent($$result, "Tag", $$Tag, {}, { "default": ($$result2) => renderTemplate`${skill}` })}`)} </div> </div>`)} </div>`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/SkillsGrid.astro", void 0);

export { $$SkillsGrid as $ };
