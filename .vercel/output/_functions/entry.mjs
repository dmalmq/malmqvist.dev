import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_4zdOeow2.mjs';
import { manifest } from './manifest_BaoWZI_O.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/en/about.astro.mjs');
const _page3 = () => import('./pages/en/blog/_slug_.astro.mjs');
const _page4 = () => import('./pages/en/blog.astro.mjs');
const _page5 = () => import('./pages/en/contact.astro.mjs');
const _page6 = () => import('./pages/en/projects/_slug_.astro.mjs');
const _page7 = () => import('./pages/en/projects.astro.mjs');
const _page8 = () => import('./pages/en/rss.xml.astro.mjs');
const _page9 = () => import('./pages/en.astro.mjs');
const _page10 = () => import('./pages/ja/about.astro.mjs');
const _page11 = () => import('./pages/ja/blog/_slug_.astro.mjs');
const _page12 = () => import('./pages/ja/blog.astro.mjs');
const _page13 = () => import('./pages/ja/contact.astro.mjs');
const _page14 = () => import('./pages/ja/projects/_slug_.astro.mjs');
const _page15 = () => import('./pages/ja/projects.astro.mjs');
const _page16 = () => import('./pages/ja/rss.xml.astro.mjs');
const _page17 = () => import('./pages/ja.astro.mjs');
const _page18 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/en/about.astro", _page2],
    ["src/pages/en/blog/[slug].astro", _page3],
    ["src/pages/en/blog/index.astro", _page4],
    ["src/pages/en/contact.astro", _page5],
    ["src/pages/en/projects/[slug].astro", _page6],
    ["src/pages/en/projects/index.astro", _page7],
    ["src/pages/en/rss.xml.ts", _page8],
    ["src/pages/en/index.astro", _page9],
    ["src/pages/ja/about.astro", _page10],
    ["src/pages/ja/blog/[slug].astro", _page11],
    ["src/pages/ja/blog/index.astro", _page12],
    ["src/pages/ja/contact.astro", _page13],
    ["src/pages/ja/projects/[slug].astro", _page14],
    ["src/pages/ja/projects/index.astro", _page15],
    ["src/pages/ja/rss.xml.ts", _page16],
    ["src/pages/ja/index.astro", _page17],
    ["src/pages/index.astro", _page18]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "e97ec68d-1589-4fd2-abe8-458a57504a13",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
