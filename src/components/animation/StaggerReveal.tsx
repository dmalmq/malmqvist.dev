import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  variant?: "fade-up" | "slide-left" | "slide-right" | "scale" | "fade-in";
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

const variants = {
  "fade-up": { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  "slide-left": { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
  "slide-right": { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } },
  "fade-in": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

export default function StaggerReveal({
  children,
  variant = "fade-up",
  staggerDelay = 0.12,
  duration = 0.6,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const v = variants[variant];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: v.hidden,
                visible: {
                  ...v.visible,
                  transition: { duration, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : (
            <motion.div
              variants={{
                hidden: v.hidden,
                visible: {
                  ...v.visible,
                  transition: { duration, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              {children}
            </motion.div>
          )}
    </motion.div>
  );
}
