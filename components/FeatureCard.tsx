import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Props = {
  index: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export default function FeatureCard({ index, title, description, href, icon: Icon }: Props) {
  return (
    <Link
      href={href}
      className="group relative rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6 flex flex-col justify-between min-h-[190px] hover:ring-gold/40 hover:bg-surface-2 transition-colors"
    >
      <div className="flex items-start justify-between">
        <Icon size={22} strokeWidth={1.6} className="text-gold" />
        <span className="font-mono text-[11px] text-sage-dim">{index}</span>
      </div>
      <div>
        <h3 className="font-display text-lg text-paper mt-6">{title}</h3>
        <p className="text-sm text-sage mt-1.5 leading-relaxed">{description}</p>
      </div>
      <ArrowUpRight
        size={16}
        className="absolute top-6 right-6 text-gold opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all"
      />
    </Link>
  );
}
