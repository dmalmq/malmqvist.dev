import { d as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, r as renderComponent, b as renderScript, a as renderTemplate, i as renderSlot, j as renderHead } from './astro/server_AumSkbV1.mjs';
import 'piccolore';
/* empty css                         */
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import 'clsx';

function LanguageToggle({ currentLang }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const switchLanguage = () => {
    const nextLang = currentLang === "en" ? "ja" : "en";
    localStorage.setItem("preferred-language", nextLang);
    window.location.href = `/${nextLang}/`;
  };
  if (!mounted) {
    return /* @__PURE__ */ jsx("button", { className: "px-3 py-1 font-medium text-sm text-[var(--color-text-secondary)]", disabled: true, children: currentLang.toUpperCase() });
  }
  const toggleText = currentLang === "en" ? "日本語" : "EN";
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: switchLanguage,
      className: "px-3 py-1 rounded-[4px] dark:rounded-full font-medium text-sm transition-colors duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] focus:outline-none",
      "aria-label": "Switch language",
      children: toggleText
    }
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme === "dark" || !storedTheme && systemDark ? "dark" : "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: toggleTheme,
      className: "p-2 rounded-full hover:bg-[var(--color-bg-surface)] transition-colors duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus:outline-none",
      "aria-label": "Toggle theme",
      children: theme === "light" ? /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }) }) : /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
        /* @__PURE__ */ jsx("path", { d: "M12 2v2" }),
        /* @__PURE__ */ jsx("path", { d: "M12 20v2" }),
        /* @__PURE__ */ jsx("path", { d: "m4.93 4.93 1.41 1.41" }),
        /* @__PURE__ */ jsx("path", { d: "m17.66 17.66 1.41 1.41" }),
        /* @__PURE__ */ jsx("path", { d: "M2 12h2" }),
        /* @__PURE__ */ jsx("path", { d: "M20 12h2" }),
        /* @__PURE__ */ jsx("path", { d: "m6.34 17.66-1.41 1.41" }),
        /* @__PURE__ */ jsx("path", { d: "m19.07 4.93-1.41 1.41" })
      ] })
    }
  );
}

const en = {
  "nav.home": "Home",
  "nav.projects": "Projects",
  "nav.blog": "Blog",
  "nav.about": "About",
  "nav.contact": "Contact",
  "hero.tagline": "Architect. BIM Manager. Agentic Programmer.",
  "hero.tagline.desc": "From Stockholm's hospitals and airports to Tokyo's digital twin.",
  "hero.cta.primary": "Get in touch",
  "hero.cta.secondary": "View Projects",
  "home.whatido.title": "What I Do",
  "home.whatido.card1.title": "Architecture & BIM Management",
  "home.whatido.card1.desc": "Rebuilt complex models from scratch, engineered detailed facades, and led interdisciplinary coordination for award-winning hospitals and airport expansions in Sweden.",
  "home.whatido.card2.title": "Agentic Programming",
  "home.whatido.card2.desc": "Leveraging modern AI agent workflows to automate data pipelines, bypass legacy conversion steps, and convert and connect complex spatial data formats.",
  "home.whatido.card3.title": "Tech Integration",
  "home.whatido.card3.desc": "Modeling highly detailed indoor navigable layers, translating native BIM geometries into formats ready for interactive platforms, and blending them with city-scale digital twins.",
  "home.featured.title": "Featured Project",
  "home.featured.project.title": "Shinjuku Indoor Navigation",
  "home.featured.project.desc": "Tokyo's complex underground station networks are nearly impossible to navigate with traditional 2D maps. I created detailed Revit models of station interiors and converted them for Unity, integrating rich indoor geometry with PLATEAU's CityGML digital twin for seamless indoor-outdoor continuity.",
  "home.featured.readmore": "Read full case study →",
  "home.skills.title": "Tools & Skills",
  "home.cta.title": "Let's build something together.",
  "home.cta.button": "Get in touch",
  "about.title": "About Daniel",
  "about.resume": "Download Resume (PDF)",
};

const ja = {
  "nav.home": "ホーム",
  "nav.projects": "プロジェクト",
  "nav.blog": "ブログ",
  "nav.about": "自己紹介",
  "nav.contact": "お問い合わせ",
  "hero.tagline": "建築家・BIMマネージャー・Agentic Programmer",
  "hero.tagline.desc": "ストックホルムの病院や空港から、東京のデジタルツインまで。",
  "hero.cta.primary": "お問い合わせ",
  "hero.cta.secondary": "プロジェクトを見る",
  "home.whatido.title": "事業内容",
  "home.whatido.card1.title": "建築・BIMマネジメント",
  "home.whatido.card1.desc": "スウェーデンの受賞歴のある大規模病院や空港拡張プロジェクトにおいて、複雑なBIMモデルの構築、ファサードのエンジニアリング、そして各専門分野をまたぐ調整を長年担当。",
  "home.whatido.card2.title": "Agentic Programming",
  "home.whatido.card2.desc": "最新のAIエージェント・ワークフローを活用し、データパイプラインを自動化。レガシーなプロセスを省略し、複雑な空間データを変換・接続するためのツールを開発。",
  "home.whatido.card3.title": "技術統合・デジタルツイン",
  "home.whatido.card3.desc": "詳細な屋内ナビゲーション層のモデリング、BIMジオメトリのインタラクティブプラットフォーム向けフォーマットへの変換、および都市規模のデジタルツインとの融合。",
  "home.featured.title": "注目のプロジェクト",
  "home.featured.project.title": "新宿駅 屋内ナビゲーション",
  "home.featured.project.desc": "従来の2Dマップではナビゲーションが困難な東京の複雑な地下駅ネットワーク。私が駅構内の詳細なRevitモデルを作成し、Unity向けに変換。リッチな屋内ジオメトリをPLATEAUのCityGMLデジタルツインと統合し、シームレスな屋内外の連続性を実現しました。",
  "home.featured.readmore": "ケーススタディを読む →",
  "home.skills.title": "スキル・使用ツール",
  "home.cta.title": "一緒にプロジェクトを進めませんか？",
  "home.cta.button": "お問い合わせ",
  "about.title": "自己紹介",
  "about.resume": "履歴書をダウンロード (PDF)",
};

const defaultLang = "en";
const ui = {
  en,
  ja
};
function useTranslations(lang) {
  return function t(key) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

const $$Astro$2 = createAstro("https://malmqvist.dev");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Header;
  const { currentLang } = Astro2.props;
  const t = useTranslations(currentLang);
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 w-full border-b border-transparent dark:border-b-transparent light:border-[var(--color-border)] dark:bg-[var(--color-bg-primary)]/80 backdrop-blur-md transition-colors duration-200"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex items-center justify-between h-16">  <div class="flex-shrink-0"> <a${addAttribute(`/${currentLang}/`, "href")} class="text-xl font-bold tracking-tight text-[var(--color-text-heading)] hover:text-[var(--color-accent)] transition-colors">
DM.
</a> </div>  <nav class="hidden md:flex space-x-8"> <a${addAttribute(`/${currentLang}/projects`, "href")} class="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-colors"> ${t("nav.projects")} </a> <a${addAttribute(`/${currentLang}/blog`, "href")} class="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-colors"> ${t("nav.blog")} </a> <a${addAttribute(`/${currentLang}/about`, "href")} class="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-colors"> ${t("nav.about")} </a> <a${addAttribute(`/${currentLang}/contact`, "href")} class="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-colors"> ${t("nav.contact")} </a> </nav>  <div class="hidden md:flex items-center space-x-4"> ${renderComponent($$result, "LanguageToggle", LanguageToggle, { "currentLang": currentLang, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Repositories/malmqvist.dev/astro/src/components/LanguageToggle", "client:component-export": "default" })} ${renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Repositories/malmqvist.dev/astro/src/components/ThemeToggle", "client:component-export": "default" })} </div>  <div class="flex md:hidden items-center space-x-2"> ${renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Repositories/malmqvist.dev/astro/src/components/ThemeToggle", "client:component-export": "default" })} ${renderComponent($$result, "LanguageToggle", LanguageToggle, { "currentLang": currentLang, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Repositories/malmqvist.dev/astro/src/components/LanguageToggle", "client:component-export": "default" })} <button id="mobile-menu-btn" type="button" class="p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] focus:outline-none" aria-controls="mobile-menu" aria-expanded="false"> <span class="sr-only">Open main menu</span>  <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> </div> </div> </div>  <div id="mobile-menu" class="hidden md:hidden bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] shadow-lg absolute w-full transition-all"> <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3"> <a${addAttribute(`/${currentLang}/projects`, "href")} class="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-surface)]"> ${t("nav.projects")} </a> <a${addAttribute(`/${currentLang}/blog`, "href")} class="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-surface)]"> ${t("nav.blog")} </a> <a${addAttribute(`/${currentLang}/about`, "href")} class="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-surface)]"> ${t("nav.about")} </a> <a${addAttribute(`/${currentLang}/contact`, "href")} class="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-surface)]"> ${t("nav.contact")} </a> </div> </div> </header> ${renderScript($$result, "C:/Repositories/malmqvist.dev/astro/src/components/Header.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/Header.astro", void 0);

const $$Astro$1 = createAstro("https://malmqvist.dev");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Footer;
  const { currentLang } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<footer class="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] py-12 mt-20 transition-colors duration-200"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="md:flex md:items-center md:justify-between"> <div class="flex justify-center md:justify-start space-x-6 md:order-2"> <a href="https://github.com/dmalmq" target="_blank" rel="noopener noreferrer" class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"> <span class="sr-only">GitHub</span> <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path> </svg> </a> <a href="https://www.linkedin.com/in/daniel-malmqvist-profile/" target="_blank" rel="noopener noreferrer" class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"> <span class="sr-only">LinkedIn</span> <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd"></path> </svg> </a> </div> <div class="mt-8 md:mt-0 md:order-1"> <p class="text-center text-base text-[var(--color-text-secondary)]">
&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Daniel Malmqvist. All rights reserved.
</p> </div> </div> </div> </footer>`;
}, "C:/Repositories/malmqvist.dev/astro/src/components/Footer.astro", void 0);

function ImageLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    const handleOpen = (e) => {
      setImgSrc(e.detail?.src || "");
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("open-lightbox", handleOpen);
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("open-lightbox", handleOpen);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  const close = () => {
    setIsOpen(false);
    setTimeout(() => setImgSrc(""), 300);
    document.body.style.overflow = "";
  };
  if (!isOpen && !imgSrc) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg-primary)]/95 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`,
      onClick: close,
      "aria-modal": "true",
      role: "dialog",
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: close,
            className: "absolute top-6 right-6 p-2 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]",
            "aria-label": "Close fullscreen image",
            children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-full max-w-6xl max-h-[90vh] p-4 flex items-center justify-center transform transition-transform duration-300 scale-95 origin-center", style: { transform: isOpen ? "scale(1)" : "scale(0.95)" }, onClick: (e) => e.stopPropagation(), children: imgSrc && /* @__PURE__ */ jsx(
          "img",
          {
            src: imgSrc,
            alt: "Fullscreen view",
            className: "max-w-full max-h-[85vh] object-contain rounded-[4px] shadow-2xl border border-[var(--color-border)]"
          }
        ) })
      ]
    }
  );
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://malmqvist.dev");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "Daniel Malmqvist \u2014 BIM Manager & Agentic Programmer in Tokyo. From award-winning hospitals and airports in Sweden to digital twin navigation systems in Japan.",
    lang,
    image = "/images/projects/shinjuku-nav-1.png"
  } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  const isJa = currentPath.startsWith("/ja");
  const altLang = isJa ? "en" : "ja";
  const altPath = isJa ? currentPath.replace(/^\/ja/, "/en") : currentPath.replace(/^\/en/, "/ja");
  const canonicalUrl = new URL(
    currentPath,
    Astro2.site ?? "https://malmqvist.dev"
  );
  const altUrl = new URL(altPath, Astro2.site ?? "https://malmqvist.dev");
  const defaultUrl = new URL(
    currentPath.replace(/^\/(ja|en)/, "/en"),
    Astro2.site ?? "https://malmqvist.dev"
  );
  const fullImageUrl = new URL(image, Astro2.site ?? "https://malmqvist.dev");
  return renderTemplate(_a || (_a = __template(["<html", ' class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', "><title>", '</title><meta name="description"', '><meta name="theme-color" content="#0a0a0f" media="(prefers-color-scheme: dark)"><meta name="theme-color" content="#fafaf9" media="(prefers-color-scheme: light)"><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', '><meta property="twitter:image"', '><!-- hreflang --><link rel="alternate"', "", '><link rel="alternate"', "", '><link rel="alternate" hreflang="x-default"', '><script>\n      // Prevent theme flicker\n      const theme = (() => {\n        if (\n          typeof localStorage !== "undefined" &&\n          localStorage.getItem("theme")\n        ) {\n          return localStorage.getItem("theme");\n        }\n        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {\n          return "dark";\n        }\n        return "light";\n      })();\n\n      if (theme === "dark") {\n        document.documentElement.classList.add("dark");\n      } else {\n        document.documentElement.classList.remove("dark");\n      }\n    <\/script>', '</head> <body class="antialiased min-h-screen flex flex-col transition-colors duration-200"> ', ' <main class="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16"> ', " </main> ", " ", " </body></html>"])), addAttribute(lang, "lang"), addAttribute(Astro2.generator, "content"), title, addAttribute(description, "content"), addAttribute(canonicalUrl, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(fullImageUrl, "content"), addAttribute(canonicalUrl, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(fullImageUrl, "content"), addAttribute(lang, "hreflang"), addAttribute(canonicalUrl, "href"), addAttribute(altLang, "hreflang"), addAttribute(altUrl, "href"), addAttribute(defaultUrl, "href"), renderHead(), renderComponent($$result, "Header", $$Header, { "currentLang": lang }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, { "currentLang": lang }), renderComponent($$result, "ImageLightbox", ImageLightbox, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "C:/Repositories/malmqvist.dev/astro/src/components/ImageLightbox", "client:component-export": "default" }));
}, "C:/Repositories/malmqvist.dev/astro/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $, useTranslations as u };
