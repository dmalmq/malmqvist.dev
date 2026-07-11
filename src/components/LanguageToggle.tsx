import type { Language } from "../i18n/utils";

type Props = {
  readonly currentLang: Language;
};

type ViewTransitionDocument = Document & {
  readonly startViewTransition?: (callback: () => void) => void;
};

const languages = ["en", "ja", "sv"] as const;

function buildLocalizedPath(nextLang: Language): string {
  const currentPath = window.location.pathname.replace(/^\/(en|ja|sv)\/?/, "");
  const suffix = currentPath.length > 0 ? currentPath : "";
  return `/${nextLang}/${suffix}${window.location.search}${window.location.hash}`;
}

export default function LanguageToggle({ currentLang }: Props) {
  const setLanguage = (nextLang: Language) => {
    if (nextLang === currentLang) return;

    localStorage.setItem("preferred-language", nextLang);
    const nextPath = buildLocalizedPath(nextLang);
    const transitionDocument: ViewTransitionDocument = document;
    const navigate = () => window.location.assign(nextPath);

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(navigate);
      return;
    }

    navigate();
  };

  return (
    <div className="inline-flex rounded-full border border-[var(--line)] p-0.5 text-[length:var(--font-meta)] font-bold" aria-label="Language">
      {languages.map((lang) => {
        const active = lang === currentLang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            className={`rounded-full px-3 py-1.5 uppercase tracking-[0.12em] transition-colors ${
              active
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "text-[var(--text-muted)] hover:text-[var(--accent)]"
            }`}
            aria-pressed={active}
          >
            {{ en: "EN", ja: "JP", sv: "SV" }[lang]}
          </button>
        );
      })}
    </div>
  );
}
