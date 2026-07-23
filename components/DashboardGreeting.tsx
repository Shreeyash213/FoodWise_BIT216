"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string | null {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    let fullName = stored;
    if (stored.startsWith("{")) {
      const parsed = JSON.parse(stored);
      fullName = parsed?.name ?? "";
    }
    const firstName = fullName.trim().split(/\s+/)[0];
    return firstName || null;
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export default function DashboardGreeting() {
  const name = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <span className="font-display text-4xl md:text-5xl mt-4 text-paper">
      {name
        ? `Your kitchen is tracking well, ${name}.`
        : "Your kitchen is tracking well."}
    </span>
  );
}
