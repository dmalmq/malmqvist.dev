import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SkillCardProps {
  name: string;
  categoryLabel: string;
  skills: { name: string; desc?: string }[];
  borderColor: string;
  icon: string;
}

const iconPaths: Record<string, JSX.Element> = {
  building: (
    <>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
      <path d="M12 10h.01" /><path d="M12 14h.01" />
      <path d="M16 10h.01" /><path d="M16 14h.01" />
      <path d="M8 10h.01" /><path d="M8 14h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  message: (
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  ),
};

export default function SkillCard({
  name,
  categoryLabel,
  skills,
  borderColor,
  icon,
}: SkillCardProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="relative h-full rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_28px_70px_-48px_rgba(87,82,121,0.42)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-border-hover)] md:p-7"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2.5">
        <svg
          className="h-4 w-4"
          style={{ color: borderColor }}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {iconPaths[icon]}
        </svg>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-secondary)]">
          {categoryLabel}
        </p>
      </div>
      <h4 className="mt-3 mb-5 text-lg font-semibold text-[var(--color-text-heading)]">
        {name}
      </h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="relative"
            onMouseEnter={() => setHovered(skill.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="inline-flex cursor-default items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
              {skill.name}
            </span>
            <AnimatePresence>
              {skill.desc && hovered === skill.name && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs leading-5 text-[var(--color-text-secondary)] shadow-lg"
                >
                  {skill.desc}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
