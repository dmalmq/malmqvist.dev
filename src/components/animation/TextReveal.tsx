import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
  text: string;
  mode?: "word" | "character";
  staggerDelay?: number;
  duration?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function TextReveal({
  text,
  mode = "word",
  staggerDelay = 0.05,
  duration = 0.5,
  className = "",
  as: Tag = "span",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const units = mode === "word" ? text.split(" ") : text.split("");
  const separator = mode === "word" ? "\u00A0" : "";

  return (
    <Tag ref={ref as any} className={className} aria-label={text}>
      {units.map((unit, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.15em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={
              isInView
                ? { y: "0%", opacity: 1 }
                : { y: "110%", opacity: 0 }
            }
            transition={{
              duration,
              delay: i * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-hidden="true"
          >
            {unit}
            {separator}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
