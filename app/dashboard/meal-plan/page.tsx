"use client";

import { useEffect, useState } from "react";
import { seedMealPlan as seed, MealSlot } from "@/lib/data";

export default function MealPlanPage() {
  const [plan, setPlan] = useState<MealSlot[]>(seed);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/meal-plan")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlan(data);
        }
      })
      .catch((err) => console.error("Failed to fetch meal plan:", err));
  }, []);

  const startEdit = (day: string, current: string) => {
    setEditing((s) => ({ ...s, [day]: true }));
    setValues((v) => ({ ...v, [day]: current }));
  };

  const cancelEdit = (day: string) => {
    setEditing((s) => ({ ...s, [day]: false }));
    setValues((v) => {
      const next = { ...v };
      delete next[day];
      return next;
    });
  };

  const saveEdit = async (day: string) => {
    const newText = values[day]?.trim() ?? "";
    const slotToUpdate = plan.find((s) => s.day === day);
    const updatedSlot = {
      day,
      meal: newText || slotToUpdate?.meal || "",
      usesExpiring: slotToUpdate?.usesExpiring ?? false,
    };

    setPlan((p) => p.map((s) => (s.day === day ? { ...s, meal: updatedSlot.meal } : s)));
    setEditing((s) => ({ ...s, [day]: false }));

    try {
      await fetch("/api/meal-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSlot),
      });
    } catch (err) {
      console.error("Failed to save meal plan:", err);
    }
  };

  const resetPlan = async () => {
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data?.plan) {
        setPlan(data.plan);
      } else {
        setPlan(seed);
      }
    } catch (err) {
      console.error("Failed to reset meal plan:", err);
      setPlan(seed);
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-6xl">
      <header className="mb-8">
        <p className="label-stamp font-mono text-[11px] text-sage-dim">Plan Weekly Meals</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1 text-paper">This week&apos;s menu</h1>
        <p className="text-sage mt-2 max-w-xl">
          Meals are suggested from what&apos;s closest to expiring, so nothing on the
          shelf goes to waste.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={resetPlan}
          className="rounded-full border border-sage-dim px-4 py-2 text-sm text-paper hover:bg-surface transition"
        >
          Reset to suggested
        </button>
        <p className="text-sm text-sage-dim">Click a card to edit a meal and press Update to save.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {plan.map((slot) => (
          <div
            key={slot.day}
            className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-5 flex flex-col justify-between min-h-[150px]"
          >
            <div>
              <p className="label-stamp font-mono text-[10px] text-sage-dim">{slot.day}</p>
              {!editing[slot.day] ? (
                <p className="font-display text-lg text-paper mt-2 leading-snug">{slot.meal}</p>
              ) : (
                <input
                  aria-label={`Edit meal for ${slot.day}`}
                  value={values[slot.day] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [slot.day]: e.target.value }))}
                  className="mt-2 w-full rounded-md border border-sage-dim/20 bg-shelf/70 px-3 py-2 text-paper outline-none"
                />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              {slot.usesExpiring ? (
                <p className="text-[11px] font-mono text-gold">uses expiring stock</p>
              ) : (
                <p className="text-[11px] font-mono text-sage-dim">from pantry staples</p>
              )}

              <div className="ml-3 flex items-center gap-2">
                {!editing[slot.day] ? (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(slot.day, slot.meal)}
                      className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold"
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => saveEdit(slot.day)}
                      className="rounded-full bg-gold px-3 py-1 text-xs text-shelf"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEdit(slot.day)}
                      className="rounded-full border border-sage-dim px-3 py-1 text-xs text-paper"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
