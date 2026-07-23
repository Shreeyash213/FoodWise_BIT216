"use client";

import { useEffect, useState } from "react";
import { FoodItem, seedHouseholdMembers } from "@/lib/data";

const commonUnits = ["g", "kg", "ml", "L", "pcs", "loaf", "pack", "can", "box", "oz", "items"];
const categories = ["Produce", "Dairy", "Pantry", "Frozen", "Meat", "Bakery"] as const;
const locations = ["Fridge", "Freezer", "Pantry Shelf"] as const;

export default function ItemEditModal({
  item,
  onClose,
  onSave,
}: {
  item: FoodItem | null;
  onClose: () => void;
  onSave: (updated: FoodItem) => void;
}) {
  const [household, setHousehold] = useState<string[]>(() => seedHouseholdMembers.map((m) => m.name));

  const [form, setForm] = useState(() => ({
    name: item?.name ?? "",
    quantity: item?.quantity ?? 1,
    unit: item?.unit ?? "pcs",
    daysLeft: item?.daysLeft ?? 1,
    location: item?.location ?? "Fridge",
    category: item?.category ?? "Produce",
    addedBy: item?.addedBy ?? "Asha",
    lowStockThreshold: item?.lowStockThreshold ?? 2,
  }));

  useEffect(() => {
    fetch("/api/household")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((m: { name: string }) => m.name);
          setHousehold(names);
        }
      })
      .catch((err) => console.error("Failed to load household members", err));
  }, []);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...item,
      name: form.name,
      quantity: Number(form.quantity),
      unit: form.unit,
      daysLeft: Number(form.daysLeft),
      location: form.location,
      category: form.category,
      addedBy: form.addedBy,
      lowStockThreshold: Number(form.lowStockThreshold),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-lg rounded-3xl bg-surface p-6 md:p-8 ring-1 ring-sage-dim/20 shadow-2xl space-y-4">
        <h3 className="font-display text-xl text-paper">Edit item</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-sage sm:col-span-2">
            Item name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
              required
            />
          </label>

          <label className="block text-sm font-medium text-sage">
            Quantity
            <input
              type="number"
              step="any"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
              required
            />
          </label>

          <label className="block text-sm font-medium text-sage">
            Unit
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
            >
              {commonUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-sage">
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as typeof categories[number] })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-sage">
            Location
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value as typeof locations[number] })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-sage">
            Days left
            <input
              type="number"
              min={1}
              value={form.daysLeft}
              onChange={(e) => setForm({ ...form, daysLeft: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
              required
            />
          </label>

          <label className="block text-sm font-medium text-sage">
            Low stock threshold
            <input
              type="number"
              min={0}
              step="any"
              value={form.lowStockThreshold}
              onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
              required
            />
          </label>

          <label className="block text-sm font-medium text-sage sm:col-span-2">
            Added by
            <select
              value={form.addedBy}
              onChange={(e) => setForm({ ...form, addedBy: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-2.5 text-paper outline-none focus:border-gold"
            >
              {household.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-5 py-2.5 border border-sage-dim/30 text-sage hover:text-paper hover:bg-shelf/50 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-gold px-6 py-2.5 text-shelf font-semibold hover:brightness-110 transition text-sm"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
