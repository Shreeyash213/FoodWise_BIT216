"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, AlarmClock, CalendarCheck, PackageMinus, ArrowUpRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import FreshnessGauge from "@/components/FreshnessGauge";
import DashboardGreeting from "@/components/DashboardGreeting";
import { FoodItem, NotificationItem, MealSlot, seedInventory, seedNotifications, seedMealPlan, computeStats } from "@/lib/data";

function formatRelative(iso?: string) {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diff = Math.max(0, Date.now() - d.getTime());
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec} sec${sec === 1 ? "" : "s"} ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
  const days = Math.round(hr / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DashboardOverview() {
  const [items, setItems] = useState<FoodItem[]>(seedInventory);
  const [alertList, setAlertList] = useState<NotificationItem[]>(seedNotifications);
  const [meals, setMeals] = useState<MealSlot[]>(seedMealPlan);
  const [dashboardStats, setDashboardStats] = useState(() => computeStats(seedInventory, seedMealPlan));

  useEffect(() => {
    // Fetch stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.itemsTracked === "number") {
          setDashboardStats(data);
        }
      })
      .catch((err) => console.error("Failed to load stats", err));

    // Fetch inventory
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err) => console.error("Failed to load inventory", err));

    // Fetch notifications
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAlertList(data);
        }
      })
      .catch((err) => console.error("Failed to load notifications", err));

    // Fetch meal plan
    fetch("/api/meal-plan")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMeals(data);
        }
      })
      .catch((err) => console.error("Failed to load meal plan", err));
  }, []);

  const expiringSoon = [...items].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-6xl">
      <section className="mb-10 overflow-hidden rounded-[2rem] border border-sage-dim/15 bg-[#132917] p-8 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="label-stamp font-mono text-[11px] text-gold">Today in your kitchen</p>
            <DashboardGreeting />
            <p className="text-sage mt-4 max-w-xl leading-relaxed text-[1.02rem]">
              Freshness insights, alerts, and meal plan progress are all in one dashboard.
              Tap through the cards below to act quickly where your kitchen needs it most.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/inventory"
                className="inline-flex items-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-shelf shadow-button transition hover:brightness-110"
              >
                Review inventory
              </Link>
              <Link
                href="/dashboard/notifications"
                className="inline-flex items-center rounded-full border border-sage-dim px-5 py-3 text-sm text-paper transition hover:bg-surface"
              >
                View alerts
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:w-[420px]">
            <div className="rounded-[1.75rem] bg-surface/80 p-5 ring-1 ring-sage-dim/15">
              <p className="label-stamp text-[10px] text-sage-dim">Freshest item</p>
              <p className="mt-3 text-2xl font-display text-paper">{dashboardStats.freshestItem.name}</p>
              <p className="mt-2 text-sm text-sage">{dashboardStats.freshestItem.daysLeft} days left — check shelf location.</p>
            </div>
            <div className="rounded-[1.75rem] bg-surface/80 p-5 ring-1 ring-sage-dim/15">
              <p className="label-stamp text-[10px] text-sage-dim">Next alert</p>
              <p className="mt-3 text-2xl font-display text-paper">{dashboardStats.nextAlert.title}</p>
              <p className="mt-2 text-sm text-sage">{dashboardStats.nextAlert.desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4 mb-10">
        <StatCard label="Items tracked" value={dashboardStats.itemsTracked} icon={Boxes} />
        <StatCard label="Expiring soon" value={dashboardStats.expiringSoon} icon={AlarmClock} tone="paprika" />
        <StatCard label="Meals planned" value={dashboardStats.mealsPlanned} icon={CalendarCheck} tone="gold" />
        <StatCard label="Low stock items" value={dashboardStats.lowStockItems} icon={PackageMinus} tone="gold" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr] mb-10">
        <div className="rounded-[2rem] bg-[#112819] p-6 ring-1 ring-sage-dim/15 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl text-paper">On the shelf, going first</h2>
              <p className="text-sage mt-2 text-sm">Sorted by what&apos;s closest to its use-by date.</p>
            </div>
            <Link
              href="/dashboard/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-xs text-gold transition hover:bg-gold/15"
            >
              <ArrowUpRight size={13} /> Manage inventory
            </Link>
          </div>
          <ul className="divide-y divide-sage-dim/15">
            {expiringSoon.map((item) => (
              <li key={item.id} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-paper text-sm font-medium">{item.name}</p>
                  <p className="text-sage-dim text-xs font-mono mt-1">{item.quantity} {item.unit} · {item.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <FreshnessGauge daysLeft={item.daysLeft} />
                  <span className="rounded-full bg-shelf/80 px-3 py-1 text-[11px] text-sage">{item.daysLeft} days</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] bg-[#112819] p-6 ring-1 ring-sage-dim/15 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl text-paper">Notifications</h2>
              <p className="text-sage mt-2 text-sm">Quick kitchen alerts for expiry, stock, and meal planning.</p>
            </div>
            <Link
              href="/dashboard/notifications"
              className="text-xs text-gold hover:underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-4">
            {alertList.slice(0, 4).map((n) => (
              <li
                key={n.id}
                className={`rounded-3xl bg-surface/80 p-4 ring-1 transition ${
                  !n.isRead ? "ring-gold/40 border-l-2 border-l-gold" : "ring-sage-dim/10 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm leading-snug ${!n.isRead ? "text-paper font-medium" : "text-sage"}`}>
                    {n.message}
                  </p>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-paprika shrink-0" title="Unread" />
                  )}
                </div>
                <p className="mt-2 text-[11px] font-mono text-sage-dim">{n.time || formatRelative(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-[2rem] bg-[#112819] p-6 ring-1 ring-sage-dim/15 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl text-paper">This week&apos;s meals</h2>
            <p className="text-sage mt-2 text-sm">Fresh meals planned using your expiring ingredients first.</p>
          </div>
          <Link
            href="/dashboard/meal-plan"
            className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-xs text-gold transition hover:bg-gold/15"
          >
            Plan the week <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {meals.map((slot) => (
            <div key={slot.day} className="rounded-3xl bg-surface/80 p-4 ring-1 ring-sage-dim/10">
              <p className="label-stamp font-mono text-[10px] text-sage-dim">{slot.day}</p>
              <p className="mt-3 text-sm text-paper leading-snug">{slot.meal}</p>
              {slot.usesExpiring ? (
                <p className="mt-3 rounded-full bg-gold/10 px-2 py-1 text-[11px] text-gold">uses expiring stock</p>
              ) : (
                <p className="mt-3 rounded-full bg-sage/10 px-2 py-1 text-[11px] text-sage">pantry staples</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
