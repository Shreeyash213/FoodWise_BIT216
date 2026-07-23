"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Boxes,
  Search,
  BarChart3,
  Bell,
  CalendarDays,
  Settings,
  Wheat,
} from "lucide-react";
import { logOut } from "@/lib/auth-client";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/inventory", label: "Manage Inventory", icon: Boxes },
  { href: "/dashboard/browse", label: "Browse Food Items", icon: Search },
  { href: "/dashboard/analytics", label: "Food Analytics", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/meal-plan", label: "Plan Weekly Meals", icon: CalendarDays },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getFirstName(): string | null {
  if (typeof window === "undefined") return null;
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

export default function Sidebar() {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserName(getFirstName());
  }, []);

  const fetchUnreadCount = useCallback(() => {
    fetch("/api/notifications/count")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.count === "number") {
          setNotificationCount(data.count);
        }
      })
      .catch((err) => console.error("Failed to fetch notification count:", err));
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const handleNotificationChange = () => {
      fetchUnreadCount();
    };

    window.addEventListener("notification-change", handleNotificationChange);
    return () => {
      window.removeEventListener("notification-change", handleNotificationChange);
    };
  }, [pathname, fetchUnreadCount]);

  const kitchenName = userName ? `${userName} Kitchen` : "Sharma Kitchen";

  return (
    <aside className="hidden md:flex md:flex-col w-72 shrink-0 border-r border-sage-dim/10 bg-shelf/80 backdrop-blur-xl min-h-screen sticky top-0">
      <div className="px-6 py-8">
        <Link href="/" className="flex items-center gap-3">
          <Wheat className="text-gold" size={24} strokeWidth={1.75} />
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-gold">FOODWISE</p>
            <p className="text-[11px] text-sage-dim">Kitchen intelligence</p>
          </div>
        </Link>

        <div className="mt-8 rounded-[2rem] bg-[#112919] p-5 ring-1 ring-sage-dim/15">
          <p className="text-[11px] uppercase tracking-[0.35em] text-sage-dim">My kitchen</p>
          <p className="mt-4 text-2xl font-display text-paper">{kitchenName}</p>
          <p className="mt-2 text-sm text-sage">Kathmandu, Nepal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          const badge =
            href === "/dashboard/notifications" ? notificationCount : null;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center justify-between gap-3 rounded-3xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-gold/10 text-paper ring-1 ring-gold/20"
                  : "text-sage hover:bg-surface hover:text-paper"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className={active ? "text-gold" : "text-sage-dim group-hover:text-gold"}
                />
                {label}
              </span>
              {badge != null && badge > 0 ? (
                <span className="font-mono text-[10px] rounded-full bg-paprika/90 text-paper px-2 py-1">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-sage-dim/10">
        <p className="label-stamp text-[10px] text-sage-dim">Quick actions</p>
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/dashboard/inventory"
            className="rounded-2xl bg-surface/80 px-4 py-3 text-sm text-paper transition hover:bg-surface"
          >
            Add inventory
          </Link>
          <Link
            href="/dashboard/meal-plan"
            className="rounded-2xl border border-sage-dim/30 px-4 py-3 text-sm text-paper transition hover:bg-surface"
          >
            Update meal plan
          </Link>
          <button className="rounded-2xl border border-red-700 bg-red-600 px-4 py-3 text-sm text-paper transition hover:bg-red-500" onClick={() => logOut()}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
