import en from './en.json';
import ja from './ja.json';

export const languages = {
    en: 'English',
    ja: '日本語',
};

export const defaultLang = 'en';

export const ui = {
    en,
    ja,
} as const;

export type Language = keyof typeof ui;

export function getLangFromUrl(url: URL): Language {
    const [, lang] = url.pathname.split('/');
    if (lang in ui) return lang as Language;
    return defaultLang;
}

export function useTranslations(lang: Language) {
    return function t(key: keyof typeof ui[typeof defaultLang]) {
        return ui[lang][key] || ui[defaultLang][key];
    };
}
