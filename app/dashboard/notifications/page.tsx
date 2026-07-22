"use client";

import { useMemo, useState } from "react";
import { AlarmClock, PackageMinus, CalendarClock, Info, Check, Trash2 } from "lucide-react";
import { notifications } from "@/lib/data";

const toneMeta = {
  expiry: { icon: AlarmClock, color: "text-paprika", bg: "bg-paprika/15" },
  "low-stock": { icon: PackageMinus, color: "text-gold", bg: "bg-gold/15" },
  plan: { icon: CalendarClock, color: "text-sage", bg: "bg-sage/15" },
  system: { icon: Info, color: "text-sage", bg: "bg-sage/15" },
} as const;

const filters = [
  { value: "all", label: "All" },
  { value: "expiry", label: "Expiry" },
  { value: "low-stock", label: "Low stock" },
  { value: "plan", label: "Plan" },
  { value: "system", label: "System" },
] as const;

export default function NotificationsPage() {
  const [items, setItems] = useState(notifications);
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredItems = useMemo(
    () =>
      items.filter((notification) =>
        activeFilter === "all" ? true : notification.tone === activeFilter
      ),
    [activeFilter, items]
  );

  const handleDismiss = (id: string) => {
    setItems((current) => current.filter((notification) => notification.id !== id));
  };

  const handleClearAll = () => setItems([]);

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-3xl">
      <header className="mb-8">
        <p className="label-stamp font-mono text-[11px] text-sage-dim">View Notifications</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1 text-paper">Kitchen alerts</h1>
        <p className="text-sage mt-2">
          Expiry warnings, low stock, and plan reminders — everything that needs a quick decision.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full px-3.5 py-2 text-xs font-mono transition ${
                filter.value === activeFilter
                  ? "bg-gold text-shelf"
                  : "text-sage ring-1 ring-sage-dim/30 hover:ring-gold/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-2 rounded-full border border-sage-dim px-4 py-2 text-xs text-sage hover:bg-surface hover:text-paper transition"
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-3xl bg-surface ring-1 ring-sage-dim/15 p-10 text-center text-sage">
          {items.length === 0 ? (
            <>
              <p className="font-display text-lg text-paper">No alerts right now</p>
              <p className="mt-2 text-sm">You&apos;re all caught up with the kitchen today.</p>
            </>
          ) : (
            <>
              <p className="font-display text-lg text-paper">No alerts in this filter</p>
              <p className="mt-2 text-sm">Try switching to All to see every notification.</p>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredItems.map((n) => {
            const meta = toneMeta[n.tone];
            const Icon = meta.icon;
            return (
              <li
                key={n.id}
                className="flex flex-col gap-3 rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-4"
              >
                <div className="flex items-start gap-4">
                  <span className={`rounded-lg p-2 shrink-0 ${meta.bg}`}>
                    <Icon size={16} className={meta.color} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-paper leading-snug">{n.message}</p>
                    <p className="text-[11px] font-mono text-sage-dim mt-1.5">{n.time}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-sage-dim uppercase tracking-[0.18em]">
                    {n.tone.replace("-", " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDismiss(n.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-shelf/80 px-3 py-2 text-xs text-sage transition hover:bg-shelf"
                  >
                    <Check size={14} /> Mark read
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
