"use client";

import { useEffect, useState, useCallback } from "react";

type Notification = {
  id: string;
  tone: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
};

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

export default function NotificationsList() {
  const [items, setItems] = useState<Notification[]>([]);
  const [now] = useState<number | null>(() => (typeof window !== "undefined" ? Date.now() : null));

  const loadNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => console.error("Failed to load notifications", err));
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleNotificationChange = () => {
      loadNotifications();
    };

    window.addEventListener("notification-change", handleNotificationChange);
    return () => {
      window.removeEventListener("notification-change", handleNotificationChange);
    };
  }, [loadNotifications]);

  if (!items.length) return <div className="text-sage-dim">No notifications</div>;

  return (
    <div className="space-y-3">
      {items.map((n) => (
        <div
          key={n.id}
          className={`rounded-2xl bg-surface/80 p-4 ring-1 ${
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
          <p className="mt-2 text-[11px] font-mono text-sage-dim">{formatRelative(n.createdAt, now)}</p>
        </div>
      ))}
    </div>
  );
}
