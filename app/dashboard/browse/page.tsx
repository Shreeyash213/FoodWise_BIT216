"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import FreshnessGauge from "@/components/FreshnessGauge";
import { FoodItem } from "@/lib/data";

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data as FoodItem[]);
      })
      .catch((err) => console.error("Failed to load inventory", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [items, activeCategory, query]);

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-6xl">
      <header className="mb-8">
        <p className="label-stamp font-mono text-[11px] text-sage-dim">Browse Food Items</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1 text-paper">Search the pantry</h1>
        <p className="text-sage mt-2 max-w-xl">Look up anything the household owns, by name or category.</p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 rounded-lg bg-surface ring-1 ring-sage-dim/20 px-4 py-3 max-w-md w-full">
          <Search size={16} className="text-sage-dim shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search items…"
            className="bg-transparent outline-none text-sm text-paper placeholder:text-sage-dim w-full"
          />
        </div>
        <p className="text-sm text-sage-dim">{loading ? "Loading…" : `${filteredItems.length} items found`}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-mono transition ${
              category === activeCategory ? "bg-gold text-shelf ring-gold" : "text-sage ring-1 ring-sage-dim/30 hover:ring-gold/50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isExpiring = item.daysLeft != null && item.daysLeft <= 2;
          const isLowStock = item.quantity <= (item.lowStockThreshold ?? 2);
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-5 shadow-jar transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-paper text-sm font-semibold">{item.name}</h3>
                    {isExpiring && (
                      <span className="rounded-full bg-paprika/15 text-paprika px-2 py-0.5 text-[10px]">Expiring</span>
                    )}
                    {isLowStock && (
                      <span className="rounded-full bg-gold/15 text-gold px-2 py-0.5 text-[10px]">Low stock</span>
                    )}
                  </div>
                  <p className="text-sage-dim text-xs font-mono mt-1">{item.category} · {item.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-sage text-sm font-mono">{item.quantity} {item.unit}</div>
                  <div className="mt-2">
                    <FreshnessGauge daysLeft={item.daysLeft} compact />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] text-sage-dim font-mono">Threshold: {item.lowStockThreshold ?? 2} {item.unit}</span>
                <div className="text-[11px] text-sage-dim font-mono">Added by {item.addedBy}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
