import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureFoodItemsTable, ensureMealPlanTable } from "@/lib/dbInit";
import { RowDataPacket } from "mysql2";
import { computeStats, FoodItem, MealSlot, seedInventory, seedMealPlan } from "@/lib/data";

export async function GET() {
  try {
    let items: FoodItem[] = seedInventory;
    let slots: MealSlot[] = seedMealPlan;

    try {
      await ensureFoodItemsTable();
      await ensureMealPlanTable();

      const [itemRows] = await pool.query<RowDataPacket[]>(
        "SELECT id, name, category, quantity, unit, location, days_left AS daysLeft, added_by AS addedBy, low_stock_threshold AS lowStockThreshold FROM food_items"
      );
      if (Array.isArray(itemRows) && itemRows.length > 0) {
        items = itemRows.map((r) => ({
          ...r,
          quantity: Number(r.quantity),
          lowStockThreshold: Number(r.lowStockThreshold ?? 2),
        })) as FoodItem[];
      }

      const [mealRows] = await pool.query<RowDataPacket[]>(
        "SELECT id, day, meal, uses_expiring AS usesExpiring FROM meal_plans"
      );
      if (Array.isArray(mealRows) && mealRows.length > 0) {
        slots = mealRows.map((r) => ({
          id: r.id,
          day: r.day,
          meal: r.meal,
          usesExpiring: Boolean(r.usesExpiring),
        }));
      }
    } catch (dbErr) {
      console.warn("DB query failed in GET /api/stats, falling back to dynamic compute:", dbErr);
    }

    const calculatedStats = computeStats(items, slots);
    return NextResponse.json(calculatedStats);
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ error: "Failed to compute stats" }, { status: 500 });
  }
}
