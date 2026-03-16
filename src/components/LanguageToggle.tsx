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

    const toggleText = currentLang === 'en' ? '日本語' : 'EN';
    const srText = currentLang === 'en' ? ' switch to Japanese' : ' switch to English';

    return (
        <button
            onClick={switchLanguage}
            className="ui-pill-button min-w-[4.75rem] px-3"
            title={currentLang === 'en' ? 'Switch to Japanese' : 'Switch to English'}
        >
            <span>{toggleText}</span>
            <span className="sr-only">{srText}</span>
        </button>
    );
}
