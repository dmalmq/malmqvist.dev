import { d as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, i as renderSlot, b as renderScript, a as renderTemplate } from './astro/server_AumSkbV1.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro("https://malmqvist.dev");
const $$FadeIn = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$FadeIn;
  const { class: className = "", delay = 0 } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`opacity-0 translate-y-8 transition-all duration-700 ease-out fade-in-element ${className}`, "class")}${addAttribute(`transition-delay: ${delay}ms;`, "style")}> ${renderSlot($$result, $$slots["default"])} </div> ${renderScript($$result, "C:/Repositories/malmqvist.dev/astro/src/components/ui/FadeIn.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/ui/FadeIn.astro", void 0);

export { $$FadeIn as $ };
