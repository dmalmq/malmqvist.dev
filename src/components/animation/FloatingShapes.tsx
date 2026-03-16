import { motion } from "framer-motion";

interface Shape {
  type: "circle" | "hexagon" | "ring";
  size: number;
  x: string;
  y: string;
  color: string;
  delay: number;
  duration: number;
}

const defaultShapes: Shape[] = [
  { type: "circle", size: 120, x: "8%", y: "15%", color: "var(--color-iris)", delay: 0, duration: 18 },
  { type: "hexagon", size: 80, x: "78%", y: "10%", color: "var(--color-pine)", delay: 2, duration: 22 },
  { type: "ring", size: 100, x: "85%", y: "65%", color: "var(--color-foam)", delay: 4, duration: 20 },
  { type: "circle", size: 60, x: "15%", y: "72%", color: "var(--color-love)", delay: 1, duration: 16 },
  { type: "hexagon", size: 90, x: "50%", y: "80%", color: "var(--color-gold)", delay: 3, duration: 24 },
  { type: "ring", size: 70, x: "35%", y: "20%", color: "var(--color-iris)", delay: 5, duration: 19 },
];

function ShapeSVG({ type, size, color }: { type: string; size: number; color: string }) {
  if (type === "hexagon") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <polygon
          points="50,2 93,25 93,75 50,98 7,75 7,25"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.15"
        />
      </svg>
    );
  }
  if (type === "ring") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" stroke={color} strokeWidth="1.5" opacity="0.12" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="42" fill={color} opacity="0.06" />
    </svg>
  );
}

interface Props {
  shapes?: Shape[];
  className?: string;
}

export default function FloatingShapes({ shapes = defaultShapes, className = "" }: Props) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: shape.x, top: shape.y }}
          animate={{
            y: [0, -20, 10, -15, 0],
            x: [0, 10, -8, 12, 0],
            rotate: [0, 5, -3, 4, 0],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ShapeSVG type={shape.type} size={shape.size} color={shape.color} />
        </motion.div>
      ))}
    </div>
  );
}
