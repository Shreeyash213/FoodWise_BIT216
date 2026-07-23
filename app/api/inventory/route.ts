import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureFoodItemsTable } from "@/lib/dbInit";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    await ensureFoodItemsTable();
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, category, quantity, unit, location, days_left AS daysLeft, added_by AS addedBy, low_stock_threshold AS lowStockThreshold FROM food_items"
    );
    const items = rows.map((r) => ({
      ...r,
      quantity: Number(r.quantity),
      lowStockThreshold: Number(r.lowStockThreshold ?? 2),
    }));
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/inventory error:", err);
    return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    // ensure table exists
    await ensureFoodItemsTable();
    const body = await req.json();
    const { id, name, category, quantity, unit, location, daysLeft, addedBy, lowStockThreshold } = body ?? {};

    if (!name || quantity == null || !unit) {
      return NextResponse.json({ error: "Missing required fields: name, quantity, unit" }, { status: 400 });
    }

    const qtyNum = Number(quantity);
    const thresholdNum = Number(lowStockThreshold ?? 2);

    await pool.query(
      "INSERT INTO food_items (id, name, category, quantity, unit, location, days_left, added_by, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id ?? null, name, category ?? null, qtyNum, unit, location ?? null, daysLeft ?? null, addedBy ?? null, thresholdNum]
    );

    const created = {
      id: id ?? null,
      name,
      category: category ?? null,
      quantity: qtyNum,
      unit,
      location: location ?? null,
      daysLeft: daysLeft ?? null,
      addedBy: addedBy ?? null,
      lowStockThreshold: thresholdNum,
    };

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/inventory error:", err);
    return NextResponse.json({ error: "Failed to add inventory item" }, { status: 500 });
  }
}
