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
            <button className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)]" disabled>
                {currentLang.toUpperCase()}
            </button>
        );
    }

    const toggleText = currentLang === 'en' ? '日本語' : 'EN';

    return (
        <button
            onClick={switchLanguage}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)] focus:outline-none"
            aria-label="Switch language"
        >
            {toggleText}
        </button>
    );
}
