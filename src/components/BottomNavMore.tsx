import { useEffect, useState } from "react";
import { Ellipsis, Github, Linkedin } from "lucide-react";
import type { Language } from "../i18n/utils";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

type Props = {
  readonly currentLang: Language;
};

const labels = {
  en: { more: "More", title: "Preferences", description: "Language, theme, and profiles" },
  ja: { more: "その他", title: "設定", description: "言語・テーマ・プロフィール" },
  sv: { more: "Mer", title: "Inställningar", description: "Språk, tema och profiler" },
} as const;

export default function BottomNavMore({ currentLang }: Props) {
  const [open, setOpen] = useState(false);
  const copy = labels[currentLang];

  useEffect(() => {
    const closeOnPageLoad = () => setOpen(false);
    document.addEventListener("astro:page-load", closeOnPageLoad);
    return () => document.removeEventListener("astro:page-load", closeOnPageLoad);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={copy.more}
        className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-1 text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
      >
        <Ellipsis className="h-5 w-5" aria-hidden="true" />
        <span className="text-[length:var(--font-tab)] font-bold leading-none">{copy.more}</span>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="border-[var(--line)] bg-[var(--bg)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[var(--text)]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--text)]">
            {copy.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-[var(--text-muted)]">
            {copy.description}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 pb-2">
          <LanguageToggle currentLang={currentLang} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              className="inline-grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="https://github.com/dmalmq"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              className="inline-grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="https://www.linkedin.com/in/daniel-malmqvist-profile/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
