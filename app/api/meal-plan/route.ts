import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureMealPlanTable } from "@/lib/dbInit";
import { RowDataPacket } from "mysql2";
import { seedMealPlan, MealSlot } from "@/lib/data";

export async function GET() {
  try {
    try {
      await ensureMealPlanTable();
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id, day, meal, uses_expiring AS usesExpiring FROM meal_plans"
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const result = rows.map((r) => ({
          id: r.id,
          day: r.day,
          meal: r.meal,
          usesExpiring: Boolean(r.usesExpiring),
        }));
        return NextResponse.json(result);
      }
    } catch (dbErr) {
      console.warn("DB query failed in GET /api/meal-plan, falling back to seed:", dbErr);
    }
    return NextResponse.json(seedMealPlan);
  } catch (err) {
    console.error("GET /api/meal-plan error:", err);
    return NextResponse.json({ error: "Failed to load meal plan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureMealPlanTable();
    const body = await req.json();
    const { day, meal, usesExpiring } = body ?? {};

    if (!day || meal == null) {
      return NextResponse.json({ error: "Missing required fields: day, meal" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO meal_plans (id, day, meal, uses_expiring) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE meal = VALUES(meal), uses_expiring = VALUES(uses_expiring)`,
      [`m_${day}`, day, meal, usesExpiring ? 1 : 0]
    );

    const planMsg = `Meal plan updated for ${day}: ${meal}${usesExpiring ? " (uses expiring stock)" : ""}`;
    await pool.query(
      `INSERT INTO notifications (id, tone, message) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tone = VALUES(tone), message = VALUES(message), created_at = CURRENT_TIMESTAMP`,
      [`plan_m_${day}`, "plan", planMsg]
    );

    return NextResponse.json({ ok: true, slot: { id: `m_${day}`, day, meal, usesExpiring: Boolean(usesExpiring) } });
  } catch (err) {
    console.error("PUT /api/meal-plan error:", err);
    return NextResponse.json({ error: "Failed to update meal plan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureMealPlanTable();
    const body = await req.json();
    if (body?.action === "reset") {
      await pool.query("DELETE FROM meal_plans");
      for (const m of seedMealPlan) {
        await pool.query(
          "INSERT INTO meal_plans (id, day, meal, uses_expiring) VALUES (?, ?, ?, ?)",
          [m.id || `m_${m.day}`, m.day, m.meal, m.usesExpiring ? 1 : 0]
        );
      }
      return NextResponse.json({ ok: true, plan: seedMealPlan });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/meal-plan error:", err);
    return NextResponse.json({ error: "Failed to reset meal plan" }, { status: 500 });
  }
}
