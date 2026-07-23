"use client";

import { useEffect, useState } from "react";
import { wasteByCategory as defaultWasteByCategory, monthlyWasteTrend as defaultMonthlyWasteTrend } from "@/lib/data";

type AnalyticsData = {
  wasteByCategory: typeof defaultWasteByCategory;
  monthlyWasteTrend: number[];
  wasteRate: number;
  topCulprit: string;
  lowStockCount?: number;
  totalItems?: number;
  freshnessRate?: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    wasteByCategory: defaultWasteByCategory,
    monthlyWasteTrend: defaultMonthlyWasteTrend,
    wasteRate: 7,
    topCulprit: "Produce",
    lowStockCount: 0,
    totalItems: 0,
    freshnessRate: 100,
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && Array.isArray(resData.monthlyWasteTrend)) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Failed to load analytics:", err));
  }, []);

  const maxTrend = Math.max(...data.monthlyWasteTrend, 1);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-6xl">
      <header className="mb-8">
        <p className="label-stamp font-mono text-[11px] text-sage-dim">Food Analytics</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1 text-paper">
          Where food actually goes
        </h1>
        <p className="text-sage mt-2 max-w-xl">
          Waste trends and category breakdowns, tracked dynamically from what the household
          logs as stored or used.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6">
          <p className="label-stamp font-mono text-[10px] text-sage-dim">Low stock items</p>
          <p className="font-display text-4xl text-paper mt-2">{data.lowStockCount ?? 0}</p>
          <p className="text-sage text-sm mt-1">items currently below threshold</p>
        </div>
        <div className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6">
          <p className="label-stamp font-mono text-[10px] text-sage-dim">Waste rate</p>
          <p className="font-display text-4xl text-paper mt-2">{data.wasteRate}%</p>
          <p className="text-sage text-sm mt-1">down from 22% in January</p>
        </div>
        <div className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6">
          <p className="label-stamp font-mono text-[10px] text-sage-dim">Top culprit</p>
          <p className="font-display text-4xl text-paper mt-2">{data.topCulprit}</p>
          <p className="text-sage text-sm mt-1">highest volume category logged</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <section className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6">
          <h2 className="font-display text-lg text-paper mb-1">Waste, month by month</h2>
          <p className="text-sage text-sm mb-6">Percentage of groceries logged as wasted.</p>
          <svg viewBox="0 0 340 160" className="w-full h-40" role="img" aria-label="Monthly waste trend">
            {data.monthlyWasteTrend.map((v, i) => {
              const barW = 32;
              const gap = (340 - barW * 7) / 8;
              const x = gap + i * (barW + gap);
              const h = (v / maxTrend) * 110;
              const y = 130 - h;
              const color = i === data.monthlyWasteTrend.length - 1 ? "#E7AC3F" : "#5E7360";
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={h} rx={4} fill={color} />
                  <text x={x + barW / 2} y={146} textAnchor="middle" fontSize="10" fill="#8FA38C" fontFamily="var(--font-plex-mono)">
                    {months[i]}
                  </text>
                </g>
              );
            })}
          </svg>
        </section>

        {/* Category breakdown */}
        <section className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6">
          <h2 className="font-display text-lg text-paper mb-1">Waste by category</h2>
          <p className="text-sage text-sm mb-6">Share of total food waste, this quarter.</p>
          <div className="space-y-4">
            {data.wasteByCategory.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-paper">{c.category}</span>
                  <span className="font-mono text-sage-dim">{c.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-shelf/70 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-paprika"
                    style={{ width: `${c.percent}%`, opacity: 0.5 + c.percent / 100 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
