import pool from "@/lib/db";
import { checkExpiries } from "@/lib/notifications";
import { ensureNotificationsTable } from "@/lib/dbInit";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ensureNotificationsTable();
    try {
      await checkExpiries();
    } catch (err) {
      console.error("checkExpiries failed:", err);
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0"
    );

    const count = rows[0]?.count ?? 0;
    return NextResponse.json({ count: Number(count) });
  } catch (err) {
    console.error("GET /api/notifications/count error:", err);
    return NextResponse.json({ count: 0 });
  }
}