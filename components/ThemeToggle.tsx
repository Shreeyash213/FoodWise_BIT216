"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      let activeTheme: "dark" | "light" = "dark";
      if (stored === "light" || stored === "dark") {
        activeTheme = stored;
      } else {
        activeTheme = "dark";
      }
      document.documentElement.classList.toggle("light", activeTheme === "light");
      queueMicrotask(() => setTheme(activeTheme));
    } catch {
      // noop
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // noop
    }
    document.documentElement.classList.toggle("light", next === "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full bg-shelf/70 px-3 py-2 text-sm text-paper transition hover:bg-shelf"
      aria-pressed={theme === "light"}
    >
      {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
      <span>{theme === "light" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
