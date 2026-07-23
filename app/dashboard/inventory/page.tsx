"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import ItemEditModal from "@/components/ItemEditModal";
import FreshnessGauge from "@/components/FreshnessGauge";
import { FoodItem, seedInventory, seedHouseholdMembers } from "@/lib/data";

const locations = ["Fridge", "Freezer", "Pantry Shelf"] as const;
const categories = ["Produce", "Dairy", "Pantry", "Frozen", "Meat", "Bakery"] as const;
const commonUnits = ["g", "kg", "ml", "L", "pcs", "loaf", "pack", "can", "box", "oz", "items"];

type InventoryFormState = {
  name: string;
  category: typeof categories[number];
  quantity: number;
  unit: string;
  location: typeof locations[number];
  daysLeft: number;
  addedBy: string;
  lowStockThreshold: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<FoodItem[]>(seedInventory);
  const [household, setHousehold] = useState<string[]>(() => seedHouseholdMembers.map((m) => m.name));
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<InventoryFormState>({
    name: "",
    category: categories[0],
    quantity: 200,
    unit: "g",
    location: locations[0],
    daysLeft: 5,
    addedBy: "Asha",
    lowStockThreshold: 100,
  });

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data as FoodItem[]);
      })
      .catch((err) => console.error("Failed to load inventory", err));

    fetch("/api/household")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((m: { name: string }) => m.name);
          setHousehold(names);
          if (names.length > 0) {
            setFormState((cur) => ({ ...cur, addedBy: names[0] }));
          }
        }
      })
      .catch((err) => console.error("Failed to load household members", err));
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newItem: FoodItem = {
      id: "i" + Math.random().toString(36).slice(2, 9),
      name: formState.name || "New item",
      category: formState.category,
      quantity: Number(formState.quantity),
      unit: formState.unit || "pcs",
      location: formState.location,
      daysLeft: Number(formState.daysLeft),
      addedBy: formState.addedBy || (household[0] ?? "Asha"),
      lowStockThreshold: Number(formState.lowStockThreshold),
    };

    fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to create item");
        const data = await res.json();
        const created = data?.item ?? newItem;
        setItems((current) => [created, ...current]);
      })
      .catch((err) => {
        console.error(err);
        alert("Unable to save item");
      });

    setFormState({
      name: "",
      category: categories[0],
      quantity: 200,
      unit: "g",
      location: locations[0],
      daysLeft: 5,
      addedBy: household[0] ?? "Asha",
      lowStockThreshold: 100,
    });
    setShowForm(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this item?")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      setItems((cur) => cur.filter((i) => i.id !== id));
    } catch (err) {
      const error = err as Error;
      console.error(error);
      alert(error?.message || "Unable to delete item");
    }
  };

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const editItem = (item: FoodItem) => {
    setEditingItem(item);
  };

  const saveEditedItem = async (updated: FoodItem) => {
    try {
      const res = await fetch(`/api/inventory/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setItems((cur) => cur.map((i) => (i.id === updated.id ? data.item ?? updated : i)));
      setEditingItem(null);
    } catch (err) {
      const error = err as Error;
      console.error(error);
      alert(error?.message || "Unable to update item");
    }
  };

  const itemsByLocation = (location: typeof locations[number]) =>
    items.filter((item) => item.location === location);

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-6xl">
      <header className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="label-stamp font-mono text-[11px] text-sage-dim">Manage Food Inventory</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1 text-paper">What&apos;s in the house</h1>
          <p className="text-sage mt-2 max-w-xl">
            Everything the household has logged, grouped by where it lives.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="flex items-center gap-2 rounded-lg bg-gold text-shelf font-medium text-sm px-4 py-2.5 hover:brightness-110 transition shrink-0"
        >
          <Plus size={16} /> {showForm ? "Cancel" : "Add item"}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl bg-surface ring-1 ring-sage-dim/15 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-sage md:col-span-2">
              Item name
              <input
                value={formState.name}
                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="Spinach"
                required
              />
            </label>

            <label className="block text-sm font-medium text-sage">
              Quantity
              <input
                type="number"
                step="any"
                min="0"
                value={formState.quantity}
                onChange={(event) => setFormState({ ...formState, quantity: Number(event.target.value) })}
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="200"
                required
              />
            </label>

            <label className="block text-sm font-medium text-sage">
              Unit
              <select
                value={formState.unit}
                onChange={(event) => setFormState({ ...formState, unit: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
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
                value={formState.category}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    category: event.target.value as typeof categories[number],
                  })
                }
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-sage">
              Location
              <select
                value={formState.location}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    location: event.target.value as typeof locations[number],
                  })
                }
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-sage">
              Days left
              <input
                type="number"
                min={1}
                value={formState.daysLeft}
                onChange={(event) =>
                  setFormState({ ...formState, daysLeft: Number(event.target.value) })
                }
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                required
              />
            </label>

            <label className="block text-sm font-medium text-sage">
              Low stock threshold
              <input
                type="number"
                min={0}
                step="any"
                value={formState.lowStockThreshold}
                onChange={(event) =>
                  setFormState({ ...formState, lowStockThreshold: Number(event.target.value) })
                }
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                required
              />
            </label>

            <label className="block text-sm font-medium text-sage md:col-span-2">
              Added by
              <select
                value={formState.addedBy}
                onChange={(event) => setFormState({ ...formState, addedBy: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {household.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-shelf hover:brightness-110 transition"
          >
            Save item
          </button>
        </form>
      )}

      <div className="space-y-8">
        {locations.map((loc) => {
          const locationItems = itemsByLocation(loc);
          if (locationItems.length === 0) return null;
          return (
            <section key={loc}>
              <h2 className="font-display text-lg text-paper mb-3">{loc}</h2>
              <div className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-sage-dim/15 text-[10px] label-stamp font-mono text-sage-dim">
                  <span>Item</span>
                  <span>Qty</span>
                  <span className="hidden sm:block">Added by</span>
                  <span className="w-28">Freshness</span>
                  <span className="w-24">Actions</span>
                </div>
                <ul className="divide-y divide-sage-dim/10">
                  {locationItems.map((item) => {
                    const isLowStock = item.quantity <= item.lowStockThreshold;
                    return (
                      <li
                        key={item.id}
                        className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-paper text-sm font-medium">{item.name}</p>
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold px-2 py-0.5 text-[10px] font-mono" title={`Low stock (<= ${item.lowStockThreshold} ${item.unit})`}>
                                <AlertTriangle size={10} /> Low stock
                              </span>
                            )}
                          </div>
                          <p className="text-sage-dim text-xs font-mono">{item.category}</p>
                        </div>
                        <span className="text-sage text-sm font-mono">{item.quantity} {item.unit}</span>
                        <span className="hidden sm:block text-sage text-sm">{item.addedBy}</span>
                        <div className="w-28">
                          <FreshnessGauge daysLeft={item.daysLeft} compact />
                        </div>
                        <div className="w-24 flex items-center gap-2">
                          <button
                            onClick={() => editItem(item)}
                            className="rounded-md p-1 hover:bg-surface/60 text-sage hover:text-paper"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="rounded-md p-1 hover:bg-red-600/20 text-sage hover:text-red-400"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {editingItem && (
        <ItemEditModal item={editingItem} onClose={() => setEditingItem(null)} onSave={saveEditedItem} />
      )}
    </div>
  );
}
