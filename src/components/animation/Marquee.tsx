interface Props {
  items: string[];
  reverse?: boolean;
  className?: string;
}

export default function Marquee({ items, reverse = false, className = "" }: Props) {
  const direction = reverse ? "reverse" : "normal";

  const renderItems = () =>
    items.map((item, i) => (
      <span key={i}>
        <span className="text-[var(--color-text-secondary)]">{item}</span>
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
