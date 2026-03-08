import { useEffect, useState } from 'react';
import type { Language } from '../i18n/utils';

interface Props {
    currentLang: Language;
}

export default function LanguageToggle({ currentLang }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const switchLanguage = () => {
        const nextLang = currentLang === 'en' ? 'ja' : 'en';
        localStorage.setItem('preferred-language', nextLang);
        const nextPath = window.location.pathname.match(/^\/(en|ja)(\/.*)?$/)
            ? window.location.pathname.replace(/^\/(en|ja)/, `/${nextLang}`)
            : `/${nextLang}/`;
        window.location.href = nextPath;
    };

    if (!mounted) {
        return (
            <button className="ui-pill-button px-3" disabled>
                {currentLang.toUpperCase()}
            </button>
        );
    }

    const toggleText = currentLang === 'en' ? '日本語' : 'EN';

    return (
        <button
            onClick={switchLanguage}
            className="ui-pill-button px-3"
            aria-label="Switch language"
            title={currentLang === 'en' ? 'Switch to Japanese' : 'Switch to English'}
        >
            {toggleText}
        </button>
    );
}
