import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as renderScript } from '../chunks/astro/server_AumSkbV1.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CjHSrjbq.mjs';
import { $ as $$Button } from '../chunks/Button_BJBWEl-w.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "404: Not Found | Daniel Malmqvist", "lang": "en" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center py-24 md:py-32 text-center px-4"> <h1 class="text-8xl md:text-9xl font-black text-[var(--color-text-heading)] mb-6 opacity-20">
404
</h1> <div class="max-w-md space-y-4 mb-10"> <h2 class="text-2xl font-bold text-[var(--color-text-heading)]">
Page not found
</h2> <p class="text-[var(--color-text-secondary)]">
The page you're looking for doesn't exist or has been moved.
</p> </div> <div class="max-w-md space-y-4 mb-10 hidden" id="ja-content"> <h2 class="text-2xl font-bold text-[var(--color-text-heading)]">
ページが見つかりません
</h2> <p class="text-[var(--color-text-secondary)]">
お探しのページは存在しないか、移動した可能性があります。
</p> </div> <div class="flex flex-col sm:flex-row gap-4"> ${renderComponent($$result2, "Button", $$Button, { "href": "/en/", "variant": "primary", "id": "btn-home" }, { "default": ($$result3) => renderTemplate`Return Home` })} </div> </div> ${renderScript($$result2, "C:/Repositories/malmqvist.dev/astro/src/pages/404.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Repositories/malmqvist.dev/astro/src/pages/404.astro", void 0);

const $$file = "C:/Repositories/malmqvist.dev/astro/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$404,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
