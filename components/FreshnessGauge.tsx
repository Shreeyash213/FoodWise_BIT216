type Props = {
  daysLeft: number;
  max?: number;
  compact?: boolean;
};

// Signature element: a horizontal "fill" gauge styled like liquid level in a
// jar, reading full and gold when fresh, draining and turning paprika as an
// item approaches its expiry.
export default function FreshnessGauge({ daysLeft, max = 14, compact = false }: Props) {
  const pct = Math.max(4, Math.min(100, (daysLeft / max) * 100));
  const urgent = daysLeft <= 2;
  const soon = daysLeft <= 5 && !urgent;

  const color = urgent ? "#C1553B" : soon ? "#E7AC3F" : "#8FA38C";
  const label =
    daysLeft <= 0
      ? "Use today"
      : daysLeft === 1
      ? "1 day left"
      : daysLeft > max
      ? `${daysLeft}d+`
      : `${daysLeft} days left`;

  return (
    <div className={compact ? "w-24" : "w-full"}>
      <div className="h-2.5 rounded-full bg-shelf/70 overflow-hidden ring-1 ring-black/20">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {!compact && (
        <p className="mt-1.5 font-mono text-[11px] tracking-wide" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
}
