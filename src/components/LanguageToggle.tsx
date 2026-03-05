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
        window.location.href = `/${nextLang}/`;
    };

    if (!mounted) {
        return (
            <button className="px-3 py-1 font-medium text-sm text-[var(--color-text-secondary)]" disabled>
                {currentLang.toUpperCase()}
            </button>
        );
    }

    const toggleText = currentLang === 'en' ? '日本語' : 'EN';

    return (
        <button
            onClick={switchLanguage}
            className="px-3 py-1 rounded-[4px] dark:rounded-full font-medium text-sm transition-colors duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] focus:outline-none"
            aria-label="Switch language"
        >
            {toggleText}
        </button>
    );
}
