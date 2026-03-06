import { d as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, i as renderSlot } from './astro/server_AumSkbV1.mjs';
import 'piccolore';

const $$Astro = createAstro("https://malmqvist.dev");
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Button;
  const { variant = "primary", href, class: className = "", type, ...rest } = Astro2.props;
  const isLink = typeof href === "string";
  const Element = isLink ? "a" : "button";
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-[6px] dark:rounded-full px-5 py-2";
  const variants = {
    primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:shadow-md dark:hover:shadow-[0_0_15px_var(--color-accent-glow)]",
    secondary: "border border-[var(--color-accent)] text-[var(--color-text-primary)] dark:text-[var(--color-accent)] hover:border-[var(--color-accent-hover)] dark:hover:shadow-[0_0_15px_var(--color-accent-glow)] bg-transparent"
  };
  const classes = `${baseStyles} ${variants[variant]} ${className}`;
  return renderTemplate`${renderComponent($$result, "Element", Element, { "href": href, "class": classes, "type": !isLink ? type || "button" : void 0, ...rest }, { "default": ($$result2) => renderTemplate` ${renderSlot($$result2, $$slots["default"])} ` })}`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/ui/Button.astro", void 0);

export { $$Button as $ };
