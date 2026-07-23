const jars = [
  { label: "Milk", fill: 0.2, color: "#C1553B" },
  { label: "Rice", fill: 0.9, color: "#8FA38C" },
  { label: "Yogurt", fill: 0.45, color: "#E7AC3F" },
  { label: "Spinach", fill: 0.1, color: "#C1553B" },
  { label: "Turmeric", fill: 0.95, color: "#8FA38C" },
];

export default function HeroShelf() {
  return (
    <svg
      viewBox="0 0 560 260"
      className="w-full h-auto"
      role="img"
      aria-label="Illustration of five labeled pantry jars sitting on a shelf, each filled to a different level to represent freshness"
    >
      {/* shelf */}
      <rect x="0" y="230" width="560" height="8" rx="2" fill="#16201A" />
      <rect x="0" y="238" width="560" height="4" fill="#0F1712" />

      {jars.map((jar, i) => {
        const w = 84;
        const h = 150;
        const gap = (560 - w * jars.length) / (jars.length + 1);
        const x = gap + i * (w + gap);
        const y = 230 - h;
        const fillH = h * jar.fill;
        const fillY = y + (h - fillH);

        return (
          <g key={jar.label}>
            <clipPath id={`clip-${i}`}>
              <rect x={x} y={y} width={w} height={h} rx={10} />
            </clipPath>
            {/* jar body */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={10}
              fill="#26362A"
              stroke="#5E7360"
              strokeOpacity={0.35}
            />
            {/* liquid fill */}
            <rect
              x={x}
              y={fillY}
              width={w}
              height={fillH}
              fill={jar.color}
              opacity={0.85}
              clipPath={`url(#clip-${i})`}
            />
            {/* lid */}
            <rect x={x + 10} y={y - 12} width={w - 20} height={14} rx={4} fill="#16201A" />
            {/* label */}
            <rect x={x + 8} y={y + h / 2 - 14} width={w - 16} height={28} rx={4} fill="#F4EEDD" opacity={0.92} />
            <text
              x={x + w / 2}
              y={y + h / 2 + 4}
              textAnchor="middle"
              fontSize="10"
              fontFamily="var(--font-plex-mono)"
              fill="#1F2A22"
              letterSpacing="0.5"
            >
              {jar.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
