import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_AumSkbV1.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CjHSrjbq.mjs';
import { $ as $$FadeIn } from '../../chunks/FadeIn_DHVrZLlp.mjs';
import { C as ContactForm } from '../../chunks/ContactForm_DAYGS9HZ.mjs';
export { renderers } from '../../renderers.mjs';

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contact | Daniel Malmqvist", "lang": "en" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24"> <div class="flex flex-col justify-center"> ${renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 0 }, { "default": ($$result3) => renderTemplate` <h1 class="text-4xl md:text-5xl font-black text-[var(--color-text-heading)] mb-6">
Get in touch.
</h1> <p class="text-xl text-[var(--color-text-secondary)] font-medium mb-10 leading-relaxed max-w-lg">
Whether you have a question about BIM workflows, need
                        help bridging the gap to a digital twin, or just want to
                        connect over a recent post—I'd love to hear from you. I
                        usually reply within a few days.
</p> ` })} ${renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 100 }, { "default": ($$result3) => renderTemplate` <div class="space-y-6"> <div class="flex items-center gap-4 text-[var(--color-text-secondary)]"> <div class="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg> </div> <div> <h3 class="font-bold text-[var(--color-text-heading)] mb-0.5">
Location
</h3> <p>Tokyo, Japan / Stockholm, Sweden</p> </div> </div> <div class="flex items-center gap-4 text-[var(--color-text-secondary)]"> <div class="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg> </div> <div> <h3 class="font-bold text-[var(--color-text-heading)] mb-0.5">
Email
</h3> <a href="mailto:daniel@malmqvist.dev" class="hover:text-[var(--color-accent)] transition-colors">daniel@malmqvist.dev</a> </div> </div> </div> ` })} </div> <div> ${renderComponent($$result2, "FadeIn", $$FadeIn, { "delay": 200 }, { "default": ($$result3) => renderTemplate` <div class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[12px] p-6 sm:p-10 shadow-sm"> ${renderComponent($$result3, "ContactForm", ContactForm, { "lang": "en", "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Repositories/malmqvist.dev/astro/src/components/ContactForm", "client:component-export": "default" })} </div> ` })} </div> </div> </section> ` })}`;
}, "C:/Repositories/malmqvist.dev/astro/src/pages/en/contact.astro", void 0);

const $$file = "C:/Repositories/malmqvist.dev/astro/src/pages/en/contact.astro";
const $$url = "/en/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Contact,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
