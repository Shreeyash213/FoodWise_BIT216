import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { seedInventory, seedNotifications, seedMealPlan, seedHouseholdMembers } from "@/lib/data";

export async function ensureFoodItemsTable() {
  try {
    const [cols] = await pool.query<RowDataPacket[]>("SHOW COLUMNS FROM food_items LIKE 'unit'");
    if (!cols || cols.length === 0) {
      await pool.query("DROP TABLE IF EXISTS food_items");
    }
  } catch {
    // Table doesn't exist yet
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS food_items (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category ENUM('Produce','Dairy','Pantry','Frozen','Meat','Bakery') NOT NULL,
      quantity DOUBLE NOT NULL,
      unit VARCHAR(30) NOT NULL,
      location ENUM('Fridge','Freezer','Pantry Shelf') NOT NULL,
      days_left INT NOT NULL,
      added_by VARCHAR(50) NOT NULL,
      low_stock_threshold DOUBLE NOT NULL DEFAULT 2
    )
  `);

  // Seed if empty
  const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM food_items");
  if (rows[0]?.count === 0) {
    for (const item of seedInventory) {
      await pool.query(
        "INSERT INTO food_items (id, name, category, quantity, unit, location, days_left, added_by, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.name, item.category, item.quantity, item.unit, item.location, item.daysLeft, item.addedBy, item.lowStockThreshold]
      );
    }
  }
}

export async function ensureNotificationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      tone ENUM('expiry','low-stock','plan','system','update') NOT NULL,
      message VARCHAR(255) NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await pool.query("ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0");
  } catch {
    // column might already exist
  }

  // Seed if empty
  const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM notifications");
  if (rows[0]?.count === 0) {
    for (const n of seedNotifications) {
      await pool.query(
        "INSERT INTO notifications (id, tone, message, is_read) VALUES (?, ?, ?, ?)",
        [n.id, n.tone, n.message, n.isRead ? 1 : 0]
      );
    }
  }
}

export async function ensureMealPlanTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id VARCHAR(36) PRIMARY KEY,
      day VARCHAR(20) NOT NULL,
      meal VARCHAR(150) NOT NULL,
      uses_expiring TINYINT(1) NOT NULL DEFAULT 0
    )
  `);

  // Seed if empty
  const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM meal_plans");
  if (rows[0]?.count === 0) {
    for (const m of seedMealPlan) {
      await pool.query(
        "INSERT INTO meal_plans (id, day, meal, uses_expiring) VALUES (?, ?, ?, ?)",
        [m.id || `m_${m.day}`, m.day, m.meal, m.usesExpiring ? 1 : 0]
      );
    }
  }
}

export async function ensureHouseholdTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS household_members (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      privacy VARCHAR(100) NOT NULL
    )
  `);

  // Seed if empty
  const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM household_members");
  if (rows[0]?.count === 0) {
    for (const h of seedHouseholdMembers) {
      await pool.query(
        "INSERT INTO household_members (id, name, role, privacy) VALUES (?, ?, ?, ?)",
        [h.id || `h_${h.name}`, h.name, h.role, h.privacy]
      );
    }
  }
}

const dbInit = { ensureFoodItemsTable, ensureNotificationsTable, ensureMealPlanTable, ensureHouseholdTable };
export default dbInit;
