import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureFoodItemsTable } from "@/lib/dbInit";
import { RowDataPacket } from "mysql2";
import { computeAnalytics, FoodItem, seedInventory } from "@/lib/data";

export async function GET() {
  try {
    let items: FoodItem[] = seedInventory;

    try {
      await ensureFoodItemsTable();
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id, name, category, quantity, unit, location, days_left AS daysLeft, added_by AS addedBy, low_stock_threshold AS lowStockThreshold FROM food_items"
      );
      if (Array.isArray(rows) && rows.length > 0) {
        items = rows.map((r) => ({
          ...r,
          quantity: Number(r.quantity),
          lowStockThreshold: Number(r.lowStockThreshold ?? 2),
        })) as FoodItem[];
      }
    } catch (dbErr) {
      console.warn("DB query failed in GET /api/analytics, falling back to seed:", dbErr);
    }

    const analyticsData = computeAnalytics(items);
    return NextResponse.json(analyticsData);
  } catch (err) {
    console.error("GET /api/analytics error:", err);
    return NextResponse.json({ error: "Failed to compute analytics" }, { status: 500 });
  }
}
