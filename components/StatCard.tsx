import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "gold" | "paprika" | "sage";
};

export default function StatCard({ label, value, icon: Icon, tone = "sage" }: Props) {
  const toneClass =
    tone === "gold" ? "text-gold" : tone === "paprika" ? "text-paprika" : "text-sage";

  return (
    <div className="min-h-[140px] rounded-[1.75rem] bg-[#122818] ring-1 ring-sage-dim/15 px-5 py-5 shadow-[0_28px_60px_-40px_rgba(0,0,0,0.55)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-stamp font-mono text-[10px] text-sage-dim">{label}</p>
          <p className="font-display text-3xl mt-3 text-paper">{value}</p>
        </div>
        <Icon size={18} strokeWidth={1.75} className={toneClass} />
      </div>
    </div>
  );
}
