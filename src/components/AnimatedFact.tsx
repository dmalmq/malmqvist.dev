import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface AnimatedFactProps {
  label: string;
  value: string;
  icon?: "map" | "target" | "languages";
}

export default function AnimatedFact({ label, value, icon }: AnimatedFactProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!isInView) return;

    // Typewriter effect
    let i = 0;
    const chars = value.split("");
    const controls = animate(0, chars.length, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate(latest) {
        const idx = Math.round(latest);
        if (idx !== i) {
          i = idx;
          setDisplayed(chars.slice(0, idx).join(""));
        }
      },
    });

    return () => controls.stop();
  }, [isInView, value]);

  const iconSvg = {
    map: (
      <svg className="h-4 w-4 text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
    target: (
      <svg className="h-4 w-4 text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    ),
    languages: (
      <svg className="h-4 w-4 text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
    ),
  };

  return (
    <div
      ref={ref}
      className="group rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/90 px-5 py-5 backdrop-blur-sm transition-colors duration-300 hover:border-[var(--color-accent)]"
    >
      <div className="flex items-center gap-2">
        {icon && iconSvg[icon]}
        <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-secondary)]">
          {label}
        </dt>
      </div>
      <dd className="mt-2 text-sm font-medium leading-6 text-[var(--color-text-heading)] md:text-base">
        {displayed || (isInView ? value : "\u00A0")}
      </dd>
    </div>
  );
}
