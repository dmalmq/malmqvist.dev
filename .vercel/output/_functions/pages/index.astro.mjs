import { c as createComponent, a as renderTemplate, j as renderHead } from '../chunks/astro/server_AumSkbV1.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Daniel Malmqvist | Portfolio</title><script>
      const storedLang = localStorage.getItem('preferred-language');
      
      if (storedLang) {
        window.location.replace(\`/\${storedLang}/\`);
      } else {
        const browserLang = navigator.language;
        if (browserLang && browserLang.startsWith('ja')) {
          window.location.replace('/ja/');
        } else {
          window.location.replace('/en/');
        }
      }
    <\/script>`, '</head> <body>  <div style="padding: 2rem;"> <p>Please select your language:</p> <a href="/en/">English</a> | <a href="/ja/">\u65E5\u672C\u8A9E</a> </div> </body></html>'], [`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Daniel Malmqvist | Portfolio</title><script>
      const storedLang = localStorage.getItem('preferred-language');
      
      if (storedLang) {
        window.location.replace(\\\`/\\\${storedLang}/\\\`);
      } else {
        const browserLang = navigator.language;
        if (browserLang && browserLang.startsWith('ja')) {
          window.location.replace('/ja/');
        } else {
          window.location.replace('/en/');
        }
      }
    <\/script>`, '</head> <body>  <div style="padding: 2rem;"> <p>Please select your language:</p> <a href="/en/">English</a> | <a href="/ja/">\u65E5\u672C\u8A9E</a> </div> </body></html>'])), renderHead());
}, "C:/Repositories/malmqvist.dev/astro/src/pages/index.astro", void 0);

const $$file = "C:/Repositories/malmqvist.dev/astro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
