import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureFoodItemsTable } from "@/lib/dbInit";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await ensureFoodItemsTable();
    const { id } = params;
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, category, quantity, unit, location, days_left AS daysLeft, added_by AS addedBy, low_stock_threshold AS lowStockThreshold FROM food_items WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = {
      ...rows[0],
      quantity: Number(rows[0].quantity),
      lowStockThreshold: Number(rows[0].lowStockThreshold ?? 2),
    };

    return NextResponse.json(item);
  } catch (err) {
    console.error("GET /api/inventory/[id] error:", err);
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await ensureFoodItemsTable();
    const { id } = params;
    const body = await req.json();
    const { name, category, quantity, unit, location, daysLeft, addedBy, lowStockThreshold } = body ?? {};

    if (!name || quantity == null || !unit) {
      return NextResponse.json({ error: "Missing required fields: name, quantity, unit" }, { status: 400 });
    }

    const qtyNum = Number(quantity);
    const thresholdNum = Number(lowStockThreshold ?? 2);

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE food_items SET name = ?, category = ?, quantity = ?, unit = ?, location = ?, days_left = ?, added_by = ?, low_stock_threshold = ? WHERE id = ?",
      [name, category ?? null, qtyNum, unit, location ?? null, daysLeft ?? null, addedBy ?? null, thresholdNum, id]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Upsert a notification for this item to reflect the update
    const message = `Updated ${name}: ${qtyNum} ${unit} (${location || "unknown"})`;
    await pool.query(
      `INSERT INTO notifications (id, tone, message) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tone = VALUES(tone), message = VALUES(message), created_at = CURRENT_TIMESTAMP`,
      [`upd_${id}`, "update", message]
    );

    const updated = { id, name, category, quantity: qtyNum, unit, location, daysLeft, addedBy, lowStockThreshold: thresholdNum };

    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("PUT /api/inventory/[id] error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await ensureFoodItemsTable();
    const { id } = params;

    const [result] = await pool.query<ResultSetHeader>("DELETE FROM food_items WHERE id = ?", [id]);

    if (!result.affectedRows) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await pool.query("DELETE FROM notifications WHERE id = ?", [id]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/inventory/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
