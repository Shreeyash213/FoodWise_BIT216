import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { checkNotifications } from "@/lib/notifications";
import { ensureNotificationsTable } from "@/lib/dbInit";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    await ensureNotificationsTable();
    try {
      await checkNotifications();
    } catch (err) {
      console.error("checkNotifications failed:", err);
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, tone, message, is_read AS isRead, created_at AS createdAt FROM notifications ORDER BY created_at DESC"
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      tone: r.tone,
      message: r.message,
      isRead: Boolean(r.isRead),
      createdAt: r.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, tone, message, isRead } = body ?? {};
    if (!id || !tone || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO notifications (id, tone, message, is_read) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE tone = VALUES(tone), message = VALUES(message), is_read = VALUES(is_read), created_at = CURRENT_TIMESTAMP`,
      [id, tone, message, isRead ? 1 : 0]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureNotificationsTable();
    const body = await req.json();

    if (body?.markAllRead) {
      await pool.query("UPDATE notifications SET is_read = 1");
      return NextResponse.json({ ok: true, markAllRead: true });
    }

    const { id, isRead } = body ?? {};
    if (!id) {
      return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
    }

    const targetRead = isRead !== undefined ? (isRead ? 1 : 0) : 1;
    await pool.query("UPDATE notifications SET is_read = ? WHERE id = ?", [targetRead, id]);

    return NextResponse.json({ ok: true, id, isRead: Boolean(targetRead) });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureNotificationsTable();
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const clearAllParam = searchParams.get("clearAll");

    if (clearAllParam === "true") {
      await pool.query("DELETE FROM notifications");
      return NextResponse.json({ ok: true, clearAll: true });
    }

    if (idParam) {
      await pool.query("DELETE FROM notifications WHERE id = ?", [idParam]);
      return NextResponse.json({ ok: true, id: idParam });
    }

    // Check body if params are empty
    try {
      const body = await req.json();
      if (body?.clearAll) {
        await pool.query("DELETE FROM notifications");
        return NextResponse.json({ ok: true, clearAll: true });
      }
      if (body?.id) {
        await pool.query("DELETE FROM notifications WHERE id = ?", [body.id]);
        return NextResponse.json({ ok: true, id: body.id });
      }
    } catch {
      // Body reading ignored if query params handled
    }

    return NextResponse.json({ error: "Missing parameter id or clearAll" }, { status: 400 });
  } catch (err) {
    console.error("DELETE /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
