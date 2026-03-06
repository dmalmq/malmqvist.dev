import { d as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, s as spreadAttributes, i as renderSlot, a as renderTemplate } from './astro/server_AumSkbV1.mjs';
import 'clsx';

const $$Astro = createAstro("https://malmqvist.dev");
const $$Card = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Card;
  const { class: className = "", ...rest } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`bg-[var(--color-bg-elevated)] dark:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[8px] dark:rounded-[12px] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-sm hover:border-[var(--color-border-hover)] dark:hover:shadow-[0_0_15px_var(--color-accent-glow)] ${className}`, "class")}${spreadAttributes(rest)}> ${renderSlot($$result, $$slots["default"])} </div>`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/ui/Card.astro", void 0);

export { $$Card as $ };
