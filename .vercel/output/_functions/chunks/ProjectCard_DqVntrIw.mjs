import { d as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, a as renderTemplate } from './astro/server_AumSkbV1.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro("https://malmqvist.dev");
const $$ProjectCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ProjectCard;
  const { project, lang } = Astro2.props;
  const slugParts = project.id.split("/");
  const slugRoute = slugParts[slugParts.length - 1].replace(/\.mdx?$/, "");
  const url = `/${lang}/projects/${slugRoute}`;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(url, "href")} class="group block border border-[var(--color-border)] rounded-[8px] dark:rounded-[12px] overflow-hidden bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_15px_var(--color-accent-glow)]"> ${project.data.coverImage ? renderTemplate`<div class="w-full aspect-video overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]"> <img${addAttribute(project.data.coverImage, "src")}${addAttribute(project.data.title, "alt")} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"> </div>` : renderTemplate`<div class="w-full aspect-video bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] flex items-center justify-center"> <span class="text-[var(--color-text-secondary)] opacity-50 font-mono text-sm group-hover:text-[var(--color-accent)] transition-colors">
// missing visual
</span> </div>`} <div class="p-6"> <div class="flex flex-wrap gap-2 mb-4"> ${project.data.tags.slice(0, 3).map((tag) => renderTemplate`<span class="inline-block text-xs font-semibold px-2 py-1 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)]"> ${tag} </span>`)} </div> <h3 class="text-xl font-bold text-[var(--color-text-heading)] mb-2 group-hover:text-[var(--color-accent)] transition-colors"> ${project.data.title} </h3> <p class="text-[var(--color-text-secondary)] text-sm line-clamp-3"> ${project.data.description} </p> </div> </a>`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/ProjectCard.astro", void 0);

export { $$ProjectCard as $ };
