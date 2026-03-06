import { d as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, a as renderTemplate, r as renderComponent, F as Fragment } from './astro/server_AumSkbV1.mjs';
import 'piccolore';

const $$Astro = createAstro("https://malmqvist.dev");
const $$BlogPostCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlogPostCard;
  const { post, lang } = Astro2.props;
  const slugParts = post.id.split("/");
  const slugRoute = slugParts[slugParts.length - 1].replace(/\.mdx?$/, "");
  const url = `/${lang}/blog/${slugRoute}`;
  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  const formattedDate = new Intl.DateTimeFormat(
    lang === "en" ? "en-US" : "ja-JP",
    dateOptions
  ).format(post.data.publishDate);
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(url, "href")} class="group block py-8 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] transition-colors duration-300 -mx-4 px-4 rounded-[8px]"> <div class="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-3"> <time${addAttribute(post.data.publishDate.toISOString(), "datetime")} class="text-[var(--color-text-secondary)] font-mono text-sm shrink-0"> ${formattedDate} </time> <div class="flex gap-2 flex-wrap text-xs font-semibold"> ${post.data.tags.slice(0, 2).map((tag) => renderTemplate`<span class="text-[var(--color-accent)] uppercase tracking-wider">
#${tag} </span>`)} ${post.data.readingTime && renderTemplate`<span class="text-[var(--color-text-secondary)] ml-auto md:ml-2 opacity-70 flex items-center gap-1"> <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"> ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline> ` })} </svg> ${post.data.readingTime} </span>`} </div> </div> <h3 class="text-2xl font-bold text-[var(--color-text-heading)] mb-3 group-hover:text-[var(--color-accent)] transition-colors"${addAttribute(lang === "ja" ? "font-family: 'Noto Sans JP', sans-serif;" : "", "style")}> ${post.data.title} </h3> <p class="text-[var(--color-text-secondary)] leading-relaxed line-clamp-2 max-w-3xl"${addAttribute(lang === "ja" ? "font-family: 'Noto Sans JP', sans-serif;" : "", "style")}> ${post.data.description} </p> </a>`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/BlogPostCard.astro", void 0);

export { $$BlogPostCard as $ };
