"use client";

import { useMemo, useEffect, useState } from "react";
import { AlarmClock, PackageMinus, CalendarClock, Info, Check, CheckCheck, Trash2, RotateCcw } from "lucide-react";

type NotificationItem = {
  id: string;
  tone: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
};

const toneMeta = {
  expiry: { icon: AlarmClock, color: "text-paprika", bg: "bg-paprika/15" },
  "low-stock": { icon: PackageMinus, color: "text-gold", bg: "bg-gold/15" },
  plan: { icon: CalendarClock, color: "text-sage", bg: "bg-sage/15" },
  system: { icon: Info, color: "text-sage", bg: "bg-sage/15" },
  update: { icon: Info, color: "text-sage", bg: "bg-sage/15" },
} as const;

const filters = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "expiry", label: "Expiry" },
  { value: "low-stock", label: "Low stock" },
  { value: "plan", label: "Plan" },
  { value: "system", label: "System" },
] as const;

function formatRelative(iso?: string, nowTimestamp?: number | null) {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const current = nowTimestamp ?? d.getTime();
  const diff = Math.max(0, current - d.getTime());
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec} sec${sec === 1 ? "" : "s"} ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
  const days = Math.round(hr / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [now] = useState<number | null>(() => (typeof window !== "undefined" ? Date.now() : null));

  const notifySidebar = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notification-change"));
    }
  };

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data as NotificationItem[]);
      })
      .catch((err) => console.error("Failed to load notifications", err));
  }, []);

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((notification) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "unread") return !notification.isRead;
        return notification.tone === activeFilter;
      }),
    [activeFilter, items]
  );

  const toggleReadStatus = async (id: string, currentReadStatus: boolean) => {
    const nextStatus = !currentReadStatus;
    setItems((current) =>
      current.map((n) => (n.id === id ? { ...n, isRead: nextStatus } : n))
    );
    notifySidebar();

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update read status:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setItems((current) => current.map((n) => ({ ...n, isRead: true })));
    notifySidebar();

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setItems((current) => current.filter((n) => n.id !== id));
    notifySidebar();

    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    setItems([]);
    notifySidebar();

    try {
      await fetch("/api/notifications?clearAll=true", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-3xl">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="label-stamp font-mono text-[11px] text-sage-dim">View Notifications</p>
            <h1 className="font-display text-3xl md:text-4xl mt-1 text-paper">Kitchen alerts</h1>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-paprika/20 text-paprika font-mono text-xs px-3.5 py-1.5 ring-1 ring-paprika/30">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="text-sage mt-2">
          Expiry warnings, low stock, and plan reminders — everything that needs a quick decision.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const countLabel =
              filter.value === "unread" ? ` (${unreadCount})` : "";
            return (
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
                {filter.label}{countLabel}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-full border border-sage-dim/30 bg-surface px-3.5 py-2 text-xs text-paper hover:bg-surface/80 transition"
            >
              <CheckCheck size={14} className="text-gold" /> Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-sage-dim px-3.5 py-2 text-xs text-sage hover:bg-surface hover:text-paper transition"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
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
            const meta = toneMeta[n.tone as keyof typeof toneMeta] ?? toneMeta.system;
            const Icon = meta.icon;
            const isUnread = !n.isRead;
            return (
              <li
                key={n.id}
                className={`flex flex-col gap-3 rounded-2xl bg-surface p-4 transition ring-1 ${
                  isUnread
                    ? "ring-gold/40 border-l-4 border-l-gold bg-surface/90 shadow-md"
                    : "ring-sage-dim/15 opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <span className={`rounded-lg p-2 shrink-0 ${meta.bg}`}>
                      <Icon size={16} className={meta.color} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm leading-snug ${isUnread ? "text-paper font-medium" : "text-sage"}`}>
                          {n.message}
                        </p>
                        {isUnread && (
                          <span className="inline-block h-2 w-2 rounded-full bg-paprika shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-sage-dim mt-1.5">{formatRelative(n.createdAt, now)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(n.id)}
                    className="p-1 text-sage-dim hover:text-red-400 transition shrink-0"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-sage-dim/10">
                  <span className="text-[11px] font-mono text-sage-dim uppercase tracking-[0.18em]">
                    {n.tone.replace("-", " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleReadStatus(n.id, Boolean(n.isRead))}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                      isUnread
                        ? "bg-gold text-shelf font-semibold hover:brightness-110"
                        : "bg-shelf/80 text-sage hover:bg-shelf hover:text-paper ring-1 ring-sage-dim/20"
                    }`}
                  >
                    {isUnread ? (
                      <>
                        <Check size={14} /> Mark read
                      </>
                    ) : (
                      <>
                        <RotateCcw size={14} /> Mark unread
                      </>
                    )}
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
