"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wheat,
  ArrowRight,
  UserCog,
  Boxes,
  Search,
  BarChart3,
  Bell,
  CalendarDays,
} from "lucide-react";
import HeroShelf from "@/components/HeroShelf";
import FeatureCard from "@/components/FeatureCard";

const features = [
  {
    index: "01",
    title: "Register & privacy settings",
    description:
      "Set up your household, invite the people who share your kitchen, and choose exactly what each person can see.",
    href: "/dashboard/settings",
    icon: UserCog,
  },
  {
    index: "02",
    title: "Manage food inventory",
    description:
      "Log what comes in and what runs out, sorted by fridge, freezer, or shelf.",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    index: "03",
    title: "Browse food items",
    description:
      "Search anything the household owns in seconds, filtered by category or place.",
    href: "/dashboard/browse",
    icon: Search,
  },
  {
    index: "04",
    title: "Food analytics",
    description:
      "See waste trends by category and month, and where your grocery budget is actually going.",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    index: "05",
    title: "View notifications",
    description:
      "Get nudged before something expires, before stock runs low, or before a meal plan falls short.",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    index: "06",
    title: "Plan weekly meals",
    description:
      "Build the week's menu around what's about to expire, not what's easiest to forget.",
    href: "/dashboard/meal-plan",
    icon: CalendarDays,
  },
];

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Wheat className="text-gold" size={22} strokeWidth={1.75} />
          <span className="font-display text-xl tracking-tight text-paper">FOODWISE</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowIntro((current) => !current)}
            className="rounded-full border border-sage-dim bg-transparent px-4 py-2 text-sm font-medium text-paper transition hover:bg-surface-2"
          >
            {showIntro ? "Hide details" : "Why FOODWISE?"}
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-gold text-shelf text-sm font-medium px-4 py-2 hover:brightness-110 transition"
          >
            Open dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-10 max-w-6xl mx-auto pt-8 md:pt-14 pb-16 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="label-stamp font-mono text-[11px] text-gold mb-4">
            For households, not warehouses
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.05] text-paper">
            Know what&apos;s in your kitchen <span className="italic text-gold">before</span> it goes off.
          </h1>
          <p className="text-sage text-base md:text-lg mt-6 max-w-md leading-relaxed">
            FOODWISE tracks every jar, carton, and container your household owns —
            then plans meals around whatever&apos;s closest to its use-by date.
          </p>
          <div className="flex flex-col gap-4 mt-8 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-gold text-shelf font-medium px-5 py-3 hover:brightness-110 transition"
            >
              Go to dashboard <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm text-sage hover:text-paper underline underline-offset-4 decoration-sage-dim"
            >
              Register your household
            </Link>
          </div>
          {showIntro ? (
            <div className="mt-6 rounded-3xl bg-surface ring-1 ring-sage-dim/15 p-6 text-sage">
              <p>
                FOODWISE helps household kitchens stay ahead of expiry dates, improve meal planning, and reduce waste with clear, interactive inventory tools.
              </p>
            </div>
          ) : null}
        </div>
        <HeroShelf />
      </section>

      {/* Feature grid = the six use cases */}
      <section className="px-6 md:px-10 max-w-6xl mx-auto pb-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl text-paper">
            Everything the kitchen needs, in one place
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <FeatureCard key={f.index} {...f} />
          ))}
        </div>
      </section>

      <footer className="px-6 md:px-10 max-w-6xl mx-auto pb-10 flex items-center justify-between text-xs text-sage-dim font-mono">
        <span>FOODWISE — household food management</span>
        <span>Kathmandu</span>
      </footer>
    </div>
  );
}
