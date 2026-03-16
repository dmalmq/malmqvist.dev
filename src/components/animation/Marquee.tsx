interface Props {
  items: string[];
  reverse?: boolean;
  className?: string;
  colors?: string[];
}

const defaultColors = [
  "var(--color-pine)",
  "var(--color-iris)",
  "var(--color-foam)",
  "var(--color-love)",
  "var(--color-gold)",
];

export default function Marquee({ items, reverse = false, className = "", colors = defaultColors }: Props) {
  const direction = reverse ? "reverse" : "normal";

  const renderItems = () =>
    items.map((item, i) => (
      <span key={i}>
        <span style={{ color: colors[i % colors.length] }}>{item}</span>
        <span className="marquee-separator"> / </span>
      </span>
    ));

  return (
    <div
      className={`marquee-container group ${className}`}
      aria-hidden="true"
    >
      <div
        className="marquee-track"
        style={{ animationDirection: direction }}
      >
        <span className="marquee-content">{renderItems()}</span>
        <span className="marquee-content">{renderItems()}</span>
      </div>
    </div>
  );
}
