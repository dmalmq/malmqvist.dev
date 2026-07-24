import type { Language } from '../i18n/utils';

interface Props {
    currentLang: Language;
}

export default function LanguageToggle({ currentLang }: Props) {
    const switchLanguage = () => {
        const nextLang = currentLang === 'en' ? 'ja' : 'en';
        localStorage.setItem('preferred-language', nextLang);
        const nextPath = window.location.pathname.match(/^\/(en|ja)(\/.*)?$/)
            ? window.location.pathname.replace(/^\/(en|ja)/, `/${nextLang}`)
            : `/${nextLang}/`;
        window.location.href = `${nextPath}${window.location.search}${window.location.hash}`;
    };

    const srText = currentLang === 'en' ? 'Switch to Japanese' : 'Switch to English';

    return (
        <button
            onClick={switchLanguage}
            className="flex h-6 w-6 items-center justify-center text-[var(--color-text-heading)] transition-colors duration-200 hover:text-[var(--color-accent)]"
            title={srText}
            aria-label={srText}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
            </svg>
        </button>
    );
}
