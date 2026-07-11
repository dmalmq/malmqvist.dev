import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const themeChangeEvent = "portfolio:theme-change";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(themeChangeEvent, onStoreChange);
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", onStoreChange);
  };
}

function readDarkClass(): boolean | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.classList.contains('dark');
}

function readServerTheme(): boolean | null {
  return null;
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, readDarkClass, readServerTheme);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    window.dispatchEvent(new Event(themeChangeEvent));
  };

  const ready = isDark !== null;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Sun
        className={`absolute h-4.5 w-4.5 transition-opacity duration-200 ${ready && !isDark ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-4.5 w-4.5 transition-opacity duration-200 ${ready && isDark ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
