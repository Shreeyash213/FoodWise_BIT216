import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { seedMealPlan } from "@/lib/data";

export async function createOrUpdateNotification(id: string, tone: string, message: string) {
  await pool.query(
    `INSERT INTO notifications (id, tone, message) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tone = VALUES(tone), message = VALUES(message), created_at = CURRENT_TIMESTAMP`,
    [id, tone, message]
  );
}

export async function checkExpiries() {
  // find items with days_left <= 2 (expiring soon)
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, days_left AS daysLeft, location FROM food_items WHERE days_left <= 2"
  );

  for (const r of rows) {
    const message = `${r.name} is expiring in ${r.daysLeft} day(s) (${r.location})`;
    await createOrUpdateNotification(`exp_${r.id}`, "expiry", message);
  }
}

export async function checkLowStock() {
  // find items with quantity <= low_stock_threshold
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, quantity, unit, low_stock_threshold AS lowStockThreshold FROM food_items WHERE quantity <= low_stock_threshold"
  );

  for (const r of rows) {
    const message = `${r.name} is running low — ${r.quantity} ${r.unit} left (threshold: ${r.lowStockThreshold} ${r.unit})`;
    await createOrUpdateNotification(`low_${r.id}`, "low-stock", message);
  }
}

export async function checkMealPlanNotifications() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, day, meal, uses_expiring AS usesExpiring FROM meal_plans WHERE uses_expiring = 1"
    );

    if (Array.isArray(rows) && rows.length > 0) {
      for (const r of rows) {
        const message = `${r.day}'s planned meal (${r.meal}) utilizes expiring inventory.`;
        await createOrUpdateNotification(`plan_${r.id || r.day}`, "plan", message);
      }
    } else {
      // Fallback check on seed plan or static notice
      for (const m of seedMealPlan.filter((s) => s.usesExpiring)) {
        const message = `${m.day}'s dinner (${m.meal}) is set up to clear expiring stock.`;
        await createOrUpdateNotification(`plan_${m.id || m.day}`, "plan", message);
      }
    }
  } catch (err) {
    console.error("checkMealPlanNotifications error:", err);
  }
}

export async function checkSystemNotifications() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN days_left <= 3 THEN 1 ELSE 0 END) AS expiringSoon FROM food_items"
    );

    const total = rows[0]?.total ?? 0;
    const expiringSoon = rows[0]?.expiringSoon ?? 0;

    const summaryMsg = `Weekly freshness report ready: ${total} item(s) tracked, ${expiringSoon} item(s) expiring within 3 days.`;
    await createOrUpdateNotification("sys_weekly_report", "system", summaryMsg);

    const syncMsg = "Kitchen database system synchronized and operating normally.";
    await createOrUpdateNotification("sys_status_ok", "system", syncMsg);
  } catch (err) {
    console.error("checkSystemNotifications error:", err);
  }
}

export async function checkNotifications() {
  await checkExpiries();
  await checkLowStock();
  await checkMealPlanNotifications();
  await checkSystemNotifications();
}
