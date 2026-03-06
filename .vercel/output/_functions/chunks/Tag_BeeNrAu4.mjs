import { d as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, i as renderSlot, a as renderTemplate } from './astro/server_AumSkbV1.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro("https://malmqvist.dev");
const $$Tag = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Tag;
  const { class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<span${addAttribute(`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-border)] dark:border-transparent dark:shadow-[0_0_8px_var(--color-accent-glow)] ${className}`, "class")}> ${renderSlot($$result, $$slots["default"])} </span>`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/ui/Tag.astro", void 0);

export { $$Tag as $ };
